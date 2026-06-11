import { Router } from "express";
import { z } from "zod";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
const schema = z.object({ title: z.string().trim().min(1).max(160), schoolYear: z.string().trim().min(4).max(20), annualGoal: z.string().max(500).default("") });
const monthNames = ["September", "October", "November", "December", "January", "February", "March", "April", "May", "June", "July", "August"];
export const campaignsRouter = Router();
campaignsRouter.use(requireAuth, requireChild);
campaignsRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    const campaign = await store.get("SELECT * FROM school_campaigns WHERE user_id = ? ORDER BY id DESC LIMIT 1", [user.id]) as {
        id: number;
    } | undefined;
    response.json({ campaign: campaign ?? null, chapters: campaign ? await store.all("SELECT * FROM campaign_chapters WHERE campaign_id = ? ORDER BY month_number", [campaign.id]) : [] });
});
campaignsRouter.get("/annual-summary", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    const campaign = await store.get<{ id: number }>("SELECT * FROM school_campaigns WHERE user_id = ? ORDER BY id DESC LIMIT 1", [user.id]);
    if (!campaign) return response.status(404).json({ error: "Create a school campaign before generating its annual summary." });
    const summary = await store.get(`SELECT
      COALESCE((SELECT SUM(amount) FROM xp_events WHERE user_id = ?), 0) AS total_xp,
      COALESCE((SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_completed = 1), 0) AS completed_quests,
      COALESCE((SELECT COUNT(*) FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1), 0) AS habit_checkins,
      COALESCE((SELECT COUNT(*) FROM discovery_completions WHERE child_id = ?), 0) AS discoveries,
      COALESCE((SELECT COUNT(*) FROM parent_child_missions WHERE child_id = ? AND status = 'completed'), 0) AS parent_missions,
      COALESCE((SELECT MAX(longest_streak) FROM habits WHERE user_id = ?), 0) AS best_streak`,
    [user.id, user.id, user.id, user.id, user.id, user.id]);
    const chapters = await store.all("SELECT * FROM campaign_chapters WHERE campaign_id = ? ORDER BY month_number", [campaign.id]);
    return response.json({ campaign, summary, chapters });
});
campaignsRouter.post("/", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const parsed = schema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ error: parsed.error.flatten() });
    const result = await store.run("INSERT INTO school_campaigns (user_id, title, school_year, annual_goal) VALUES (?, ?, ?, ?)", [user.id, parsed.data.title, parsed.data.schoolYear, parsed.data.annualGoal]);
    const id = Number(result.lastInsertRowid);
    for (const [index, month] of monthNames.entries()) {
        await store.run(
            "INSERT INTO campaign_chapters (campaign_id, month_number, title, theme) VALUES (?, ?, ?, ?)",
            [id, index + 1, `Chapter ${index + 1}: ${month}`, index === 0 ? "New beginnings" : "Keep growing"],
        );
    }
    return response.status(201).json({ campaign: await store.get("SELECT * FROM school_campaigns WHERE id = ?", [id]), chapters: await store.all("SELECT * FROM campaign_chapters WHERE campaign_id = ?", [id]) });
});
campaignsRouter.patch("/chapters/:id", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const progress = z.object({ progress: z.number().int().min(0).max(100) }).safeParse(request.body);
    if (!progress.success)
        return response.status(400).json({ error: progress.error.flatten() });
    const result = await store.run("UPDATE campaign_chapters SET progress = MAX(progress, ?), is_completed = CASE WHEN ? >= 100 THEN true ELSE is_completed END WHERE id = ? AND campaign_id IN (SELECT id FROM school_campaigns WHERE user_id = ?)", [progress.data.progress, progress.data.progress, request.params.id, user.id]);
    return result.changes ? response.json(await store.get("SELECT * FROM campaign_chapters WHERE id = ?", [request.params.id])) : response.status(404).json({ error: "Chapter not found." });
});
