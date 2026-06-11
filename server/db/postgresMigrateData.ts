import { db } from "./database";
import { createPostgresPool, withPostgresTransaction } from "./postgres";
import { postgresTables, type PostgresTable } from "./postgresTables";

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_identity: "YES" | "NO";
}

type SqliteValue = string | number | bigint | null | Uint8Array;
type SqliteRow = Record<string, SqliteValue>;

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function sqliteRows(table: PostgresTable): SqliteRow[] {
  return db.prepare(`select * from ${quoteIdentifier(table)}`).all() as SqliteRow[];
}

function postgresValue(value: SqliteValue, dataType: string): SqliteValue | boolean {
  if (value === null) return null;
  if (dataType === "boolean") return value === 1 || value === "1" || value === "true";
  return value;
}

const pool = createPostgresPool(true);

try {
  await withPostgresTransaction(pool, async (client) => {
    await client.query("set constraints all deferred");

    for (const table of postgresTables) {
      const rows = sqliteRows(table);
      if (rows.length === 0) {
        console.log(`${table}: no local rows to migrate`);
        continue;
      }

      const columns = (await client.query<ColumnInfo>(
        `select column_name, data_type, is_identity
         from information_schema.columns
         where table_schema = 'public' and table_name = $1
         order by ordinal_position`,
        [table],
      )).rows;
      if (columns.length === 0) throw new Error(`Missing PostgreSQL table: ${table}`);
      const columnByName = new Map(columns.map((column) => [column.column_name, column]));
      const names = Object.keys(rows[0]).filter((name) => columnByName.has(name));
      const quotedNames = names.map(quoteIdentifier).join(", ");
      const placeholders = names.map((_, index) => `$${index + 1}`).join(", ");
      const identityOverride = columns.some((column) => column.is_identity === "YES")
        ? " overriding system value"
        : "";

      for (const row of rows) {
        const values = names.map((name) => postgresValue(row[name], columnByName.get(name)?.data_type ?? ""));
        await client.query(
          `insert into public.${quoteIdentifier(table)} (${quotedNames})
           ${identityOverride} values (${placeholders})
           on conflict do nothing`,
          values,
        );
      }
      console.log(`${table}: migrated ${rows.length} local row(s)`);
    }

    for (const table of postgresTables) {
      const hasIdentity = await client.query<{ exists: boolean }>(
        `select exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = $1 and column_name = 'id' and is_identity = 'YES'
        ) as exists`,
        [table],
      );
      if (hasIdentity.rows[0]?.exists) {
        await client.query(
          `select setval(
            pg_get_serial_sequence($1, 'id'),
            greatest(coalesce((select max(id) from public.${quoteIdentifier(table)}), 1), 1),
            (select count(*) > 0 from public.${quoteIdentifier(table)})
          )`,
          [`public.${table}`],
        );
      }
    }
  });
  console.log("SQLite data migration to Supabase completed.");
} finally {
  await pool.end();
}
