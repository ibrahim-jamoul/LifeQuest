import { Router } from "express";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireParent } from "../middleware/auth";
import { levelFromXp } from "../services/gamification";

export const parentRouter = Router();
parentRouter.use(requireAuth);
parentRouter.use(requireParent);

parentRouter.get("/children", (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(db.prepare(`
    SELECT u.id, u.display_name, u.total_xp, u.current_streak, cp.age, cp.grade, cp.age_group, cp.village_level
    FROM child_profiles cp JOIN users u ON u.id = cp.user_id
    WHERE cp.parent_id = ? ORDER BY u.display_name
  `).all(user.id));
});

parentRouter.get("/dashboard", (_request, response) => {
  const user = authenticatedUser(response.locals);
  const children = db.prepare(`
    SELECT u.id, u.display_name, u.total_xp, u.current_streak, cp.age, cp.grade, cp.age_group, cp.village_level
    FROM child_profiles cp JOIN users u ON u.id = cp.user_id
    WHERE cp.parent_id = ? ORDER BY u.display_name
  `).all(user.id) as Array<{ id: number; display_name: string; total_xp: number; current_streak: number; age: number; grade: string; age_group: string; village_level: number }>;
  const summaries = children.map((child) => ({
    ...child,
    level: levelFromXp(child.total_xp),
    activeQuests: (db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND is_completed = 0").get(child.id) as { count: number }).count,
    activeHabits: (db.prepare("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND is_active = 1").get(child.id) as { count: number }).count,
    completedQuests: (db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND is_completed = 1").get(child.id) as { count: number }).count,
    pendingMissions: (db.prepare("SELECT COUNT(*) AS count FROM parent_child_missions WHERE child_id = ? AND parent_id = ? AND status IN ('pending','child_submitted')").get(child.id, user.id) as { count: number }).count,
  }));
  response.json({ parent: user, children: summaries });
});
