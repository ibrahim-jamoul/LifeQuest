import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { store } from "../db/store";
import type { AuthUser, UserRole } from "../types/auth";

const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString().replace("T", " ").slice(0, 19);
  await store.run("INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)", [userId, hashToken(token), expiresAt]);
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await store.run("DELETE FROM auth_sessions WHERE token_hash = ?", [hashToken(token)]);
}

export async function getSessionUser(token: string): Promise<AuthUser | null> {
  const row = await store.get<{ id: number; email: string; display_name: string; role: UserRole }>(`
    SELECT u.id, u.email, u.display_name,
      CASE WHEN cp.user_id IS NOT NULL THEN 'child' ELSE 'parent' END AS role
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN child_profiles cp ON cp.user_id = u.id
    LEFT JOIN parent_profiles pp ON pp.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP
      AND (cp.user_id IS NOT NULL OR pp.user_id IS NOT NULL)
  `, [hashToken(token)]);
  return row ? { id: row.id, email: row.email, displayName: row.display_name, role: row.role } : null;
}

export function getBearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}
