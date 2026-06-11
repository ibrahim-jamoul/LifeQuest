import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { evaluateAchievements } from "../services/achievements";
import { recordXpEvent } from "../services/gamification";

const projectSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(1000).default(""),
  status: z.string().trim().min(1).max(40).default("idea"),
  priority: z.string().trim().min(1).max(40).default("medium"),
  roadmap: z.string().max(2000).default(""),
  notes: z.string().max(2000).default(""),
  riskLevel: z.enum(["low", "medium", "high"]).default("low"),
  nextAction: z.string().max(500).default(""),
});
const milestoneSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(1000).default(""),
  dueDate: z.string().date().nullable().optional(),
  progress: z.number().int().min(0).max(100).default(0),
});
const noteSchema = z.object({
  title: z.string().trim().min(1).max(160),
  content: z.string().max(4000).default(""),
  noteType: z.enum(["reflection", "action", "idea", "progress"]).default("reflection"),
});

export const projectsRouter = Router();
projectsRouter.use(requireAuth);
projectsRouter.use(requireChild);

projectsRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC").all(user.id));
});

projectsRouter.get("/:id", (request, response) => {
  const user = authenticatedUser(response.locals);
  const project = db.prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?").get(request.params.id, user.id);
  if (!project) return response.status(404).json({ error: "Project not found." });
  return response.json({
    project,
    milestones: db.prepare("SELECT * FROM milestones WHERE project_id = ? ORDER BY id DESC").all(request.params.id),
    notes: db.prepare("SELECT * FROM notes WHERE project_id = ? ORDER BY created_at DESC").all(request.params.id),
    tasks: db.prepare("SELECT * FROM tasks WHERE project_id = ? AND user_id = ? ORDER BY is_completed, due_date, id DESC").all(request.params.id, user.id),
  });
});

projectsRouter.post("/", (request, response) => {
  const parsed = projectSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  const result = db.prepare(`
    INSERT INTO projects (user_id, title, description, status, priority, roadmap, notes, risk_level, next_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, parsed.data.title, parsed.data.description, parsed.data.status, parsed.data.priority, parsed.data.roadmap, parsed.data.notes, parsed.data.riskLevel, parsed.data.nextAction);
  return response.status(201).json(db.prepare("SELECT * FROM projects WHERE id = ?").get(Number(result.lastInsertRowid)));
});

projectsRouter.put("/:id", (request, response) => {
  const parsed = projectSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  const result = db.prepare(`
    UPDATE projects SET title = ?, description = ?, status = ?, priority = ?, roadmap = ?, notes = ?, risk_level = ?, next_action = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(parsed.data.title, parsed.data.description, parsed.data.status, parsed.data.priority, parsed.data.roadmap, parsed.data.notes, parsed.data.riskLevel, parsed.data.nextAction, request.params.id, user.id);
  if (result.changes === 0) return response.status(404).json({ error: "Project not found." });
  return response.json(db.prepare("SELECT * FROM projects WHERE id = ?").get(request.params.id));
});

projectsRouter.delete("/:id", (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(request.params.id, user.id);
  if (result.changes === 0) return response.status(404).json({ error: "Project not found." });
  return response.status(204).send();
});

projectsRouter.post("/:id/milestones", (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(request.params.id, user.id)) return response.status(404).json({ error: "Project not found." });
  const parsed = milestoneSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const result = db.prepare("INSERT INTO milestones (project_id, title, description, due_date, progress, is_completed) VALUES (?, ?, ?, ?, ?, ?)").run(request.params.id, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.progress >= 100 ? 1 : 0);
  return response.status(201).json(db.prepare("SELECT * FROM milestones WHERE id = ?").get(Number(result.lastInsertRowid)));
});

projectsRouter.put("/:projectId/milestones/:milestoneId", (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(request.params.projectId, user.id)) return response.status(404).json({ error: "Project not found." });
  const parsed = milestoneSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const previous = db.prepare("SELECT progress, xp_reward FROM milestones WHERE id = ? AND project_id = ?").get(request.params.milestoneId, request.params.projectId) as { progress: number; xp_reward: number } | undefined;
  if (!previous) return response.status(404).json({ error: "Milestone not found." });
  const result = db.prepare("UPDATE milestones SET title = ?, description = ?, due_date = ?, progress = ?, is_completed = ?, completed_at = CASE WHEN ? = 1 THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END WHERE id = ? AND project_id = ?").run(parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.progress >= 100 ? 1 : 0, parsed.data.progress >= 100 ? 1 : 0, request.params.milestoneId, request.params.projectId);
  if (!result.changes) return response.status(404).json({ error: "Milestone not found." });
  if (previous.progress < 100 && parsed.data.progress >= 100) {
    recordXpEvent(user.id, previous.xp_reward, "milestone", Number(request.params.milestoneId), "Completed project milestone");
    evaluateAchievements(user.id);
  }
  return response.json(db.prepare("SELECT * FROM milestones WHERE id = ?").get(request.params.milestoneId));
});

projectsRouter.delete("/:projectId/milestones/:milestoneId", (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(request.params.projectId, user.id)) return response.status(404).json({ error: "Project not found." });
  const result = db.prepare("DELETE FROM milestones WHERE id = ? AND project_id = ?").run(request.params.milestoneId, request.params.projectId);
  return result.changes ? response.status(204).send() : response.status(404).json({ error: "Milestone not found." });
});

projectsRouter.post("/:id/notes", (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(request.params.id, user.id)) return response.status(404).json({ error: "Project not found." });
  const parsed = noteSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const result = db.prepare("INSERT INTO notes (user_id, project_id, title, content, note_type) VALUES (?, ?, ?, ?, ?)").run(user.id, request.params.id, parsed.data.title, parsed.data.content, parsed.data.noteType);
  return response.status(201).json(db.prepare("SELECT * FROM notes WHERE id = ?").get(Number(result.lastInsertRowid)));
});

projectsRouter.put("/:projectId/notes/:noteId", (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = noteSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const result = db.prepare("UPDATE notes SET title = ?, content = ?, note_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ? AND user_id = ?").run(parsed.data.title, parsed.data.content, parsed.data.noteType, request.params.noteId, request.params.projectId, user.id);
  if (!result.changes) return response.status(404).json({ error: "Note not found." });
  return response.json(db.prepare("SELECT * FROM notes WHERE id = ?").get(request.params.noteId));
});

projectsRouter.delete("/:projectId/notes/:noteId", (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = db.prepare("DELETE FROM notes WHERE id = ? AND project_id = ? AND user_id = ?").run(request.params.noteId, request.params.projectId, user.id);
  return result.changes ? response.status(204).send() : response.status(404).json({ error: "Note not found." });
});
