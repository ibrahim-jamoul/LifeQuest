import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";

const schema = z.object({
  onboardingCompleted: z.boolean(),
  habitReminders: z.boolean(),
  reviewReminders: z.boolean(),
});
export const preferencesRouter = Router();
preferencesRouter.use(requireAuth, requireChild);
preferencesRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  db.prepare("INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)").run(user.id);
  response.json(db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(user.id));
});
preferencesRouter.put("/", (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  db.prepare(`INSERT INTO user_preferences (user_id, onboarding_completed, habit_reminders, review_reminders)
    VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET onboarding_completed = excluded.onboarding_completed,
    habit_reminders = excluded.habit_reminders, review_reminders = excluded.review_reminders, updated_at = CURRENT_TIMESTAMP`)
    .run(user.id, Number(parsed.data.onboardingCompleted), Number(parsed.data.habitReminders), Number(parsed.data.reviewReminders));
  response.json(db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(user.id));
});
