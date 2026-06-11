import { Router } from "express";
import { z } from "zod";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { evaluateAchievements } from "../services/achievements";
import { recordXpEvent } from "../services/gamification";
const reviewSchema = z.object({
    reviewType: z.enum(["weekly", "monthly"]),
    periodStart: z.string().date(),
    periodEnd: z.string().date(),
    answersJson: z.record(z.unknown()).default({}),
    summaryJson: z.record(z.unknown()).default({}),
});
export const reviewsRouter = Router();
reviewsRouter.use(requireAuth);
reviewsRouter.use(requireChild);
reviewsRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    response.json(await store.all("SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC", [user.id]));
});
reviewsRouter.post("/", async (request, response) => {
    const parsed = reviewSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const user = authenticatedUser(response.locals);
    const activity = await store.get(`
    SELECT
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_completed = 1 AND date(completed_at) BETWEEN ? AND ?) AS completedTasks,
      (SELECT COUNT(*) FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1 AND hl.completed_on BETWEEN ? AND ?) AS habitCheckins,
      (SELECT COALESCE(SUM(amount),0) FROM xp_events WHERE user_id = ? AND date(created_at) BETWEEN ? AND ?) AS xpGained,
      (SELECT COUNT(*) FROM goals WHERE user_id = ? AND status = 'completed' AND date(completed_at) BETWEEN ? AND ?) AS goalsCompleted,
      (SELECT COUNT(*) FROM goals WHERE user_id = ? AND status != 'completed' AND deadline IS NOT NULL AND deadline < ?) AS goalsDelayed,
      (SELECT COALESCE(MAX(longest_streak),0) FROM habits WHERE user_id = ?) AS bestStreak
  `, [user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodEnd, user.id]) as Record<string, number>;
    const strongest = await store.get("SELECT name, score FROM life_areas WHERE user_id = ? ORDER BY score DESC, id LIMIT 1", [user.id]) as {
        name: string;
        score: number;
    } | undefined;
    const weakest = await store.get("SELECT name, score FROM life_areas WHERE user_id = ? ORDER BY score, id LIMIT 1", [user.id]) as {
        name: string;
        score: number;
    } | undefined;
    const generatedSummary = { ...activity, strongestArea: strongest?.name ?? null, weakestArea: weakest?.name ?? null, recommendedFocus: weakest?.name ?? "Choose one useful priority" };
    const existing = await store.get("SELECT id FROM reviews WHERE user_id = ? AND review_type = ? AND period_start = ?", [user.id, parsed.data.reviewType, parsed.data.periodStart]) as {
        id: number;
    } | undefined;
    const result = await store.run(`
    INSERT INTO reviews (user_id, review_type, period_start, period_end, answers_json, summary_json)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, review_type, period_start) DO UPDATE SET
      period_end = excluded.period_end,
      answers_json = excluded.answers_json,
      summary_json = excluded.summary_json,
      updated_at = CURRENT_TIMESTAMP
  `, [user.id, parsed.data.reviewType, parsed.data.periodStart, parsed.data.periodEnd, JSON.stringify(parsed.data.answersJson), JSON.stringify({ ...parsed.data.summaryJson, ...generatedSummary })]);
    const reviewId = existing?.id ?? Number(result.lastInsertRowid);
    const progression = existing ? null : await recordXpEvent(user.id, 75, "review", reviewId, `Completed ${parsed.data.reviewType} review`);
    const unlockedAchievements = await evaluateAchievements(user.id);
    return response.status(existing ? 200 : 201).json({ review: await store.get("SELECT * FROM reviews WHERE id = ?", [reviewId]), generatedSummary, progression, unlockedAchievements });
});
