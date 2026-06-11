import { Router } from "express";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
export const notificationsRouter = Router();
notificationsRouter.use(requireAuth, requireChild);
async function generateLocalNotifications(userId: number) {
    const preferences = await store.get("SELECT habit_reminders, review_reminders FROM user_preferences WHERE user_id = ?", [userId]) as {
        habit_reminders: number;
        review_reminders: number;
    } | undefined;
    if (preferences?.habit_reminders && (await store.get("SELECT COUNT(*) AS count FROM habits h WHERE h.user_id = ? AND h.is_active = 1 AND NOT EXISTS (SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime'))", [userId]) as {
        count: number;
    }).count > 0) {
        await store.run("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Garden reminder', 'Some habits are still waiting for today.', 'habit' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Garden reminder' AND date(created_at,'localtime') = date('now','localtime'))", [userId, userId]);
    }
    if (preferences?.review_reminders && !await store.get("SELECT 1 FROM reviews WHERE user_id = ? AND review_type = 'weekly' AND period_start >= date('now','localtime','-7 days')", [userId])) {
        await store.run("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Weekly reflection', 'Visit Pathways and complete your weekly review.', 'review' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Weekly reflection' AND date(created_at,'localtime') = date('now','localtime'))", [userId, userId]);
    }
    if (await store.get("SELECT 1 FROM parent_child_missions WHERE child_id = ? AND status = 'pending'", [userId])) {
        await store.run("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Parent mission available', 'A shared mission is ready to complete with your parent.', 'mission' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Parent mission available' AND date(created_at,'localtime') = date('now','localtime'))", [userId, userId]);
    }
}
notificationsRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    await generateLocalNotifications(user.id);
    const notifications = await store.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY is_read, created_at DESC LIMIT 100", [user.id]);
    const unread = (await store.get("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0", [user.id]) as {
        count: number;
    }).count;
    response.json({ notifications, unread });
});
notificationsRouter.patch("/read-all", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    await store.run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [user.id]);
    response.status(204).send();
});
notificationsRouter.patch("/:id/read", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const result = await store.run("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
    return result.changes
        ? response.json(await store.get("SELECT * FROM notifications WHERE id = ?", [request.params.id]))
        : response.status(404).json({ error: "Notification not found." });
});
