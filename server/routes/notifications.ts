import { Router } from "express";
import { db } from "../db/database";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth, requireChild);

function generateLocalNotifications(userId: number) {
  const preferences = db.prepare("SELECT habit_reminders, review_reminders FROM user_preferences WHERE user_id = ?").get(userId) as { habit_reminders: number; review_reminders: number } | undefined;
  if (preferences?.habit_reminders && (db.prepare("SELECT COUNT(*) AS count FROM habits h WHERE h.user_id = ? AND h.is_active = 1 AND NOT EXISTS (SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime'))").get(userId) as { count: number }).count > 0) {
    db.prepare("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Garden reminder', 'Some habits are still waiting for today.', 'habit' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Garden reminder' AND date(created_at,'localtime') = date('now','localtime'))").run(userId, userId);
  }
  if (preferences?.review_reminders && !db.prepare("SELECT 1 FROM reviews WHERE user_id = ? AND review_type = 'weekly' AND period_start >= date('now','localtime','-7 days')").get(userId)) {
    db.prepare("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Weekly reflection', 'Visit Pathways and complete your weekly review.', 'review' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Weekly reflection' AND date(created_at,'localtime') = date('now','localtime'))").run(userId, userId);
  }
  if (db.prepare("SELECT 1 FROM parent_child_missions WHERE child_id = ? AND status = 'pending'").get(userId)) {
    db.prepare("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Parent mission available', 'A shared mission is ready to complete with your parent.', 'mission' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Parent mission available' AND date(created_at,'localtime') = date('now','localtime'))").run(userId, userId);
  }
}

notificationsRouter.get("/", (_request, response) => {
  const user = authenticatedUser(response.locals);
  generateLocalNotifications(user.id);
  const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY is_read, created_at DESC LIMIT 100").all(user.id);
  const unread = (db.prepare("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0").get(user.id) as { count: number }).count;
  response.json({ notifications, unread });
});

notificationsRouter.patch("/read-all", (_request, response) => {
  const user = authenticatedUser(response.locals);
  db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(user.id);
  response.status(204).send();
});

notificationsRouter.patch("/:id/read", (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(request.params.id, user.id);
  return result.changes
    ? response.json(db.prepare("SELECT * FROM notifications WHERE id = ?").get(request.params.id))
    : response.status(404).json({ error: "Notification not found." });
});
