import { Router } from "express";
import { z } from "zod";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { evaluateAchievements } from "../services/achievements";
import { recordXpEvent } from "../services/gamification";
async function recalculateHabitStreak(habitId: number): Promise<number> {
    const rows = await store.all(`
    SELECT DISTINCT date(completed_on) AS day
    FROM habit_logs
    WHERE habit_id = ? AND is_completed = 1
    ORDER BY day DESC
  `, [habitId]) as Array<{
        day: string;
    }>;
    let streak = 0;
    let expected = new Date();
    expected.setHours(0, 0, 0, 0);
    let first = true;
    for (const row of rows) {
        const current = new Date(`${row.day}T00:00:00`);
        const diffDays = Math.round((expected.getTime() - current.getTime()) / 86400000);
        if (first && diffDays !== 0)
            return 0;
        first = false;
        if (diffDays === 0) {
            streak += 1;
            expected.setDate(expected.getDate() - 1);
            continue;
        }
        if (diffDays === 1) {
            streak += 1;
            expected = current;
            expected.setDate(expected.getDate() - 1);
            continue;
        }
        break;
    }
    await store.run("UPDATE habits SET current_streak = ?, longest_streak = MAX(longest_streak, ?) WHERE id = ?", [streak, streak, habitId]);
    return streak;
}
const habitSchema = z.object({
    name: z.string().trim().min(1).max(120),
    description: z.string().max(500).default(""),
    frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
    category: z.string().trim().min(1).max(80),
    customSchedule: z.string().max(500).nullable().optional(),
    goalId: z.number().int().positive().nullable().optional(),
});
export const habitsRouter = Router();
habitsRouter.use(requireAuth);
habitsRouter.use(requireChild);
habitsRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    response.json(await store.all(`
    SELECT h.*, EXISTS(
      SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime')
    ) AS completed_today
    FROM habits h WHERE h.user_id = ? ORDER BY h.is_active DESC, h.id DESC
  `, [user.id]));
});
habitsRouter.post("/", async (request, response) => {
    const parsed = habitSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const user = authenticatedUser(response.locals);
    if (parsed.data.goalId && !await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [parsed.data.goalId, user.id]))
        return response.status(400).json({ error: "Linked goal is not available." });
    const result = await store.run(`
    INSERT INTO habits (user_id, goal_id, name, description, frequency, custom_schedule, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [user.id, parsed.data.goalId ?? null, parsed.data.name, parsed.data.description, parsed.data.frequency, parsed.data.customSchedule ?? null, parsed.data.category]);
    return response.status(201).json(await store.get("SELECT * FROM habits WHERE id = ?", [Number(result.lastInsertRowid)]));
});
habitsRouter.put("/:id", async (request, response) => {
    const parsed = habitSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const user = authenticatedUser(response.locals);
    if (parsed.data.goalId && !await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [parsed.data.goalId, user.id]))
        return response.status(400).json({ error: "Linked goal is not available." });
    const result = await store.run(`
    UPDATE habits SET goal_id = ?, name = ?, description = ?, frequency = ?, custom_schedule = ?, category = ?
    WHERE id = ? AND user_id = ?
  `, [parsed.data.goalId ?? null, parsed.data.name, parsed.data.description, parsed.data.frequency, parsed.data.customSchedule ?? null, parsed.data.category, request.params.id, user.id]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Habit not found." });
    return response.json(await store.get("SELECT * FROM habits WHERE id = ?", [request.params.id]));
});
habitsRouter.delete("/:id", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const result = await store.run("DELETE FROM habits WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Habit not found." });
    return response.status(204).send();
});
habitsRouter.post("/:id/log", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const habit = await store.get("SELECT id FROM habits WHERE id = ? AND user_id = ? AND is_active = 1", [request.params.id, user.id]);
    if (!habit)
        return response.status(404).json({ error: "Habit not found." });
    const existing = await store.get("SELECT id FROM habit_logs WHERE habit_id = ? AND completed_on = date('now','localtime')", [request.params.id]) as {
        id: number;
    } | undefined;
    await store.run(`
    INSERT INTO habit_logs (habit_id, completed_on, is_completed, note)
    VALUES (?, date('now','localtime'), 1, ?)
    ON CONFLICT(habit_id, completed_on) DO UPDATE SET is_completed = 1, note = excluded.note
  `, [request.params.id, typeof request.body?.note === "string" ? request.body.note.slice(0, 500) : ""]);
    const log = await store.get<Record<string, unknown>>("SELECT * FROM habit_logs WHERE habit_id = ? AND completed_on = date('now','localtime')", [request.params.id]);
    const streak = await recalculateHabitStreak(Number(request.params.id));
    if (!existing) {
        const habitData = await store.get("SELECT id, xp_reward FROM habits WHERE id = ?", [request.params.id]) as {
            id: number;
            xp_reward: number;
        };
        let progression = await recordXpEvent(user.id, habitData.xp_reward, "habit", habitData.id, "Completed habit");
        if (streak === 7 && !await store.get("SELECT 1 FROM xp_events WHERE user_id = ? AND source_type = 'habit_streak' AND source_id = ?", [user.id, habitData.id])) {
            progression = await recordXpEvent(user.id, 50, "habit_streak", habitData.id, "Reached a seven-day habit streak");
        }
        const unlockedAchievements = await evaluateAchievements(user.id);
        return response.status(201).json({ ...log, streak, progression, unlockedAchievements });
    }
    return response.status(200).json({ ...log, streak });
});
habitsRouter.get("/:id/logs", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const habit = await store.get("SELECT id FROM habits WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    if (!habit)
        return response.status(404).json({ error: "Habit not found." });
    return response.json(await store.all("SELECT * FROM habit_logs WHERE habit_id = ? AND completed_on >= date('now','localtime','-29 days') ORDER BY completed_on DESC", [request.params.id]));
});
