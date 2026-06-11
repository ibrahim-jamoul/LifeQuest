import { createPostgresPool } from "./postgres";
import type { SQLInputValue } from "node:sqlite";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { QueryResult, QueryResultRow } from "pg";

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export interface Store {
  get<T>(sql: string, values?: unknown[]): Promise<T | undefined>;
  all<T>(sql: string, values?: unknown[]): Promise<T[]>;
  run(sql: string, values?: unknown[]): Promise<RunResult>;
  transaction<T>(operation: (store: Store) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

function sqliteStore(): Store {
  const require = createRequire(import.meta.url);
  const { DatabaseSync } = require("node:sqlite") as typeof import("node:sqlite");
  const databasePath = resolve(process.env.DATABASE_PATH ?? "./data/lifequest.db");
  mkdirSync(dirname(databasePath), { recursive: true });
  const sqlite = new DatabaseSync(databasePath);
  sqlite.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  const sqliteValues = (values: unknown[]) => values.map((value) => typeof value === "boolean" ? Number(value) : value) as SQLInputValue[];
  const store: Store = {
    async get<T>(sql: string, values: unknown[] = []) {
      return sqlite.prepare(sql).get(...sqliteValues(values)) as T | undefined;
    },
    async all<T>(sql: string, values: unknown[] = []) {
      return sqlite.prepare(sql).all(...sqliteValues(values)) as T[];
    },
    async run(sql: string, values: unknown[] = []) {
      const result = sqlite.prepare(sql).run(...sqliteValues(values));
      return { changes: Number(result.changes), lastInsertRowid: Number(result.lastInsertRowid) };
    },
    async transaction<T>(operation: (transactionStore: Store) => Promise<T>) {
      sqlite.exec("begin immediate");
      try {
        const result = await operation(store);
        sqlite.exec("commit");
        return result;
      } catch (error) {
        sqlite.exec("rollback");
        throw error;
      }
    },
    async close() {},
  };
  return store;
}

function replaceQuestionMarks(sql: string): string {
  let index = 0;
  return sql.replaceAll("?", () => `$${++index}`);
}

const booleanColumns = [
  "is_completed",
  "is_active",
  "validated_by_parent",
  "unlocked",
  "is_read",
  "onboarding_completed",
  "habit_reminders",
  "review_reminders",
  "push_reminders",
];

function postgresSql(sql: string): string {
  let translated = sql
    .replaceAll("date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days')", "date_trunc('week', current_date)::date")
    .replaceAll("strftime('%Y-%m','now','localtime')", "to_char(current_date, 'YYYY-MM')")
    .replaceAll("date('now','localtime')", "current_date")
    .replaceAll("date('now')", "current_date")
    .replaceAll("datetime('now','-29 days')", "(current_timestamp - interval '29 days')")
    .replaceAll("datetime('now','-7 days')", "(current_timestamp - interval '7 days')")
    .replaceAll("date('now','localtime','-29 days')", "(current_date - interval '29 days')::date")
    .replaceAll("date('now','-29 days')", "(current_date - interval '29 days')::date")
    .replaceAll("date('now','localtime','-7 days')", "(current_date - interval '7 days')::date")
    .replaceAll("date('now','localtime','start of month')", "date_trunc('month', current_date)::date")
    .replaceAll("date('now','localtime','weekday 1','-7 days')", "date_trunc('week', current_date)::date")
    .replace(/date\(([\w.]+),\s*'localtime'\)/g, "$1::date")
    .replace(/date\(([\w.]+)\)/g, "$1::date")
    .replaceAll("INSERT OR IGNORE", "INSERT")
    .replaceAll("MAX(village_state.progress, excluded.progress)", "GREATEST(village_state.progress, excluded.progress)")
    .replaceAll("MAX(village_state.level, excluded.level)", "GREATEST(village_state.level, excluded.level)")
    .replaceAll("MAX(longest_streak, ?)", "GREATEST(longest_streak, ?)")
    .replaceAll("MAX(village_level, ?)", "GREATEST(village_level, ?)")
    .replaceAll("MAX(progress, ?)", "GREATEST(progress, ?)");

  for (const column of booleanColumns) {
    translated = translated
      .replace(new RegExp(`\\b${column}\\s*=\\s*1\\b`, "g"), `${column} = true`)
      .replace(new RegExp(`\\b${column}\\s*=\\s*0\\b`, "g"), `${column} = false`)
      .replace(new RegExp(`(\\b${column}\\b[^)]*values\\s*\\([^)]*),\\s*1\\s*\\)`, "i"), "$1, true)")
      .replace(new RegExp(`(\\b${column}\\b[^)]*values\\s*\\([^)]*),\\s*0\\s*\\)`, "i"), "$1, false)");
  }
  return replaceQuestionMarks(translated);
}

function addConflictFallback(sql: string): string {
  if (!/^\s*insert\s+/i.test(sql) || /\bon conflict\b/i.test(sql)) return sql;
  return `${sql} on conflict do nothing`;
}

function postgresStore(): Store {
  const pool = createPostgresPool();
  type QueryExecutor = <T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) => Promise<QueryResult<T>>;
  const createStore = (query: QueryExecutor): Store => ({
    async get<T>(sql: string, values: unknown[] = []) {
      const result = await query(postgresSql(sql), values);
      return result.rows[0] as T | undefined;
    },
    async all<T>(sql: string, values: unknown[] = []) {
      const result = await query(postgresSql(sql), values);
      return result.rows as T[];
    },
    async run(sql: string, values: unknown[] = []) {
      let translated = postgresSql(sql);
      const ignoredInsert = /INSERT OR IGNORE/i.test(sql);
      if (ignoredInsert) translated = addConflictFallback(translated);
      const table = translated.match(/^\s*insert\s+into\s+["']?([\w-]+)/i)?.[1];
      const tablesWithId = new Set([
        "users", "life_areas", "goals", "projects", "milestones", "tasks", "habits", "habit_logs",
        "notes", "reviews", "xp_events", "achievements", "user_achievements", "focus_priorities",
        "weekly_challenges", "parent_child_missions", "discovery_domains", "discovery_challenges",
        "discovery_completions", "village_state", "auth_sessions", "school_campaigns",
        "campaign_chapters", "notifications",
      ]);
      const wantsId = Boolean(table && tablesWithId.has(table)) && !/\breturning\b/i.test(translated);
      if (wantsId) translated = `${translated} returning id`;
      const result = await query(translated, values);
      return {
        changes: result.rowCount ?? 0,
        lastInsertRowid: Number((result.rows[0] as { id?: string | number } | undefined)?.id ?? 0),
      };
    },
    async transaction<T>(operation: (transactionStore: Store) => Promise<T>) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await operation(createStore((text, values) => client.query(text, values)));
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  });
  return createStore((text, values) => pool.query(text, values));
}

export const store = process.env.DATABASE_URL ? postgresStore() : sqliteStore();
