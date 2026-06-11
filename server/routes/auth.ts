import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
import { authenticatedUser, requireAuth } from "../middleware/auth";
import { createSession, deleteSession, verifyPassword } from "../services/auth";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  age: z.number().int().min(7).max(16).nullable().optional(),
  grade: z.string().trim().max(40).nullable().optional(),
});
export const authRouter = Router();

authRouter.post("/login", (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const user = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(parsed.data.email.toLowerCase()) as { id: number; password_hash: string } | undefined;
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) return response.status(401).json({ error: "Invalid email or password." });
  return response.json({ token: createSession(user.id) });
});

authRouter.get("/me", requireAuth, (_request, response) => {
  const user = authenticatedUser(response.locals);
  const profile = user.role === "child"
    ? db.prepare("SELECT age, grade, age_group, village_level, parent_id FROM child_profiles WHERE user_id = ?").get(user.id)
    : db.prepare("SELECT id FROM parent_profiles WHERE user_id = ?").get(user.id);
  response.json({ user, profile });
});

authRouter.post("/logout", requireAuth, (_request, response) => {
  deleteSession(response.locals.token as string);
  response.status(204).send();
});

authRouter.put("/profile", requireAuth, (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = profileSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(parsed.data.displayName, user.id);
    if (user.role === "child") {
      db.prepare("UPDATE child_profiles SET age = ?, grade = ? WHERE user_id = ?").run(parsed.data.age ?? null, parsed.data.grade ?? null, user.id);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const updatedUser = { ...user, displayName: parsed.data.displayName };
  const profile = user.role === "child"
    ? db.prepare("SELECT age, grade, age_group, village_level, parent_id FROM child_profiles WHERE user_id = ?").get(user.id)
    : db.prepare("SELECT id FROM parent_profiles WHERE user_id = ?").get(user.id);
  return response.json({ user: updatedUser, profile });
});
