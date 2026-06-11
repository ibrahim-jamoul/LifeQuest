import { db } from "../db/database";

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function scoreToLevel(score: number): number {
  if (score >= 0.8) return 5;
  if (score >= 0.65) return 4;
  if (score >= 0.45) return 3;
  if (score >= 0.25) return 2;
  return 1;
}

function persistentZone(userId: number, zoneId: string, calculatedProgress: number) {
  const progress = clamp(calculatedProgress);
  db.prepare(`INSERT INTO village_state (user_id, zone_id, level, progress, unlocked)
    VALUES (?, ?, ?, ?, 1) ON CONFLICT(user_id, zone_id) DO UPDATE SET
    progress = MAX(village_state.progress, excluded.progress),
    level = MAX(village_state.level, excluded.level),
    last_updated = CURRENT_TIMESTAMP`).run(userId, zoneId, scoreToLevel(progress), progress);
  return db.prepare("SELECT level, progress FROM village_state WHERE user_id = ? AND zone_id = ?").get(userId, zoneId) as { level: number; progress: number };
}

function streakFromDays(days: Array<{ day: string }>): number {
  let streak = 0;
  let expected = new Date();
  expected.setHours(0, 0, 0, 0);
  let first = true;
  for (const row of days) {
    const current = new Date(`${row.day}T00:00:00`);
    const diffDays = Math.round((expected.getTime() - current.getTime()) / 86400000);
    if (first && diffDays !== 0) return 0;
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

function getHabitStats(userId: number) {
  return db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM habit_logs hl JOIN habits h2 ON h2.id = hl.habit_id WHERE h2.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= date('now','localtime','-29 days')) AS completed,
      COALESCE(SUM(CASE h.frequency WHEN 'daily' THEN 30 WHEN 'weekly' THEN 4 ELSE 30 END), 0) AS total
    FROM habits h
    WHERE h.user_id = ? AND h.is_active = 1
  `).get(userId, userId) as { completed: number; total: number };
}

export function getGardenState(userId: number) {
  const activeHabits = db.prepare("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND is_active = 1").get(userId) as { count: number };
  const habitRows = db.prepare(`
    SELECT DISTINCT date(hl.completed_on) AS day
    FROM habit_logs hl
    JOIN habits h ON h.id = hl.habit_id
    WHERE h.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= date('now','localtime','-29 days')
    ORDER BY day DESC
  `).all(userId) as Array<{ day: string }>;
  const stats = getHabitStats(userId);
  const completionRate = stats.total === 0 ? 0 : stats.completed / stats.total;
  const currentStreak = streakFromDays(habitRows);
  const levelScore = clamp((Math.min(activeHabits.count / 10, 1) * 0.45) + (completionRate * 0.55));
  return {
    level: scoreToLevel(levelScore),
    progress: levelScore,
    currentStreak,
    longestStreak: (db.prepare("SELECT COALESCE(MAX(longest_streak), 0) AS value FROM habits WHERE user_id = ?").get(userId) as { value: number }).value,
  };
}

export function getHomeAreaState(userId: number) {
  const activeHabits = db.prepare("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND is_active = 1").get(userId) as { count: number };
  const stats = getHabitStats(userId);
  const completionRate = stats.total === 0 ? 0 : stats.completed / stats.total;
  const levelScore = clamp((Math.min(activeHabits.count / 10, 1) * 0.5) + (completionRate * 0.5));
  return {
    level: scoreToLevel(levelScore),
    progress: levelScore,
    activeHabits: activeHabits.count,
    completionRate,
  };
}

export function getVillageState(userId: number) {
  const totalXp = (db.prepare("SELECT total_xp FROM users WHERE id = ?").get(userId) as { total_xp: number }).total_xp;
  const currentStreak = (db.prepare("SELECT current_streak FROM users WHERE id = ?").get(userId) as { current_streak: number }).current_streak;
  const reviewCount = (db.prepare("SELECT COUNT(*) AS count FROM reviews WHERE user_id = ? AND review_type = 'weekly'").get(userId) as { count: number }).count;
  const pathwaysProgress = clamp(reviewCount / 5);
  const projectStats = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed FROM projects WHERE user_id = ?").get(userId) as { total: number; completed: number | null };
  const goalStats = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed, COALESCE(AVG(progress),0) AS average FROM goals WHERE user_id = ?").get(userId) as { total: number; completed: number | null; average: number };
  const focusCount = (db.prepare("SELECT COUNT(*) AS count FROM focus_priorities WHERE user_id = ? AND week_start = date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days')").get(userId) as { count: number }).count;
  const discoveryStats = db.prepare("SELECT COUNT(DISTINCT c.domain_id) AS domains, COUNT(dc.id) AS completed FROM discovery_completions dc JOIN discovery_challenges c ON c.id = dc.challenge_id WHERE dc.child_id = ?").get(userId) as { domains: number; completed: number };
  const campaign = db.prepare("SELECT id FROM school_campaigns WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1").get(userId) as { id: number } | undefined;
  const campaignProgress = campaign ? (db.prepare("SELECT COALESCE(AVG(progress),0) AS progress FROM campaign_chapters WHERE campaign_id = ?").get(campaign.id) as { progress: number }).progress / 100 : 0;
  const workshopProgress = projectStats.total ? clamp(((projectStats.completed ?? 0) / projectStats.total) * .6 + Math.min(projectStats.total / 5, 1) * .4) : 0;
  const learningProgress = goalStats.total ? clamp(goalStats.average / 100) : 0;
  const discoveryProgress = clamp(discoveryStats.completed / 6);
  const focusProgress = clamp(focusCount / 3);
  const villageLevel = Math.max(1, Math.floor(totalXp / 500) + 1);
  const garden = getGardenState(userId);
  const homeArea = getHomeAreaState(userId);
  db.prepare("UPDATE child_profiles SET village_level = MAX(village_level, ?) WHERE user_id = ?").run(villageLevel, userId);
  return {
    villageLevel,
    globalXP: totalXp,
    currentStreak,
    zones: {
      garden: { ...garden, ...persistentZone(userId, "garden", garden.progress) },
      home_area: { ...homeArea, ...persistentZone(userId, "home", homeArea.progress) },
      workshop: persistentZone(userId, "workshop", workshopProgress),
      learning: persistentZone(userId, "learning", learningProgress),
      market: persistentZone(userId, "discovery", discoveryProgress),
      town_hall: persistentZone(userId, "town-hall", campaignProgress),
      lighthouse: persistentZone(userId, "lighthouse", focusProgress),
      pathways: persistentZone(userId, "pathways", pathwaysProgress),
    },
  };
}
