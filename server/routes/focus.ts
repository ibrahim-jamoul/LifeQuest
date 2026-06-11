import { Router } from "express";
import { z } from "zod";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { recordXpEvent } from "../services/gamification";
import { evaluateAchievements } from "../services/achievements";
const focusSchema = z.object({
    goalId: z.number().int().positive().nullable().optional(),
    projectId: z.number().int().positive().nullable().optional(),
    priorityType: z.enum(["main", "secondary"]),
}).refine((value) => Boolean(value.goalId) !== Boolean(value.projectId), "Choose exactly one goal or project.");
const challengeSchema = z.object({ title: z.string().trim().min(1).max(160), description: z.string().max(500).default(""), target: z.number().int().min(1).max(100).default(1) });
export const focusRouter = Router();
focusRouter.use(requireAuth, requireChild);
const weekStartSql = "date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days')";
focusRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    const week = await store.get(`SELECT ${weekStartSql} AS value`, []) as {
        value: string;
    };
    const priorities = await store.all(`
    SELECT fp.*, g.title AS goal_title, p.title AS project_title
    FROM focus_priorities fp LEFT JOIN goals g ON g.id = fp.goal_id LEFT JOIN projects p ON p.id = fp.project_id
    WHERE fp.user_id = ? AND fp.week_start = ? ORDER BY CASE fp.priority_type WHEN 'main' THEN 0 ELSE 1 END
  `, [user.id, week.value]);
    const challenges = await store.all("SELECT * FROM weekly_challenges WHERE user_id = ? AND week_start = ? ORDER BY id DESC", [user.id, week.value]);
    response.json({ weekStart: week.value, priorities, challenges });
});
focusRouter.post("/", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const parsed = focusSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const week = await store.get(`SELECT ${weekStartSql} AS value`, []) as {
        value: string;
    };
    const limit = parsed.data.priorityType === "main" ? 1 : 2;
    const count = (await store.get("SELECT COUNT(*) AS count FROM focus_priorities WHERE user_id = ? AND week_start = ? AND priority_type = ?", [user.id, week.value, parsed.data.priorityType]) as {
        count: number;
    }).count;
    if (count >= limit)
        return response.status(409).json({ error: parsed.data.priorityType === "main" ? "Only one main priority is allowed." : "Only two secondary priorities are allowed." });
    if (parsed.data.goalId && !await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [parsed.data.goalId, user.id]))
        return response.status(404).json({ error: "Goal not found." });
    if (parsed.data.projectId && !await store.get("SELECT id FROM projects WHERE id = ? AND user_id = ?", [parsed.data.projectId, user.id]))
        return response.status(404).json({ error: "Project not found." });
    const result = await store.run("INSERT INTO focus_priorities (user_id, goal_id, project_id, week_start, priority_type) VALUES (?, ?, ?, ?, ?)", [user.id, parsed.data.goalId ?? null, parsed.data.projectId ?? null, week.value, parsed.data.priorityType]);
    return response.status(201).json(await store.get("SELECT * FROM focus_priorities WHERE id = ?", [Number(result.lastInsertRowid)]));
});
focusRouter.delete("/:id", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const result = await store.run("DELETE FROM focus_priorities WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    return result.changes ? response.status(204).send() : response.status(404).json({ error: "Priority not found." });
});
focusRouter.post("/challenges", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const parsed = challengeSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const week = await store.get(`SELECT ${weekStartSql} AS value`, []) as {
        value: string;
    };
    const result = await store.run("INSERT INTO weekly_challenges (user_id, title, description, week_start, target, xp_reward) VALUES (?, ?, ?, ?, ?, 100)", [user.id, parsed.data.title, parsed.data.description, week.value, parsed.data.target]);
    return response.status(201).json(await store.get("SELECT * FROM weekly_challenges WHERE id = ?", [Number(result.lastInsertRowid)]));
});
focusRouter.patch("/challenges/:id/progress", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const parsed = z.object({ progress: z.number().int().min(0).max(100) }).safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const challenge = await store.get("SELECT id, target, progress, is_completed, xp_reward FROM weekly_challenges WHERE id = ? AND user_id = ?", [request.params.id, user.id]) as {
        id: number;
        target: number;
        progress: number;
        is_completed: number;
        xp_reward: number;
    } | undefined;
    if (!challenge)
        return response.status(404).json({ error: "Challenge not found." });
    const next = Math.min(challenge.target, parsed.data.progress);
    const completed = next >= challenge.target;
    await store.run("UPDATE weekly_challenges SET progress = ?, is_completed = ? WHERE id = ?", [next, completed, challenge.id]);
    const progression = completed && !challenge.is_completed ? await recordXpEvent(user.id, challenge.xp_reward, "weekly_challenge", challenge.id, "Completed weekly challenge") : null;
    if (progression)
        await evaluateAchievements(user.id);
    return response.json({ challenge: await store.get("SELECT * FROM weekly_challenges WHERE id = ?", [challenge.id]), progression });
});
