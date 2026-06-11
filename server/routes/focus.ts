import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
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

focusRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  const week = db.prepare(`SELECT ${weekStartSql} AS value`).get() as { value: string };
  const priorities = db.prepare(`
    SELECT fp.*, g.title AS goal_title, p.title AS project_title
    FROM focus_priorities fp LEFT JOIN goals g ON g.id = fp.goal_id LEFT JOIN projects p ON p.id = fp.project_id
    WHERE fp.user_id = ? AND fp.week_start = ? ORDER BY CASE fp.priority_type WHEN 'main' THEN 0 ELSE 1 END
  `).all(user.id, week.value);
  const challenges = db.prepare("SELECT * FROM weekly_challenges WHERE user_id = ? AND week_start = ? ORDER BY id DESC").all(user.id, week.value);
  response.json({ weekStart: week.value, priorities, challenges });
});

focusRouter.post("/", (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = focusSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const week = db.prepare(`SELECT ${weekStartSql} AS value`).get() as { value: string };
  const limit = parsed.data.priorityType === "main" ? 1 : 2;
  const count = (db.prepare("SELECT COUNT(*) AS count FROM focus_priorities WHERE user_id = ? AND week_start = ? AND priority_type = ?").get(user.id, week.value, parsed.data.priorityType) as { count: number }).count;
  if (count >= limit) return response.status(409).json({ error: parsed.data.priorityType === "main" ? "Only one main priority is allowed." : "Only two secondary priorities are allowed." });
  if (parsed.data.goalId && !db.prepare("SELECT id FROM goals WHERE id = ? AND user_id = ?").get(parsed.data.goalId, user.id)) return response.status(404).json({ error: "Goal not found." });
  if (parsed.data.projectId && !db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(parsed.data.projectId, user.id)) return response.status(404).json({ error: "Project not found." });
  const result = db.prepare("INSERT INTO focus_priorities (user_id, goal_id, project_id, week_start, priority_type) VALUES (?, ?, ?, ?, ?)").run(user.id, parsed.data.goalId ?? null, parsed.data.projectId ?? null, week.value, parsed.data.priorityType);
  return response.status(201).json(db.prepare("SELECT * FROM focus_priorities WHERE id = ?").get(Number(result.lastInsertRowid)));
});

focusRouter.delete("/:id", (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = db.prepare("DELETE FROM focus_priorities WHERE id = ? AND user_id = ?").run(request.params.id, user.id);
  return result.changes ? response.status(204).send() : response.status(404).json({ error: "Priority not found." });
});

focusRouter.post("/challenges", (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = challengeSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const week = db.prepare(`SELECT ${weekStartSql} AS value`).get() as { value: string };
  const result = db.prepare("INSERT INTO weekly_challenges (user_id, title, description, week_start, target, xp_reward) VALUES (?, ?, ?, ?, ?, 100)").run(user.id, parsed.data.title, parsed.data.description, week.value, parsed.data.target);
  return response.status(201).json(db.prepare("SELECT * FROM weekly_challenges WHERE id = ?").get(Number(result.lastInsertRowid)));
});

focusRouter.patch("/challenges/:id/progress", (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = z.object({ progress: z.number().int().min(0).max(100) }).safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const challenge = db.prepare("SELECT id, target, progress, is_completed, xp_reward FROM weekly_challenges WHERE id = ? AND user_id = ?").get(request.params.id, user.id) as { id: number; target: number; progress: number; is_completed: number; xp_reward: number } | undefined;
  if (!challenge) return response.status(404).json({ error: "Challenge not found." });
  const next = Math.min(challenge.target, parsed.data.progress);
  const completed = next >= challenge.target;
  db.prepare("UPDATE weekly_challenges SET progress = ?, is_completed = ? WHERE id = ?").run(next, Number(completed), challenge.id);
  const progression = completed && !challenge.is_completed ? recordXpEvent(user.id, challenge.xp_reward, "weekly_challenge", challenge.id, "Completed weekly challenge") : null;
  if (progression) evaluateAchievements(user.id);
  return response.json({ challenge: db.prepare("SELECT * FROM weekly_challenges WHERE id = ?").get(challenge.id), progression });
});
