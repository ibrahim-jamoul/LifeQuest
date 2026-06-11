import { randomUUID } from "node:crypto";
import { createPostgresPool } from "./postgres";

const pool = createPostgresPool(true);
const client = await pool.connect();

try {
  await client.query("begin");
  const email = `supabase-smoke-${randomUUID()}@lifequest.local`;
  const inserted = await client.query<{ id: string }>(
    `insert into public.users (email, password_hash, display_name)
     values ($1, $2, $3)
     returning id::text`,
    [email, "smoke-test-only", "Supabase Smoke Test"],
  );
  const userId = inserted.rows[0]?.id;
  if (!userId) throw new Error("PostgreSQL insert did not return a user id.");

  const selected = await client.query<{ email: string }>(
    "select email from public.users where id = $1",
    [userId],
  );
  if (selected.rows[0]?.email !== email) throw new Error("PostgreSQL read-after-write failed.");

  await client.query("rollback");
  console.log("Supabase read/write smoke test passed. Test transaction was rolled back.");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
