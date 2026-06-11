import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { evaluateAchievements } from "../services/achievements";
import { recordXpEvent } from "../services/gamification";

const questSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(1000).default(""),
  dueDate: z.string().date().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  estimatedMinutes: z.number().int().positive().max(1440).nullable().optional(),
  goalId: z.number().int().positive().nullable().optional(),
  projectId: z.number().int().positive().nullable().optional(),
});
export const questsRouter = Router();
questsRouter.use(requireAuth);
questsRouter.use(requireChild);

function linkedRecordsBelongToUser(userId: number, goalId?: number | null, projectId?: number | null) {
  if (goalId && !db.prepare("SELECT id FROM goals WHERE id = ? AND user_id = ?").get(goalId, userId)) return false;
  if (projectId && !db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(projectId, userId)) return false;
  return true;
}

questsRouter.get("/", (request, response) => {
  const user = authenticatedUser(response.locals);
  const filter = z.enum(["today", "active", "completed", "all"]).catch("all").parse(request.query.filter);
  const clauses = ["user_id = ?"];
  if (filter === "today") clauses.push("due_date = date('now','localtime')");
  if (filter === "active") clauses.push("is_completed = 0");
  if (filter === "completed") clauses.push("is_completed = 1");
  response.json(db.prepare(`SELECT * FROM tasks WHERE ${clauses.join(" AND ")} ORDER BY is_completed, due_date, id DESC`).all(user.id));
});

questsRouter.post("/", (request, response) => {
  const parsed = questSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  if (!linkedRecordsBelongToUser(user.id, parsed.data.goalId, parsed.data.projectId)) return response.status(400).json({ error: "Linked goal or project is not available." });
  const result = db.prepare(`
    INSERT INTO tasks (user_id, goal_id, project_id, title, description, due_date, priority, estimated_minutes, xp_reward)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10)
  `).run(user.id, parsed.data.goalId ?? null, parsed.data.projectId ?? null, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.priority, parsed.data.estimatedMinutes ?? null);
  return response.status(201).json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(Number(result.lastInsertRowid)));
});

questsRouter.put("/:id", (request, response) => {
  const parsed = questSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  if (!linkedRecordsBelongToUser(user.id, parsed.data.goalId, parsed.data.projectId)) return response.status(400).json({ error: "Linked goal or project is not available." });
  const result = db.prepare(`
    UPDATE tasks SET goal_id = ?, project_id = ?, title = ?, description = ?, due_date = ?, priority = ?, estimated_minutes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(parsed.data.goalId ?? null, parsed.data.projectId ?? null, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.priority, parsed.data.estimatedMinutes ?? null, request.params.id, user.id);
  if (result.changes === 0) return response.status(404).json({ error: "Quest not found." });
  return response.json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(request.params.id));
});

questsRouter.patch("/:id/complete", (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = db.prepare(`
    UPDATE tasks SET is_completed = 1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND is_completed = 0
  `).run(request.params.id, user.id);
  if (result.changes === 0) return response.status(404).json({ error: "Active quest not found." });
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(request.params.id) as { id: number; xp_reward: number };
  const progression = recordXpEvent(user.id, task.xp_reward, "task", task.id, "Completed quest");
  const unlockedAchievements = evaluateAchievements(user.id);
  return response.json({ ...db.prepare("SELECT * FROM tasks WHERE id = ?").get(request.params.id), progression, unlockedAchievements });
});

questsRouter.delete("/:id", (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(request.params.id, user.id);
  if (result.changes === 0) return response.status(404).json({ error: "Quest not found." });
  return response.status(204).send();
});
