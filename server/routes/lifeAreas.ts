import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";

const schema = z.object({ score: z.number().int().min(0).max(100), trend: z.enum(["improving", "stable", "declining"]) });
export const lifeAreasRouter = Router();
lifeAreasRouter.use(requireAuth, requireChild);
lifeAreasRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(db.prepare(`SELECT la.*,
    (SELECT COUNT(*) FROM goals g WHERE g.life_area_id = la.id AND g.status != 'completed') AS active_goals,
    (SELECT COUNT(*) FROM tasks t JOIN goals g ON g.id = t.goal_id WHERE g.life_area_id = la.id AND t.is_completed = 1 AND t.completed_at >= datetime('now','-7 days')) AS weekly_activity
    FROM life_areas la WHERE la.user_id = ? ORDER BY la.id`).all(user.id));
});
lifeAreasRouter.put("/:id", (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const result = db.prepare("UPDATE life_areas SET score = ?, trend = ? WHERE id = ? AND user_id = ?").run(parsed.data.score, parsed.data.trend, request.params.id, user.id);
  return result.changes ? response.json(db.prepare("SELECT * FROM life_areas WHERE id = ?").get(request.params.id)) : response.status(404).json({ error: "Life area not found." });
});
