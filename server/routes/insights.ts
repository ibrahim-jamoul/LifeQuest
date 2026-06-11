import { Router } from "express";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";

export const insightsRouter = Router();
insightsRouter.use(requireAuth, requireChild);
insightsRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  const preferences = db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(user.id) as { habit_reminders: number; review_reminders: number } | undefined;
  if (preferences?.habit_reminders && (db.prepare("SELECT COUNT(*) AS count FROM habits h WHERE h.user_id = ? AND h.is_active = 1 AND NOT EXISTS (SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime'))").get(user.id) as { count: number }).count > 0) {
    db.prepare("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Garden reminder', 'Some habits are still waiting for today.', 'habit' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Garden reminder' AND date(created_at,'localtime') = date('now','localtime'))").run(user.id, user.id);
  }
  if (preferences?.review_reminders && !(db.prepare("SELECT 1 FROM reviews WHERE user_id = ? AND review_type = 'weekly' AND period_start >= date('now','localtime','-7 days')").get(user.id))) {
    db.prepare("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Weekly reflection', 'Visit Pathways and complete your weekly review.', 'review' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Weekly reflection' AND date(created_at,'localtime') = date('now','localtime'))").run(user.id, user.id);
  }
  const xpTimeline = db.prepare("SELECT date(created_at,'localtime') AS day, SUM(amount) AS xp FROM xp_events WHERE user_id = ? AND created_at >= datetime('now','-29 days') GROUP BY day ORDER BY day").all(user.id);
  const habitHeatmap = db.prepare("SELECT completed_on AS day, COUNT(*) AS completed FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1 AND completed_on >= date('now','-29 days') GROUP BY completed_on ORDER BY completed_on").all(user.id);
  const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY is_read, created_at DESC LIMIT 20").all(user.id);
  response.json({ xpTimeline, habitHeatmap, notifications });
});
