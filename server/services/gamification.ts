import { store, type Store } from "../db/store";
export const levelNames: Record<number, string> = {
    1: "Starter",
    5: "Consistent Builder",
    10: "Serious Operator",
    20: "High-Value Profile",
    30: "Independent Builder",
};
export function levelFromXp(totalXp: number): number {
    return Math.max(1, Math.floor(Math.max(0, totalXp) / 500) + 1);
}
export function titleForLevel(level: number): string {
    const threshold = Object.keys(levelNames).map(Number).filter((value) => value <= level).sort((a, b) => b - a)[0] ?? 1;
    return levelNames[threshold];
}
export function distractionRisk(activeGoals: number, activeProjects: number): "low" | "medium" | "high" {
    const activeWork = activeGoals + activeProjects;
    if (activeWork > 8)
        return "high";
    if (activeWork > 5)
        return "medium";
    return "low";
}
export async function recordXpEvent(userId: number, amount: number, sourceType: string, sourceId: number | null, reason: string): Promise<{
    totalXp: number;
    currentStreak: number;
    level: number;
    levelTitle: string;
}>;
export async function recordXpEvent(database: Store, userId: number, amount: number, sourceType: string, sourceId: number | null, reason: string): Promise<{
    totalXp: number;
    currentStreak: number;
    level: number;
    levelTitle: string;
}>;
export async function recordXpEvent(
    databaseOrUserId: Store | number,
    userIdOrAmount: number,
    amountOrSourceType: number | string,
    sourceTypeOrSourceId: string | number | null,
    sourceIdOrReason: number | string | null,
    optionalReason?: string,
) {
    const database = typeof databaseOrUserId === "number" ? store : databaseOrUserId;
    const userId = typeof databaseOrUserId === "number" ? databaseOrUserId : userIdOrAmount;
    const amount = typeof databaseOrUserId === "number" ? userIdOrAmount : amountOrSourceType;
    const sourceType = typeof databaseOrUserId === "number" ? amountOrSourceType : sourceTypeOrSourceId;
    const sourceId = typeof databaseOrUserId === "number" ? sourceTypeOrSourceId : sourceIdOrReason;
    const reason = typeof databaseOrUserId === "number" ? sourceIdOrReason : optionalReason;
    if (typeof amount !== "number" || typeof sourceType !== "string" || (sourceId !== null && typeof sourceId !== "number") || typeof reason !== "string") {
        throw new Error("Invalid XP event arguments.");
    }
    await database.run(`
    INSERT INTO xp_events (user_id, source_type, source_id, amount, reason)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, sourceType, sourceId, amount, reason]);
    const totalXp = await database.get("SELECT COALESCE(SUM(amount), 0) AS total_xp FROM xp_events WHERE user_id = ?", [userId]) as {
        total_xp: number;
    };
    const currentStreak = await calculateCurrentStreak(database, userId);
    await database.run("UPDATE users SET total_xp = ?, current_streak = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [totalXp.total_xp, currentStreak, userId]);
    return {
        totalXp: totalXp.total_xp,
        currentStreak,
        level: levelFromXp(totalXp.total_xp),
        levelTitle: titleForLevel(levelFromXp(totalXp.total_xp)),
    };
}
export async function calculateCurrentStreak(userId: number): Promise<number>;
export async function calculateCurrentStreak(database: Store, userId: number): Promise<number>;
export async function calculateCurrentStreak(databaseOrUserId: Store | number, optionalUserId?: number): Promise<number> {
    const database = typeof databaseOrUserId === "number" ? store : databaseOrUserId;
    const userId = typeof databaseOrUserId === "number" ? databaseOrUserId : optionalUserId;
    if (userId === undefined)
        throw new Error("A user id is required to calculate a streak.");
    const rows = await database.all(`
    SELECT DISTINCT date(created_at, 'localtime') AS day
    FROM xp_events
    WHERE user_id = ?
    ORDER BY day DESC
  `, [userId]) as Array<{
        day: string;
    }>;
    let expected = new Date();
    expected.setHours(0, 0, 0, 0);
    let streak = 0;
    let first = true;
    for (const row of rows) {
        const current = new Date(`${row.day}T00:00:00`);
        const diffDays = Math.round((expected.getTime() - current.getTime()) / 86400000);
        if (first && diffDays !== 0)
            return 0;
        first = false;
        if (diffDays === 0) {
            streak += 1;
            expected.setDate(expected.getDate() - 1);
            continue;
        }
        if (diffDays === 1) {
            streak += 1;
            expected = current;
            expected.setDate(expected.getDate() - 1);
            continue;
        }
        break;
    }
    return streak;
}
