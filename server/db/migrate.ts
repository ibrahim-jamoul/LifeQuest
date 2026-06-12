import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./database";

const currentDir = dirname(fileURLToPath(import.meta.url));

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationDir = join(currentDir, "migrations");
  const applied = new Set(
    (db.prepare("SELECT version FROM schema_migrations").all() as Array<{ version: string }>).map((row) => row.version),
  );

  for (const file of readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort()) {
    if (applied.has(file)) continue;
    let sql = readFileSync(join(migrationDir, file), "utf8");
    const existingColumns = new Set([
      ...(db.prepare("PRAGMA table_info(child_profiles)").all() as Array<{ name: string }>).map((column) => `child_profiles.${column.name}`),
      ...(db.prepare("PRAGMA table_info(user_preferences)").all() as Array<{ name: string }>).map((column) => `user_preferences.${column.name}`),
    ]);
    sql = sql
      .split(/\r?\n/)
      .filter((line) => {
        const addition = line.match(/^\s*ALTER TABLE\s+(\w+)\s+ADD COLUMN\s+(\w+)/i);
        return !addition || !existingColumns.has(`${addition[1]}.${addition[2]}`);
      })
      .join("\n");
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(file);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}
