import { db } from "../db/database";
import { levelFromXp } from "./gamification";

const definitions = [
  ["first_quest", "First Quest", "Complete your first real-world quest.", "flag", 25],
  ["first_streak", "First Streak", "Reach a seven-day global streak.", "flame", 50],
  ["apprentice_explorer", "Apprentice Explorer", "Complete your first discovery challenge.", "compass", 30],
  ["co_adventurer", "Co-adventurer", "Complete your first parent-child mission.", "heart", 100],
  ["rhythm_keeper", "Rhythm Keeper", "Complete your first weekly review.", "calendar", 50],
  ["builder", "Builder", "Reach village level 2.", "hammer", 75],
] as const;

export function ensureAchievementDefinitions() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO achievements (code, name, description, icon, xp_reward)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const definition of definitions) insert.run(...definition);
}

function qualifies(userId: number, code: string): boolean {
  if (code === "first_quest") {
    return (db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND is_completed = 1").get(userId) as { count: number }).count > 0;
  }
  if (code === "first_streak") {
    return (db.prepare("SELECT current_streak FROM users WHERE id = ?").get(userId) as { current_streak: number }).current_streak >= 7;
  }
  if (code === "apprentice_explorer") {
    return (db.prepare("SELECT COUNT(*) AS count FROM discovery_completions WHERE child_id = ?").get(userId) as { count: number }).count > 0;
  }
  if (code === "co_adventurer") {
    return (db.prepare("SELECT COUNT(*) AS count FROM parent_child_missions WHERE child_id = ? AND status = 'completed' AND validated_by_parent = 1").get(userId) as { count: number }).count > 0;
  }
  if (code === "rhythm_keeper") {
    return (db.prepare("SELECT COUNT(*) AS count FROM reviews WHERE user_id = ? AND review_type = 'weekly'").get(userId) as { count: number }).count > 0;
  }
  if (code === "builder") {
    const progress = db.prepare("SELECT total_xp FROM users WHERE id = ?").get(userId) as { total_xp: number };
    return levelFromXp(progress.total_xp) >= 2;
  }
  return false;
}

export function evaluateAchievements(userId: number) {
  ensureAchievementDefinitions();
  const achievements = db.prepare("SELECT id, code, name, xp_reward FROM achievements ORDER BY id").all() as Array<{ id: number; code: string; name: string; xp_reward: number }>;
  const unlocked: Array<{ id: number; code: string; name: string }> = [];

  db.exec("BEGIN IMMEDIATE");
  try {
    for (const achievement of achievements) {
      const exists = db.prepare("SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?").get(userId, achievement.id);
      if (exists || !qualifies(userId, achievement.code)) continue;
      db.prepare("INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)").run(userId, achievement.id);
      if (achievement.xp_reward > 0) {
        db.prepare("INSERT INTO xp_events (user_id, source_type, source_id, amount, reason) VALUES (?, 'achievement', ?, ?, ?)").run(userId, achievement.id, achievement.xp_reward, `Achievement unlocked: ${achievement.name}`);
      }
      unlocked.push({ id: achievement.id, code: achievement.code, name: achievement.name });
    }
    const total = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM xp_events WHERE user_id = ?").get(userId) as { total: number };
    db.prepare("UPDATE users SET total_xp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(total.total, userId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return unlocked;
}

export function achievementSummary(userId: number) {
  ensureAchievementDefinitions();
  evaluateAchievements(userId);
  return db.prepare(`
    SELECT a.*, ua.unlocked_at, CASE WHEN ua.user_id IS NULL THEN 0 ELSE 1 END AS unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
    ORDER BY unlocked DESC, a.id
  `).all(userId);
}
