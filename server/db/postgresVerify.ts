import { createPostgresPool, queryRows } from "./postgres";
import { postgresTables } from "./postgresTables";

interface TableStatus {
  table_name: string;
  row_security: boolean;
}

const requiredAdvancedColumns = [
  ["child_profiles", "avatar_icon"],
  ["child_profiles", "avatar_color"],
  ["user_preferences", "push_reminders"],
] as const;

const pool = createPostgresPool(true);

try {
  const server = await queryRows<{ database: string; version: string }>(
    pool,
    "select current_database() as database, version() as version",
  );
  const statuses = await queryRows<TableStatus>(
    pool,
    `select c.relname as table_name, c.relrowsecurity as row_security
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r'
     order by c.relname`,
  );
  const statusByTable = new Map(statuses.map((status) => [status.table_name, status]));
  const missing = postgresTables.filter((table) => !statusByTable.has(table));
  const withoutRls = postgresTables.filter((table) => !statusByTable.get(table)?.row_security);
  const advancedColumns = await queryRows<{ table_name: string; column_name: string }>(
    pool,
    `select table_name, column_name
     from information_schema.columns
     where table_schema = 'public'
       and ((table_name = 'child_profiles' and column_name in ('avatar_icon', 'avatar_color'))
         or (table_name = 'user_preferences' and column_name = 'push_reminders'))`,
  );
  const advancedColumnSet = new Set(advancedColumns.map((column) => `${column.table_name}.${column.column_name}`));
  const missingAdvancedColumns = requiredAdvancedColumns
    .map(([table, column]) => `${table}.${column}`)
    .filter((column) => !advancedColumnSet.has(column));

  console.log(`Connected to PostgreSQL database: ${server[0]?.database ?? "unknown"}`);
  console.log(`Expected tables: ${postgresTables.length}; present: ${postgresTables.length - missing.length}`);
  console.log(`RLS enabled: ${postgresTables.length - withoutRls.length}/${postgresTables.length}`);
  console.log(`Advanced columns: ${requiredAdvancedColumns.length - missingAdvancedColumns.length}/${requiredAdvancedColumns.length}`);
  for (const table of postgresTables) {
    if (!statusByTable.has(table)) continue;
    const count = await pool.query<{ count: string }>(`select count(*)::text as count from public."${table}"`);
    console.log(`${table}: ${count.rows[0]?.count ?? "0"} row(s)`);
  }

  if (missing.length > 0) throw new Error(`Missing tables: ${missing.join(", ")}`);
  if (withoutRls.length > 0) throw new Error(`RLS is disabled on: ${withoutRls.join(", ")}`);
  if (missingAdvancedColumns.length > 0) throw new Error(`Missing advanced columns: ${missingAdvancedColumns.join(", ")}`);
  console.log("Supabase schema verification passed.");
} finally {
  await pool.end();
}
