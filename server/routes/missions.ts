import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild, requireParent } from "../middleware/auth";
import { evaluateAchievements } from "../services/achievements";
import { recordXpEvent } from "../services/gamification";

const missionSchema = z.object({
  childId: z.number().int().positive(),
  title: z.string().trim().min(1).max(160),
  description: z.string().max(1000).default(""),
  xpReward: z.number().int().min(0).max(1000).default(200),
});

export const missionsRouter = Router();
missionsRouter.use(requireAuth);

missionsRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  const column = user.role === "parent" ? "parent_id" : "child_id";
  response.json(db.prepare(`
    SELECT m.*, child.display_name AS child_name, parent.display_name AS parent_name
    FROM parent_child_missions m
    JOIN users child ON child.id = m.child_id
    JOIN users parent ON parent.id = m.parent_id
    WHERE m.${column} = ?
    ORDER BY CASE m.status WHEN 'pending' THEN 0 ELSE 1 END, m.created_at DESC
  `).all(user.id));
});

missionsRouter.post("/", requireParent, (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = missionSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const linkedChild = db.prepare("SELECT user_id FROM child_profiles WHERE user_id = ? AND parent_id = ?").get(parsed.data.childId, user.id);
  if (!linkedChild) return response.status(404).json({ error: "Linked child not found." });
  const result = db.prepare(`
    INSERT INTO parent_child_missions (child_id, parent_id, title, description, xp_reward)
    VALUES (?, ?, ?, ?, ?)
  `).run(parsed.data.childId, user.id, parsed.data.title, parsed.data.description, parsed.data.xpReward);
  return response.status(201).json(db.prepare("SELECT * FROM parent_child_missions WHERE id = ?").get(Number(result.lastInsertRowid)));
});

missionsRouter.patch("/:id/submit", requireChild, (request, response) => {
  const user = authenticatedUser(response.locals);
  const missionId = Number(request.params.id);
  const result = db.prepare("UPDATE parent_child_missions SET status = 'child_submitted' WHERE id = ? AND child_id = ? AND status = 'pending'").run(missionId, user.id);
  if (!result.changes) return response.status(404).json({ error: "Pending mission not found." });
  return response.json(db.prepare("SELECT * FROM parent_child_missions WHERE id = ?").get(missionId));
});

missionsRouter.patch("/:id/validate", requireParent, (request, response) => {
  const user = authenticatedUser(response.locals);
  const missionId = String(request.params.id);
  const mission = db.prepare(`
    SELECT * FROM parent_child_missions
    WHERE id = ? AND parent_id = ? AND status = 'child_submitted'
  `).get(missionId, user.id) as { id: number; child_id: number; xp_reward: number } | undefined;
  if (!mission) return response.status(404).json({ error: "Submitted mission not found." });
  db.prepare(`
    UPDATE parent_child_missions
    SET status = 'completed', validated_by_parent = 1, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(mission.id);
  const progression = recordXpEvent(mission.child_id, mission.xp_reward, "parent_mission", mission.id, "Completed parent-child mission");
  const unlockedAchievements = evaluateAchievements(mission.child_id);
  return response.json({ mission: db.prepare("SELECT * FROM parent_child_missions WHERE id = ?").get(mission.id), progression, unlockedAchievements });
});
