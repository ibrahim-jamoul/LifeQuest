import { Router } from "express";
import { z } from "zod";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { evaluateAchievements } from "../services/achievements";
import { recordXpEvent } from "../services/gamification";
async function syncGoalProgress(goalId: string | number) {
    const stats = await store.get("SELECT COUNT(*) AS count, COALESCE(AVG(progress), 0) AS progress FROM milestones WHERE goal_id = ?", [goalId]) as {
        count: number;
        progress: number;
    };
    await store.run("UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [stats.count > 0 ? Math.round(stats.progress) : 0, goalId]);
}
const goalSchema = z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().max(1000).default(""),
    category: z.string().trim().min(1).max(80),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    deadline: z.string().date().nullable().optional(),
    status: z.enum(["not_started", "in_progress", "paused", "completed"]).default("not_started"),
    progress: z.number().int().min(0).max(100).default(0),
    notes: z.string().max(2000).default(""),
});
export const goalsRouter = Router();
goalsRouter.use(requireAuth);
goalsRouter.use(requireChild);
goalsRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    response.json(await store.all("SELECT * FROM goals WHERE user_id = ? ORDER BY updated_at DESC, id DESC", [user.id]));
});
goalsRouter.get("/:id", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT * FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    const milestones = await store.all("SELECT * FROM milestones WHERE goal_id = ? ORDER BY id DESC", [request.params.id]);
    const notes = await store.all("SELECT * FROM notes WHERE goal_id = ? ORDER BY created_at DESC", [request.params.id]);
    const tasks = await store.all("SELECT * FROM tasks WHERE goal_id = ? AND user_id = ? ORDER BY is_completed, due_date, id DESC", [request.params.id, user.id]);
    const habits = await store.all("SELECT * FROM habits WHERE goal_id = ? AND user_id = ? ORDER BY is_active DESC, id DESC", [request.params.id, user.id]);
    return response.json({ goal, milestones, notes, tasks, habits });
});
goalsRouter.post("/", async (request, response) => {
    const parsed = goalSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const user = authenticatedUser(response.locals);
    const result = await store.run(`
    INSERT INTO goals (user_id, title, description, category, priority, deadline, status, progress, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [user.id, parsed.data.title, parsed.data.description, parsed.data.category, parsed.data.priority, parsed.data.deadline ?? null, parsed.data.status, parsed.data.progress, parsed.data.notes]);
    return response.status(201).json(await store.get("SELECT * FROM goals WHERE id = ?", [Number(result.lastInsertRowid)]));
});
goalsRouter.put("/:id", async (request, response) => {
    const parsed = goalSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const user = authenticatedUser(response.locals);
    const current = await store.get("SELECT status FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]) as {
        status: string;
    } | undefined;
    if (!current)
        return response.status(404).json({ error: "Goal not found." });
    if (parsed.data.status === "completed" && current.status !== "completed")
        return response.status(400).json({ error: "Use the complete-goal action to earn verified XP." });
    const result = await store.run(`
    UPDATE goals SET title = ?, description = ?, category = ?, priority = ?, deadline = ?, status = ?, progress = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `, [parsed.data.title, parsed.data.description, parsed.data.category, parsed.data.priority, parsed.data.deadline ?? null, parsed.data.status, parsed.data.progress, parsed.data.notes, request.params.id, user.id]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Goal not found." });
    return response.json(await store.get("SELECT * FROM goals WHERE id = ?", [request.params.id]));
});
goalsRouter.delete("/:id", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const result = await store.run("DELETE FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Goal not found." });
    return response.status(204).send();
});
goalsRouter.patch("/:id/complete", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT id, status FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]) as {
        id: number;
        status: string;
    } | undefined;
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    if (goal.status === "completed")
        return response.status(409).json({ error: "Goal is already completed." });
    await store.run("UPDATE goals SET status = 'completed', progress = 100, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [goal.id]);
    const progression = await recordXpEvent(user.id, 100, "goal", goal.id, "Completed goal");
    const unlockedAchievements = await evaluateAchievements(user.id);
    return response.json({ goal: await store.get("SELECT * FROM goals WHERE id = ?", [goal.id]), progression, unlockedAchievements });
});
const milestoneSchema = z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().max(1000).default(""),
    dueDate: z.string().date().nullable().optional(),
    progress: z.number().int().min(0).max(100).default(0),
    xpReward: z.number().int().min(0).max(5000).default(100),
});
const noteSchema = z.object({
    title: z.string().trim().min(1).max(160),
    content: z.string().max(4000).default(""),
    noteType: z.enum(["reflection", "action", "idea", "progress"]).default("reflection"),
});
goalsRouter.post("/:id/milestones", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    const parsed = milestoneSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const result = await store.run(`
    INSERT INTO milestones (goal_id, title, description, due_date, progress, xp_reward)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [request.params.id, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.xpReward]);
    const milestoneId = Number(result.lastInsertRowid);
    if (parsed.data.progress >= 100)
        await recordXpEvent(user.id, parsed.data.xpReward, "milestone", milestoneId, "Completed milestone");
    await syncGoalProgress(request.params.id);
    await evaluateAchievements(user.id);
    return response.status(201).json(await store.get("SELECT * FROM milestones WHERE id = ?", [milestoneId]));
});
goalsRouter.put("/:goalId/milestones/:milestoneId", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    const parsed = milestoneSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const previous = await store.get("SELECT progress FROM milestones WHERE id = ? AND goal_id = ?", [request.params.milestoneId, request.params.goalId]) as {
        progress: number;
    } | undefined;
    if (!previous)
        return response.status(404).json({ error: "Milestone not found." });
    const result = await store.run(`
    UPDATE milestones SET title = ?, description = ?, due_date = ?, progress = ?, xp_reward = ?, is_completed = ?, completed_at = CASE WHEN ? = true THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END
    WHERE id = ? AND goal_id = ?
  `, [parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.xpReward, parsed.data.progress >= 100, parsed.data.progress >= 100, request.params.milestoneId, request.params.goalId]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Milestone not found." });
    if (previous.progress < 100 && parsed.data.progress >= 100)
        await recordXpEvent(user.id, parsed.data.xpReward, "milestone", Number(request.params.milestoneId), "Completed milestone");
    await syncGoalProgress(request.params.goalId);
    await evaluateAchievements(user.id);
    return response.json(await store.get("SELECT * FROM milestones WHERE id = ?", [request.params.milestoneId]));
});
goalsRouter.delete("/:goalId/milestones/:milestoneId", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    const result = await store.run("DELETE FROM milestones WHERE id = ? AND goal_id = ?", [request.params.milestoneId, request.params.goalId]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Milestone not found." });
    await syncGoalProgress(request.params.goalId);
    return response.status(204).send();
});
goalsRouter.post("/:id/notes", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    const parsed = noteSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const result = await store.run(`
    INSERT INTO notes (user_id, goal_id, title, content, note_type)
    VALUES (?, ?, ?, ?, ?)
  `, [user.id, request.params.id, parsed.data.title, parsed.data.content, parsed.data.noteType]);
    return response.status(201).json(await store.get("SELECT * FROM notes WHERE id = ? AND user_id = ?", [Number(result.lastInsertRowid), user.id]));
});
goalsRouter.put("/:goalId/notes/:noteId", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    const parsed = noteSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const result = await store.run(`
    UPDATE notes SET title = ?, content = ?, note_type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND goal_id = ? AND user_id = ?
  `, [parsed.data.title, parsed.data.content, parsed.data.noteType, request.params.noteId, request.params.goalId, user.id]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Note not found." });
    return response.json(await store.get("SELECT * FROM notes WHERE id = ? AND user_id = ?", [request.params.noteId, user.id]));
});
goalsRouter.delete("/:goalId/notes/:noteId", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
    if (!goal)
        return response.status(404).json({ error: "Goal not found." });
    const result = await store.run("DELETE FROM notes WHERE id = ? AND goal_id = ? AND user_id = ?", [request.params.noteId, request.params.goalId, user.id]);
    if (result.changes === 0)
        return response.status(404).json({ error: "Note not found." });
    return response.status(204).send();
});
