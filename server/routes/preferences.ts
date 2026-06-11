import { Router } from "express";
import { z } from "zod";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
const schema = z.object({
    onboardingCompleted: z.boolean(),
    habitReminders: z.boolean(),
    reviewReminders: z.boolean(),
    pushReminders: z.boolean().default(false),
});
export const preferencesRouter = Router();
preferencesRouter.use(requireAuth, requireChild);
preferencesRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    await store.run("INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)", [user.id]);
    response.json(await store.get("SELECT * FROM user_preferences WHERE user_id = ?", [user.id]));
});
preferencesRouter.put("/", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const parsed = schema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    await store.run(`INSERT INTO user_preferences (user_id, onboarding_completed, habit_reminders, review_reminders, push_reminders)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET onboarding_completed = excluded.onboarding_completed,
    habit_reminders = excluded.habit_reminders, review_reminders = excluded.review_reminders,
    push_reminders = excluded.push_reminders, updated_at = CURRENT_TIMESTAMP`,
    [user.id, parsed.data.onboardingCompleted, parsed.data.habitReminders, parsed.data.reviewReminders, parsed.data.pushReminders]);
    response.json(await store.get("SELECT * FROM user_preferences WHERE user_id = ?", [user.id]));
});
