import { store, type Store } from "../db/store";
import { levelFromXp, recordXpEvent } from "./gamification";
const definitions = [
    ["first_quest", "First Quest", "Complete your first real-world quest.", "flag", 25],
    ["first_streak", "First Streak", "Reach a seven-day global streak.", "flame", 50],
    ["apprentice_explorer", "Apprentice Explorer", "Complete your first discovery challenge.", "compass", 30],
    ["co_adventurer", "Co-adventurer", "Complete your first parent-child mission.", "heart", 100],
    ["rhythm_keeper", "Rhythm Keeper", "Complete your first weekly review.", "calendar", 50],
    ["builder", "Builder", "Reach village level 2.", "hammer", 75],
] as const;
export async function ensureAchievementDefinitions(database: Store = store) {
    for (const definition of definitions) {
        await database.run(`
      INSERT OR IGNORE INTO achievements (code, name, description, icon, xp_reward)
      VALUES (?, ?, ?, ?, ?)
    `, [...definition]);
    }
}
async function qualifies(database: Store, userId: number, code: string): Promise<boolean> {
    if (code === "first_quest") {
        return (await database.get("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND is_completed = 1", [userId]) as {
            count: number;
        }).count > 0;
    }
    if (code === "first_streak") {
        return (await database.get("SELECT current_streak FROM users WHERE id = ?", [userId]) as {
            current_streak: number;
        }).current_streak >= 7;
    }
    if (code === "apprentice_explorer") {
        return (await database.get("SELECT COUNT(*) AS count FROM discovery_completions WHERE child_id = ?", [userId]) as {
            count: number;
        }).count > 0;
    }
    if (code === "co_adventurer") {
        return (await database.get("SELECT COUNT(*) AS count FROM parent_child_missions WHERE child_id = ? AND status = 'completed' AND validated_by_parent = 1", [userId]) as {
            count: number;
        }).count > 0;
    }
    if (code === "rhythm_keeper") {
        return (await database.get("SELECT COUNT(*) AS count FROM reviews WHERE user_id = ? AND review_type = 'weekly'", [userId]) as {
            count: number;
        }).count > 0;
    }
    if (code === "builder") {
        const progress = await database.get("SELECT total_xp FROM users WHERE id = ?", [userId]) as {
            total_xp: number;
        };
        return levelFromXp(progress.total_xp) >= 2;
    }
    return false;
}
async function evaluateWithStore(database: Store, userId: number) {
    await ensureAchievementDefinitions(database);
    const achievements = await database.all("SELECT id, code, name, xp_reward FROM achievements ORDER BY id", []) as Array<{
        id: number;
        code: string;
        name: string;
        xp_reward: number;
    }>;
    const unlocked: Array<{
        id: number;
        code: string;
        name: string;
    }> = [];
    for (const achievement of achievements) {
        const exists = await database.get("SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?", [userId, achievement.id]);
        if (exists || !await qualifies(database, userId, achievement.code))
            continue;
        const result = await database.run("INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)", [userId, achievement.id]);
        if (!result.changes)
            continue;
        if (achievement.xp_reward > 0) {
            await recordXpEvent(database, userId, achievement.xp_reward, "achievement", achievement.id, `Achievement unlocked: ${achievement.name}`);
        }
        unlocked.push({ id: achievement.id, code: achievement.code, name: achievement.name });
    }
    return unlocked;
}
export async function evaluateAchievements(userId: number): Promise<Array<{ id: number; code: string; name: string }>>;
export async function evaluateAchievements(database: Store, userId: number): Promise<Array<{ id: number; code: string; name: string }>>;
export async function evaluateAchievements(databaseOrUserId: Store | number, optionalUserId?: number) {
    if (typeof databaseOrUserId === "number")
        return store.transaction((transaction) => evaluateWithStore(transaction, databaseOrUserId));
    if (optionalUserId === undefined)
        throw new Error("A user id is required to evaluate achievements.");
    return evaluateWithStore(databaseOrUserId, optionalUserId);
}
export async function achievementSummary(userId: number) {
    await ensureAchievementDefinitions();
    await evaluateAchievements(userId);
    return await store.all(`
    SELECT a.*, ua.unlocked_at, CASE WHEN ua.user_id IS NULL THEN 0 ELSE 1 END AS unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
    ORDER BY unlocked DESC, a.id
  `, [userId]);
}
