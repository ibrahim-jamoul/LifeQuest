import { Router } from "express";
import { store } from "../db/store";
import { authenticatedUser, requireAuth } from "../middleware/auth";
import { levelFromXp, titleForLevel } from "../services/gamification";
import { isHabitDueToday } from "../services/habitSchedule";
export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);
dashboardRouter.get("/today", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    if (user.role !== "child")
        return response.status(403).json({ error: "The daily snapshot is available to child accounts." });
    const quests = await store.all(`
    SELECT * FROM tasks
    WHERE user_id = ? AND due_date = date('now','localtime')
    ORDER BY is_completed, priority DESC, id
  `, [user.id]);
    const habits = (await store.all<{
        frequency: string;
        custom_schedule: string | null;
        [key: string]: unknown;
    }>(`
    SELECT h.*, EXISTS(
      SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime') AND hl.is_completed = 1
    ) AS completed_today
    FROM habits h WHERE h.user_id = ? AND h.is_active = 1 ORDER BY h.id
  `, [user.id])).filter((habit) => isHabitDueToday(habit.frequency, habit.custom_schedule));
    const userProgress = await store.get("SELECT total_xp, current_streak FROM users WHERE id = ?", [user.id]) as {
        total_xp: number;
        current_streak: number;
    };
    const profile = await store.get("SELECT village_level, age_group, grade, age, parent_id, 'spark' AS avatar_icon, '#75a876' AS avatar_color FROM child_profiles WHERE user_id = ?", [user.id]);
    const activeParentMissions = await store.get("SELECT COUNT(*) AS count FROM parent_child_missions WHERE child_id = ? AND status = 'pending'", [user.id]) as {
        count: number;
    };
    const activeGoals = await store.get("SELECT COUNT(*) AS count FROM goals WHERE user_id = ? AND status = 'in_progress'", [user.id]) as {
        count: number;
    };
    const activeProjects = await store.get("SELECT COUNT(*) AS count FROM projects WHERE user_id = ? AND status IN ('idea','planned','active')", [user.id]) as {
        count: number;
    };
    const weekStarted = await store.get("SELECT date('now','localtime','weekday 1','-7 days') AS week_start", []) as {
        week_start: string;
    };
    const weeklyCompletion = await store.get(`
    SELECT
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_completed = 1 AND date(completed_at, 'localtime') >= ?) +
      (SELECT COUNT(*) FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= ?) AS total
  `, [user.id, weekStarted.week_start, user.id, weekStarted.week_start]) as {
        total: number;
    };
    const monthStarted = await store.get("SELECT date('now','localtime','start of month') AS month_start", []) as {
        month_start: string;
    };
    const monthlyCompletion = await store.get(`
    SELECT
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_completed = 1 AND date(completed_at, 'localtime') >= ?) +
      (SELECT COUNT(*) FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= ?) AS total
  `, [user.id, monthStarted.month_start, user.id, monthStarted.month_start]) as {
        total: number;
    };
    const campaign = await store.get("SELECT id FROM school_campaigns WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", [user.id]) as {
        id: number;
    } | undefined;
    const schoolMonth = ((new Date().getMonth() + 4) % 12) + 1;
    const currentChapter = campaign ? await store.get("SELECT title, theme, progress FROM campaign_chapters WHERE campaign_id = ? AND month_number = ?", [campaign.id, schoolMonth]) : null;
    return response.json({
        date: (await store.get("SELECT date('now','localtime') AS date", []) as {
            date: string;
        }).date,
        user,
        profile,
        level: levelFromXp(userProgress.total_xp),
        levelTitle: titleForLevel(levelFromXp(userProgress.total_xp)),
        quests,
        habits,
        activeGoals: activeGoals.count,
        activeProjects: activeProjects.count,
        weeklyProgress: weeklyCompletion.total,
        monthlyProgress: monthlyCompletion.total,
        currentChapter,
        progression: {
            totalXp: userProgress.total_xp,
            currentStreak: userProgress.current_streak,
            activeParentMissions: activeParentMissions.count,
        },
    });
});
dashboardRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    const activeGoals = await store.get("SELECT COUNT(*) AS count FROM goals WHERE user_id = ? AND status = 'in_progress'", [user.id]) as {
        count: number;
    };
    const progress = await store.get("SELECT total_xp, current_streak FROM users WHERE id = ?", [user.id]) as {
        total_xp: number;
        current_streak: number;
    };
    response.json({ activeGoals: activeGoals.count, totalXp: progress.total_xp, currentStreak: progress.current_streak, level: levelFromXp(progress.total_xp), levelTitle: titleForLevel(levelFromXp(progress.total_xp)) });
});
