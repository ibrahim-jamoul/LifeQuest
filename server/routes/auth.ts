import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { store } from "../db/store";
import { authenticatedUser, requireAuth } from "../middleware/auth";
import { createSession, deleteSession, verifyPassword } from "../services/auth";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  age: z.number().int().min(7).max(16).nullable().optional(),
  grade: z.string().trim().max(40).nullable().optional(),
});
export const authRouter = Router();
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many login attempts. Try again later." },
});

authRouter.post("/login", loginLimiter, async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const user = await store.get<{ id: number; password_hash: string }>("SELECT id, password_hash FROM users WHERE email = ?", [parsed.data.email.toLowerCase()]);
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) return response.status(401).json({ error: "Invalid email or password." });
  return response.json({ token: await createSession(user.id) });
});

authRouter.get("/me", requireAuth, async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const profile = user.role === "child"
    ? await store.get("SELECT age, grade, age_group, village_level, parent_id FROM child_profiles WHERE user_id = ?", [user.id])
    : await store.get("SELECT id FROM parent_profiles WHERE user_id = ?", [user.id]);
  response.json({ user, profile });
});

authRouter.post("/logout", requireAuth, async (_request, response) => {
  await deleteSession(response.locals.token as string);
  response.status(204).send();
});

authRouter.put("/profile", requireAuth, async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = profileSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  await store.transaction(async (transaction) => {
    await transaction.run("UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [parsed.data.displayName, user.id]);
    if (user.role === "child") {
      await transaction.run("UPDATE child_profiles SET age = ?, grade = ? WHERE user_id = ?", [parsed.data.age ?? null, parsed.data.grade ?? null, user.id]);
    }
  });
  const updatedUser = { ...user, displayName: parsed.data.displayName };
  const profile = user.role === "child"
    ? await store.get("SELECT age, grade, age_group, village_level, parent_id FROM child_profiles WHERE user_id = ?", [user.id])
    : await store.get("SELECT id FROM parent_profiles WHERE user_id = ?", [user.id]);
  return response.json({ user: updatedUser, profile });
});
