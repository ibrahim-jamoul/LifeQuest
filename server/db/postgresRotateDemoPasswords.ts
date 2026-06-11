import { hashPassword } from "../services/auth";
import { createPostgresPool, withPostgresTransaction } from "./postgres";

const childPassword = process.env.CHILD_PASSWORD;
const parentPassword = process.env.PARENT_PASSWORD;
if (!childPassword || childPassword.length < 12) throw new Error("CHILD_PASSWORD must contain at least 12 characters.");
if (!parentPassword || parentPassword.length < 12) throw new Error("PARENT_PASSWORD must contain at least 12 characters.");
if (childPassword === parentPassword) throw new Error("Child and parent passwords must be different.");

const pool = createPostgresPool(true);
try {
  await withPostgresTransaction(pool, async (client) => {
    const child = await client.query(
      "update public.users set password_hash = $1, updated_at = current_timestamp where email = $2",
      [hashPassword(childPassword), "child@lifequest.local"],
    );
    const parent = await client.query(
      "update public.users set password_hash = $1, updated_at = current_timestamp where email = $2",
      [hashPassword(parentPassword), "parent@lifequest.local"],
    );
    if (child.rowCount !== 1 || parent.rowCount !== 1) {
      throw new Error("The imported child and parent demo accounts were not both found.");
    }
    await client.query("delete from public.auth_sessions");
  });
  console.log("Demo account passwords rotated and all existing sessions revoked.");
} finally {
  await pool.end();
}
