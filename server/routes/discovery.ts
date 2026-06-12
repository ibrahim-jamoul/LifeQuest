import { Router } from "express";
import { store } from "../db/store";
import { authenticatedUser, requireAuth, requireChild } from "../middleware/auth";
import { evaluateAchievements } from "../services/achievements";
import { recordXpEvent } from "../services/gamification";
export const discoveryRouter = Router();
discoveryRouter.use(requireAuth, requireChild);
function periodKey(frequency: string) {
    const date = new Date();
    if (frequency === "daily")
        return date.toISOString().slice(0, 10);
    if (frequency === "monthly")
        return date.toISOString().slice(0, 7);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    return date.toISOString().slice(0, 10);
}
discoveryRouter.get("/", async (_request, response) => {
    const user = authenticatedUser(response.locals);
    const profile = await store.get("SELECT age_group, village_level FROM child_profiles WHERE user_id = ?", [user.id]) as {
        age_group: string;
        village_level: number;
    };
    const domains = await store.all(`
    SELECT d.*, COUNT(c.id) AS challenge_count,
      SUM(CASE WHEN dc.id IS NOT NULL THEN 1 ELSE 0 END) AS completed_count
    FROM discovery_domains d
    LEFT JOIN discovery_challenges c ON c.domain_id = d.id AND c.age_group IN ('all', ?)
    LEFT JOIN discovery_completions dc ON dc.challenge_id = c.id AND dc.child_id = ? AND dc.completed_period = ?
    WHERE d.age_group IN ('all', ?) AND d.unlocked_at_village_level <= ?
    GROUP BY d.id ORDER BY d.id
  `, [profile.age_group, user.id, periodKey("weekly"), profile.age_group, profile.village_level]);
    const challenges = await store.all(`
    SELECT c.*, d.name AS domain_name, CASE WHEN dc.id IS NULL THEN 0 ELSE 1 END AS completed
    FROM discovery_challenges c JOIN discovery_domains d ON d.id = c.domain_id
    LEFT JOIN discovery_completions dc ON dc.challenge_id = c.id AND dc.child_id = ? AND dc.completed_period = CASE c.frequency WHEN 'daily' THEN date('now','localtime') WHEN 'monthly' THEN strftime('%Y-%m','now','localtime') ELSE date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days') END
    WHERE c.age_group IN ('all', ?) AND d.age_group IN ('all', ?) AND d.unlocked_at_village_level <= ?
    ORDER BY completed, c.id
  `, [user.id, profile.age_group, profile.age_group, profile.village_level]);
    response.json({ domains, challenges });
});
discoveryRouter.patch("/challenges/:id/complete", async (request, response) => {
    const user = authenticatedUser(response.locals);
    const profile = await store.get("SELECT age_group, village_level FROM child_profiles WHERE user_id = ?", [user.id]) as {
        age_group: string;
        village_level: number;
    };
    const challenge = await store.get(`
      SELECT c.*, d.unlocked_at_village_level
      FROM discovery_challenges c
      JOIN discovery_domains d ON d.id = c.domain_id
      WHERE c.id = ? AND c.age_group IN ('all', ?) AND d.age_group IN ('all', ?)
    `, [request.params.id, profile.age_group, profile.age_group]) as {
        id: number;
        xp_reward: number;
        frequency: string;
        unlocked_at_village_level: number;
    } | undefined;
    if (!challenge)
        return response.status(404).json({ error: "Discovery challenge not found." });
    if (profile.village_level < challenge.unlocked_at_village_level) {
        return response.status(403).json({
            error: "This discovery domain is not unlocked yet.",
            requiredLevel: challenge.unlocked_at_village_level,
            currentLevel: profile.village_level,
        });
    }
    const period = periodKey(challenge.frequency);
    const result = await store.run("INSERT OR IGNORE INTO discovery_completions (child_id, challenge_id, completed_period) VALUES (?, ?, ?)", [user.id, challenge.id, period]);
    if (!result.changes)
        return response.status(409).json({ error: "Challenge already completed." });
    const progression = await recordXpEvent(user.id, challenge.xp_reward, "discovery", challenge.id, "Completed discovery challenge");
    const unlockedAchievements = await evaluateAchievements(user.id);
    return response.json({ completion: await store.get("SELECT * FROM discovery_completions WHERE child_id = ? AND challenge_id = ? AND completed_period = ?", [user.id, challenge.id, period]), progression, unlockedAchievements });
});
