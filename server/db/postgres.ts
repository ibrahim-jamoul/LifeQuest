import { Pool, type PoolClient, type QueryResultRow } from "pg";

function requiredDatabaseUrl(preferDirectConnection: boolean): string {
  const databaseUrl = preferDirectConnection
    ? process.env.DIRECT_URL ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. DIRECT_URL is recommended for migration commands.");
  }
  return databaseUrl;
}

export function createPostgresPool(preferDirectConnection = false): Pool {
  const useSsl = process.env.DATABASE_SSL !== "false";
  return new Pool({
    connectionString: requiredDatabaseUrl(preferDirectConnection),
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 3,
    connectionTimeoutMillis: 10_000,
  });
}

export async function withPostgresTransaction<T>(
  pool: Pool,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await operation(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function queryRows<T extends QueryResultRow>(
  pool: Pool,
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  return (await pool.query<T>(text, values)).rows;
}
