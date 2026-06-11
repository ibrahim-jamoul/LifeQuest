// server/app.ts
import cors from "cors";
import express from "express";

// server/middleware/errorHandler.ts
var errorHandler = (error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "An unexpected error occurred." });
};

// server/routes/auth.ts
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

// server/db/postgres.ts
import { Pool, types } from "pg";
types.setTypeParser(20, Number);
types.setTypeParser(1700, Number);
function requiredDatabaseUrl(preferDirectConnection) {
  const databaseUrl = preferDirectConnection ? process.env.DIRECT_URL ?? process.env.DATABASE_URL : process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. DIRECT_URL is recommended for migration commands.");
  }
  return databaseUrl;
}
function createPostgresPool(preferDirectConnection = false) {
  const useSsl = process.env.DATABASE_SSL !== "false";
  return new Pool({
    connectionString: requiredDatabaseUrl(preferDirectConnection),
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 3,
    connectionTimeoutMillis: 1e4
  });
}

// server/db/store.ts
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
function sqliteStore() {
  const require2 = createRequire(import.meta.url);
  const { DatabaseSync } = require2("node:sqlite");
  const databasePath = resolve(process.env.DATABASE_PATH ?? "./data/lifequest.db");
  mkdirSync(dirname(databasePath), { recursive: true });
  const sqlite = new DatabaseSync(databasePath);
  sqlite.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  const sqliteValues = (values) => values.map((value) => typeof value === "boolean" ? Number(value) : value);
  const store2 = {
    async get(sql, values = []) {
      return sqlite.prepare(sql).get(...sqliteValues(values));
    },
    async all(sql, values = []) {
      return sqlite.prepare(sql).all(...sqliteValues(values));
    },
    async run(sql, values = []) {
      const result = sqlite.prepare(sql).run(...sqliteValues(values));
      return { changes: Number(result.changes), lastInsertRowid: Number(result.lastInsertRowid) };
    },
    async transaction(operation) {
      sqlite.exec("begin immediate");
      try {
        const result = await operation(store2);
        sqlite.exec("commit");
        return result;
      } catch (error) {
        sqlite.exec("rollback");
        throw error;
      }
    },
    async close() {
    }
  };
  return store2;
}
function replaceQuestionMarks(sql) {
  let index = 0;
  return sql.replaceAll("?", () => `$${++index}`);
}
var booleanColumns = [
  "is_completed",
  "is_active",
  "validated_by_parent",
  "unlocked",
  "is_read",
  "onboarding_completed",
  "habit_reminders",
  "review_reminders"
];
function postgresSql(sql) {
  let translated = sql.replaceAll("date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days')", "date_trunc('week', current_date)::date").replaceAll("strftime('%Y-%m','now','localtime')", "to_char(current_date, 'YYYY-MM')").replaceAll("date('now','localtime')", "current_date").replaceAll("date('now')", "current_date").replaceAll("datetime('now','-29 days')", "(current_timestamp - interval '29 days')").replaceAll("datetime('now','-7 days')", "(current_timestamp - interval '7 days')").replaceAll("date('now','localtime','-29 days')", "(current_date - interval '29 days')::date").replaceAll("date('now','-29 days')", "(current_date - interval '29 days')::date").replaceAll("date('now','localtime','-7 days')", "(current_date - interval '7 days')::date").replaceAll("date('now','localtime','start of month')", "date_trunc('month', current_date)::date").replaceAll("date('now','localtime','weekday 1','-7 days')", "date_trunc('week', current_date)::date").replace(/date\(([\w.]+),\s*'localtime'\)/g, "$1::date").replace(/date\(([\w.]+)\)/g, "$1::date").replaceAll("INSERT OR IGNORE", "INSERT").replaceAll("MAX(village_state.progress, excluded.progress)", "GREATEST(village_state.progress, excluded.progress)").replaceAll("MAX(village_state.level, excluded.level)", "GREATEST(village_state.level, excluded.level)").replaceAll("MAX(longest_streak, ?)", "GREATEST(longest_streak, ?)").replaceAll("MAX(village_level, ?)", "GREATEST(village_level, ?)").replaceAll("MAX(progress, ?)", "GREATEST(progress, ?)");
  for (const column of booleanColumns) {
    translated = translated.replace(new RegExp(`\\b${column}\\s*=\\s*1\\b`, "g"), `${column} = true`).replace(new RegExp(`\\b${column}\\s*=\\s*0\\b`, "g"), `${column} = false`).replace(new RegExp(`(\\b${column}\\b[^)]*values\\s*\\([^)]*),\\s*1\\s*\\)`, "i"), "$1, true)").replace(new RegExp(`(\\b${column}\\b[^)]*values\\s*\\([^)]*),\\s*0\\s*\\)`, "i"), "$1, false)");
  }
  return replaceQuestionMarks(translated);
}
function addConflictFallback(sql) {
  if (!/^\s*insert\s+/i.test(sql) || /\bon conflict\b/i.test(sql)) return sql;
  return `${sql} on conflict do nothing`;
}
function postgresStore() {
  const pool = createPostgresPool();
  const createStore = (query) => ({
    async get(sql, values = []) {
      const result = await query(postgresSql(sql), values);
      return result.rows[0];
    },
    async all(sql, values = []) {
      const result = await query(postgresSql(sql), values);
      return result.rows;
    },
    async run(sql, values = []) {
      let translated = postgresSql(sql);
      const ignoredInsert = /INSERT OR IGNORE/i.test(sql);
      if (ignoredInsert) translated = addConflictFallback(translated);
      const table = translated.match(/^\s*insert\s+into\s+["']?([\w-]+)/i)?.[1];
      const tablesWithId = /* @__PURE__ */ new Set([
        "users",
        "life_areas",
        "goals",
        "projects",
        "milestones",
        "tasks",
        "habits",
        "habit_logs",
        "notes",
        "reviews",
        "xp_events",
        "achievements",
        "user_achievements",
        "focus_priorities",
        "weekly_challenges",
        "parent_child_missions",
        "discovery_domains",
        "discovery_challenges",
        "discovery_completions",
        "village_state",
        "auth_sessions",
        "school_campaigns",
        "campaign_chapters",
        "notifications"
      ]);
      const wantsId = Boolean(table && tablesWithId.has(table)) && !/\breturning\b/i.test(translated);
      if (wantsId) translated = `${translated} returning id`;
      const result = await query(translated, values);
      return {
        changes: result.rowCount ?? 0,
        lastInsertRowid: Number(result.rows[0]?.id ?? 0)
      };
    },
    async transaction(operation) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await operation(createStore((text, values) => client.query(text, values)));
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    }
  });
  return createStore((text, values) => pool.query(text, values));
}
var store = process.env.DATABASE_URL ? postgresStore() : sqliteStore();

// server/services/auth.ts
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
var SESSION_DAYS = 30;
function verifyPassword(password, stored) {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString().replace("T", " ").slice(0, 19);
  await store.run("INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)", [userId, hashToken(token), expiresAt]);
  return token;
}
async function deleteSession(token) {
  await store.run("DELETE FROM auth_sessions WHERE token_hash = ?", [hashToken(token)]);
}
async function getSessionUser(token) {
  const row = await store.get(`
    SELECT u.id, u.email, u.display_name,
      CASE WHEN cp.user_id IS NOT NULL THEN 'child' ELSE 'parent' END AS role
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN child_profiles cp ON cp.user_id = u.id
    LEFT JOIN parent_profiles pp ON pp.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP
      AND (cp.user_id IS NOT NULL OR pp.user_id IS NOT NULL)
  `, [hashToken(token)]);
  return row ? { id: row.id, email: row.email, displayName: row.display_name, role: row.role } : null;
}
function getBearerToken(header) {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

// server/middleware/auth.ts
var requireAuth = async (request, response, next) => {
  const token = getBearerToken(request.header("authorization"));
  const user = token ? await getSessionUser(token) : null;
  if (!user) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }
  response.locals.user = user;
  response.locals.token = token;
  next();
};
var requireChild = (_request, response, next) => {
  const user = response.locals.user;
  if (!user || user.role !== "child") {
    response.status(403).json({ error: "A child account is required." });
    return;
  }
  next();
};
var requireParent = (_request, response, next) => {
  const user = response.locals.user;
  if (!user || user.role !== "parent") {
    response.status(403).json({ error: "A parent account is required." });
    return;
  }
  next();
};
function authenticatedUser(locals) {
  return locals.user;
}

// server/routes/auth.ts
var loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
var profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  age: z.number().int().min(7).max(16).nullable().optional(),
  grade: z.string().trim().max(40).nullable().optional()
});
var authRouter = Router();
var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." }
});
authRouter.post("/login", loginLimiter, async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  const user = await store.get("SELECT id, password_hash FROM users WHERE email = ?", [parsed.data.email.toLowerCase()]);
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) return response.status(401).json({ error: "Invalid email or password." });
  return response.json({ token: await createSession(user.id) });
});
authRouter.get("/me", requireAuth, async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const profile = user.role === "child" ? await store.get("SELECT age, grade, age_group, village_level, parent_id FROM child_profiles WHERE user_id = ?", [user.id]) : await store.get("SELECT id FROM parent_profiles WHERE user_id = ?", [user.id]);
  response.json({ user, profile });
});
authRouter.post("/logout", requireAuth, async (_request, response) => {
  await deleteSession(response.locals.token);
  response.status(204).send();
});
authRouter.put("/profile", requireAuth, async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = profileSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: parsed.error.flatten() });
  await store.transaction(async (transaction) => {
    await transaction.run("UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [parsed.data.displayName, user.id]);
    if (user.role === "child") {
      await transaction.run("UPDATE child_profiles SET age = ?, grade = ? WHERE user_id = ?", [parsed.data.age ?? null, parsed.data.grade ?? null, user.id]);
    }
  });
  const updatedUser = { ...user, displayName: parsed.data.displayName };
  const profile = user.role === "child" ? await store.get("SELECT age, grade, age_group, village_level, parent_id FROM child_profiles WHERE user_id = ?", [user.id]) : await store.get("SELECT id FROM parent_profiles WHERE user_id = ?", [user.id]);
  return response.json({ user: updatedUser, profile });
});

// server/routes/achievements.ts
import { Router as Router2 } from "express";

// server/services/gamification.ts
var levelNames = {
  1: "Starter",
  5: "Consistent Builder",
  10: "Serious Operator",
  20: "High-Value Profile",
  30: "Independent Builder"
};
function levelFromXp(totalXp) {
  return Math.max(1, Math.floor(Math.max(0, totalXp) / 500) + 1);
}
function titleForLevel(level) {
  const threshold = Object.keys(levelNames).map(Number).filter((value) => value <= level).sort((a, b) => b - a)[0] ?? 1;
  return levelNames[threshold];
}
async function recordXpEvent(userId, amount, sourceType, sourceId, reason) {
  await store.run(`
    INSERT INTO xp_events (user_id, source_type, source_id, amount, reason)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, sourceType, sourceId, amount, reason]);
  const totalXp = await store.get("SELECT COALESCE(SUM(amount), 0) AS total_xp FROM xp_events WHERE user_id = ?", [userId]);
  const currentStreak = await calculateCurrentStreak(userId);
  await store.run("UPDATE users SET total_xp = ?, current_streak = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [totalXp.total_xp, currentStreak, userId]);
  return {
    totalXp: totalXp.total_xp,
    currentStreak,
    level: levelFromXp(totalXp.total_xp),
    levelTitle: titleForLevel(levelFromXp(totalXp.total_xp))
  };
}
async function calculateCurrentStreak(userId) {
  const rows = await store.all(`
    SELECT DISTINCT date(created_at, 'localtime') AS day
    FROM xp_events
    WHERE user_id = ?
    ORDER BY day DESC
  `, [userId]);
  let expected = /* @__PURE__ */ new Date();
  expected.setHours(0, 0, 0, 0);
  let streak = 0;
  let first = true;
  for (const row of rows) {
    const current = /* @__PURE__ */ new Date(`${row.day}T00:00:00`);
    const diffDays = Math.round((expected.getTime() - current.getTime()) / 864e5);
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

// server/services/achievements.ts
var definitions = [
  ["first_quest", "First Quest", "Complete your first real-world quest.", "flag", 25],
  ["first_streak", "First Streak", "Reach a seven-day global streak.", "flame", 50],
  ["apprentice_explorer", "Apprentice Explorer", "Complete your first discovery challenge.", "compass", 30],
  ["co_adventurer", "Co-adventurer", "Complete your first parent-child mission.", "heart", 100],
  ["rhythm_keeper", "Rhythm Keeper", "Complete your first weekly review.", "calendar", 50],
  ["builder", "Builder", "Reach village level 2.", "hammer", 75]
];
async function ensureAchievementDefinitions() {
  for (const definition of definitions) {
    await store.run(`
      INSERT OR IGNORE INTO achievements (code, name, description, icon, xp_reward)
      VALUES (?, ?, ?, ?, ?)
    `, [...definition]);
  }
}
async function qualifies(userId, code) {
  if (code === "first_quest") {
    return (await store.get("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND is_completed = 1", [userId])).count > 0;
  }
  if (code === "first_streak") {
    return (await store.get("SELECT current_streak FROM users WHERE id = ?", [userId])).current_streak >= 7;
  }
  if (code === "apprentice_explorer") {
    return (await store.get("SELECT COUNT(*) AS count FROM discovery_completions WHERE child_id = ?", [userId])).count > 0;
  }
  if (code === "co_adventurer") {
    return (await store.get("SELECT COUNT(*) AS count FROM parent_child_missions WHERE child_id = ? AND status = 'completed' AND validated_by_parent = 1", [userId])).count > 0;
  }
  if (code === "rhythm_keeper") {
    return (await store.get("SELECT COUNT(*) AS count FROM reviews WHERE user_id = ? AND review_type = 'weekly'", [userId])).count > 0;
  }
  if (code === "builder") {
    const progress = await store.get("SELECT total_xp FROM users WHERE id = ?", [userId]);
    return levelFromXp(progress.total_xp) >= 2;
  }
  return false;
}
async function evaluateAchievements(userId) {
  await ensureAchievementDefinitions();
  const achievements = await store.all("SELECT id, code, name, xp_reward FROM achievements ORDER BY id", []);
  const unlocked = [];
  await store.transaction(async (transaction) => {
    for (const achievement of achievements) {
      const exists = await transaction.get("SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?", [userId, achievement.id]);
      if (exists || !await qualifies(userId, achievement.code))
        continue;
      await transaction.run("INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)", [userId, achievement.id]);
      if (achievement.xp_reward > 0) {
        await transaction.run("INSERT INTO xp_events (user_id, source_type, source_id, amount, reason) VALUES (?, 'achievement', ?, ?, ?)", [userId, achievement.id, achievement.xp_reward, `Achievement unlocked: ${achievement.name}`]);
      }
      unlocked.push({ id: achievement.id, code: achievement.code, name: achievement.name });
    }
    const total = await transaction.get("SELECT COALESCE(SUM(amount), 0) AS total FROM xp_events WHERE user_id = ?", [userId]);
    await transaction.run("UPDATE users SET total_xp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [total.total, userId]);
  });
  return unlocked;
}
async function achievementSummary(userId) {
  await ensureAchievementDefinitions();
  await evaluateAchievements(userId);
  return await store.all(`
    SELECT a.*, ua.unlocked_at, CASE WHEN ua.user_id IS NULL THEN 0 ELSE 1 END AS unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
    ORDER BY unlocked DESC, a.id
  `, [userId]);
}

// server/routes/achievements.ts
var achievementsRouter = Router2();
achievementsRouter.use(requireAuth);
achievementsRouter.use(requireChild);
achievementsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await achievementSummary(user.id));
});

// server/routes/dashboard.ts
import { Router as Router3 } from "express";
var dashboardRouter = Router3();
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
  const habits = await store.all(`
    SELECT h.*, EXISTS(
      SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime') AND hl.is_completed = 1
    ) AS completed_today
    FROM habits h WHERE h.user_id = ? AND h.is_active = 1 ORDER BY h.id
  `, [user.id]);
  const userProgress = await store.get("SELECT total_xp, current_streak FROM users WHERE id = ?", [user.id]);
  const profile = await store.get("SELECT village_level, age_group, grade FROM child_profiles WHERE user_id = ?", [user.id]);
  const activeParentMissions = await store.get("SELECT COUNT(*) AS count FROM parent_child_missions WHERE child_id = ? AND status = 'pending'", [user.id]);
  const activeGoals = await store.get("SELECT COUNT(*) AS count FROM goals WHERE user_id = ? AND status = 'in_progress'", [user.id]);
  const activeProjects = await store.get("SELECT COUNT(*) AS count FROM projects WHERE user_id = ? AND status IN ('idea','planned','active')", [user.id]);
  const weekStarted = await store.get("SELECT date('now','localtime','weekday 1','-7 days') AS week_start", []);
  const weeklyCompletion = await store.get(`
    SELECT
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_completed = 1 AND date(completed_at, 'localtime') >= ?) +
      (SELECT COUNT(*) FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= ?) AS total
  `, [user.id, weekStarted.week_start, user.id, weekStarted.week_start]);
  const monthStarted = await store.get("SELECT date('now','localtime','start of month') AS month_start", []);
  const monthlyCompletion = await store.get(`
    SELECT
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_completed = 1 AND date(completed_at, 'localtime') >= ?) +
      (SELECT COUNT(*) FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= ?) AS total
  `, [user.id, monthStarted.month_start, user.id, monthStarted.month_start]);
  const campaign = await store.get("SELECT id FROM school_campaigns WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", [user.id]);
  const schoolMonth = ((/* @__PURE__ */ new Date()).getMonth() + 4) % 12 + 1;
  const currentChapter = campaign ? await store.get("SELECT title, theme, progress FROM campaign_chapters WHERE campaign_id = ? AND month_number = ?", [campaign.id, schoolMonth]) : null;
  return response.json({
    date: (await store.get("SELECT date('now','localtime') AS date", [])).date,
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
      activeParentMissions: activeParentMissions.count
    }
  });
});
dashboardRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const activeGoals = await store.get("SELECT COUNT(*) AS count FROM goals WHERE user_id = ? AND status = 'in_progress'", [user.id]);
  const progress = await store.get("SELECT total_xp, current_streak FROM users WHERE id = ?", [user.id]);
  response.json({ activeGoals: activeGoals.count, totalXp: progress.total_xp, currentStreak: progress.current_streak, level: levelFromXp(progress.total_xp), levelTitle: titleForLevel(levelFromXp(progress.total_xp)) });
});

// server/routes/habits.ts
import { Router as Router4 } from "express";
import { z as z2 } from "zod";
async function recalculateHabitStreak(habitId) {
  const rows = await store.all(`
    SELECT DISTINCT date(completed_on) AS day
    FROM habit_logs
    WHERE habit_id = ? AND is_completed = 1
    ORDER BY day DESC
  `, [habitId]);
  let streak = 0;
  let expected = /* @__PURE__ */ new Date();
  expected.setHours(0, 0, 0, 0);
  let first = true;
  for (const row of rows) {
    const current = /* @__PURE__ */ new Date(`${row.day}T00:00:00`);
    const diffDays = Math.round((expected.getTime() - current.getTime()) / 864e5);
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
  await store.run("UPDATE habits SET current_streak = ?, longest_streak = MAX(longest_streak, ?) WHERE id = ?", [streak, streak, habitId]);
  return streak;
}
var habitSchema = z2.object({
  name: z2.string().trim().min(1).max(120),
  description: z2.string().max(500).default(""),
  frequency: z2.enum(["daily", "weekly", "custom"]).default("daily"),
  category: z2.string().trim().min(1).max(80),
  customSchedule: z2.string().max(500).nullable().optional(),
  goalId: z2.number().int().positive().nullable().optional()
});
var habitsRouter = Router4();
habitsRouter.use(requireAuth);
habitsRouter.use(requireChild);
habitsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await store.all(`
    SELECT h.*, EXISTS(
      SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime')
    ) AS completed_today
    FROM habits h WHERE h.user_id = ? ORDER BY h.is_active DESC, h.id DESC
  `, [user.id]));
});
habitsRouter.post("/", async (request, response) => {
  const parsed = habitSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  if (parsed.data.goalId && !await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [parsed.data.goalId, user.id]))
    return response.status(400).json({ error: "Linked goal is not available." });
  const result = await store.run(`
    INSERT INTO habits (user_id, goal_id, name, description, frequency, custom_schedule, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [user.id, parsed.data.goalId ?? null, parsed.data.name, parsed.data.description, parsed.data.frequency, parsed.data.customSchedule ?? null, parsed.data.category]);
  return response.status(201).json(await store.get("SELECT * FROM habits WHERE id = ?", [Number(result.lastInsertRowid)]));
});
habitsRouter.put("/:id", async (request, response) => {
  const parsed = habitSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  if (parsed.data.goalId && !await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [parsed.data.goalId, user.id]))
    return response.status(400).json({ error: "Linked goal is not available." });
  const result = await store.run(`
    UPDATE habits SET goal_id = ?, name = ?, description = ?, frequency = ?, custom_schedule = ?, category = ?
    WHERE id = ? AND user_id = ?
  `, [parsed.data.goalId ?? null, parsed.data.name, parsed.data.description, parsed.data.frequency, parsed.data.customSchedule ?? null, parsed.data.category, request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Habit not found." });
  return response.json(await store.get("SELECT * FROM habits WHERE id = ?", [request.params.id]));
});
habitsRouter.delete("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = await store.run("DELETE FROM habits WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Habit not found." });
  return response.status(204).send();
});
habitsRouter.post("/:id/log", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const habit = await store.get("SELECT id FROM habits WHERE id = ? AND user_id = ? AND is_active = 1", [request.params.id, user.id]);
  if (!habit)
    return response.status(404).json({ error: "Habit not found." });
  const existing = await store.get("SELECT id FROM habit_logs WHERE habit_id = ? AND completed_on = date('now','localtime')", [request.params.id]);
  await store.run(`
    INSERT INTO habit_logs (habit_id, completed_on, is_completed, note)
    VALUES (?, date('now','localtime'), ?, ?)
    ON CONFLICT(habit_id, completed_on) DO UPDATE SET is_completed = 1, note = excluded.note
  `, [request.params.id, true, typeof request.body?.note === "string" ? request.body.note.slice(0, 500) : ""]);
  const log = await store.get("SELECT * FROM habit_logs WHERE habit_id = ? AND completed_on = date('now','localtime')", [request.params.id]);
  const streak = await recalculateHabitStreak(Number(request.params.id));
  if (!existing) {
    const habitData = await store.get("SELECT id, xp_reward FROM habits WHERE id = ?", [request.params.id]);
    let progression = await recordXpEvent(user.id, habitData.xp_reward, "habit", habitData.id, "Completed habit");
    if (streak === 7 && !await store.get("SELECT 1 FROM xp_events WHERE user_id = ? AND source_type = 'habit_streak' AND source_id = ?", [user.id, habitData.id])) {
      progression = await recordXpEvent(user.id, 50, "habit_streak", habitData.id, "Reached a seven-day habit streak");
    }
    const unlockedAchievements = await evaluateAchievements(user.id);
    return response.status(201).json({ ...log, streak, progression, unlockedAchievements });
  }
  return response.status(200).json({ ...log, streak });
});
habitsRouter.get("/:id/logs", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const habit = await store.get("SELECT id FROM habits WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!habit)
    return response.status(404).json({ error: "Habit not found." });
  return response.json(await store.all("SELECT * FROM habit_logs WHERE habit_id = ? AND completed_on >= date('now','localtime','-29 days') ORDER BY completed_on DESC", [request.params.id]));
});

// server/routes/goals.ts
import { Router as Router5 } from "express";
import { z as z3 } from "zod";
async function syncGoalProgress(goalId) {
  const stats = await store.get("SELECT COUNT(*) AS count, COALESCE(AVG(progress), 0) AS progress FROM milestones WHERE goal_id = ?", [goalId]);
  await store.run("UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [stats.count > 0 ? Math.round(stats.progress) : 0, goalId]);
}
var goalSchema = z3.object({
  title: z3.string().trim().min(1).max(160),
  description: z3.string().max(1e3).default(""),
  category: z3.string().trim().min(1).max(80),
  priority: z3.enum(["low", "medium", "high", "critical"]).default("medium"),
  deadline: z3.string().date().nullable().optional(),
  status: z3.enum(["not_started", "in_progress", "paused", "completed"]).default("not_started"),
  progress: z3.number().int().min(0).max(100).default(0),
  notes: z3.string().max(2e3).default("")
});
var goalsRouter = Router5();
goalsRouter.use(requireAuth);
goalsRouter.use(requireChild);
goalsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await store.all("SELECT * FROM goals WHERE user_id = ? ORDER BY updated_at DESC, id DESC", [user.id]));
});
goalsRouter.get("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT * FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  const milestones = await store.all("SELECT * FROM milestones WHERE goal_id = ? ORDER BY id DESC", [request.params.id]);
  const notes = await store.all("SELECT * FROM notes WHERE goal_id = ? ORDER BY created_at DESC", [request.params.id]);
  const tasks = await store.all("SELECT * FROM tasks WHERE goal_id = ? AND user_id = ? ORDER BY is_completed, due_date, id DESC", [request.params.id, user.id]);
  const habits = await store.all("SELECT * FROM habits WHERE goal_id = ? AND user_id = ? ORDER BY is_active DESC, id DESC", [request.params.id, user.id]);
  return response.json({ goal, milestones, notes, tasks, habits });
});
goalsRouter.post("/", async (request, response) => {
  const parsed = goalSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  const result = await store.run(`
    INSERT INTO goals (user_id, title, description, category, priority, deadline, status, progress, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [user.id, parsed.data.title, parsed.data.description, parsed.data.category, parsed.data.priority, parsed.data.deadline ?? null, parsed.data.status, parsed.data.progress, parsed.data.notes]);
  return response.status(201).json(await store.get("SELECT * FROM goals WHERE id = ?", [Number(result.lastInsertRowid)]));
});
goalsRouter.put("/:id", async (request, response) => {
  const parsed = goalSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  const current = await store.get("SELECT status FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!current)
    return response.status(404).json({ error: "Goal not found." });
  if (parsed.data.status === "completed" && current.status !== "completed")
    return response.status(400).json({ error: "Use the complete-goal action to earn verified XP." });
  const result = await store.run(`
    UPDATE goals SET title = ?, description = ?, category = ?, priority = ?, deadline = ?, status = ?, progress = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `, [parsed.data.title, parsed.data.description, parsed.data.category, parsed.data.priority, parsed.data.deadline ?? null, parsed.data.status, parsed.data.progress, parsed.data.notes, request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Goal not found." });
  return response.json(await store.get("SELECT * FROM goals WHERE id = ?", [request.params.id]));
});
goalsRouter.delete("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = await store.run("DELETE FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Goal not found." });
  return response.status(204).send();
});
goalsRouter.patch("/:id/complete", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT id, status FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  if (goal.status === "completed")
    return response.status(409).json({ error: "Goal is already completed." });
  await store.run("UPDATE goals SET status = 'completed', progress = 100, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [goal.id]);
  const progression = await recordXpEvent(user.id, 100, "goal", goal.id, "Completed goal");
  const unlockedAchievements = await evaluateAchievements(user.id);
  return response.json({ goal: await store.get("SELECT * FROM goals WHERE id = ?", [goal.id]), progression, unlockedAchievements });
});
var milestoneSchema = z3.object({
  title: z3.string().trim().min(1).max(160),
  description: z3.string().max(1e3).default(""),
  dueDate: z3.string().date().nullable().optional(),
  progress: z3.number().int().min(0).max(100).default(0),
  xpReward: z3.number().int().min(0).max(5e3).default(100)
});
var noteSchema = z3.object({
  title: z3.string().trim().min(1).max(160),
  content: z3.string().max(4e3).default(""),
  noteType: z3.enum(["reflection", "action", "idea", "progress"]).default("reflection")
});
goalsRouter.post("/:id/milestones", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  const parsed = milestoneSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run(`
    INSERT INTO milestones (goal_id, title, description, due_date, progress, xp_reward)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [request.params.id, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.xpReward]);
  const milestoneId = Number(result.lastInsertRowid);
  if (parsed.data.progress >= 100)
    await recordXpEvent(user.id, parsed.data.xpReward, "milestone", milestoneId, "Completed milestone");
  await syncGoalProgress(request.params.id);
  await evaluateAchievements(user.id);
  return response.status(201).json(await store.get("SELECT * FROM milestones WHERE id = ?", [milestoneId]));
});
goalsRouter.put("/:goalId/milestones/:milestoneId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  const parsed = milestoneSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const previous = await store.get("SELECT progress FROM milestones WHERE id = ? AND goal_id = ?", [request.params.milestoneId, request.params.goalId]);
  if (!previous)
    return response.status(404).json({ error: "Milestone not found." });
  const result = await store.run(`
    UPDATE milestones SET title = ?, description = ?, due_date = ?, progress = ?, xp_reward = ?, is_completed = ?, completed_at = CASE WHEN ? = true THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END
    WHERE id = ? AND goal_id = ?
  `, [parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.xpReward, parsed.data.progress >= 100, parsed.data.progress >= 100, request.params.milestoneId, request.params.goalId]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Milestone not found." });
  if (previous.progress < 100 && parsed.data.progress >= 100)
    await recordXpEvent(user.id, parsed.data.xpReward, "milestone", Number(request.params.milestoneId), "Completed milestone");
  await syncGoalProgress(request.params.goalId);
  await evaluateAchievements(user.id);
  return response.json(await store.get("SELECT * FROM milestones WHERE id = ?", [request.params.milestoneId]));
});
goalsRouter.delete("/:goalId/milestones/:milestoneId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  const result = await store.run("DELETE FROM milestones WHERE id = ? AND goal_id = ?", [request.params.milestoneId, request.params.goalId]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Milestone not found." });
  await syncGoalProgress(request.params.goalId);
  return response.status(204).send();
});
goalsRouter.post("/:id/notes", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  const parsed = noteSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run(`
    INSERT INTO notes (user_id, goal_id, title, content, note_type)
    VALUES (?, ?, ?, ?, ?)
  `, [user.id, request.params.id, parsed.data.title, parsed.data.content, parsed.data.noteType]);
  return response.status(201).json(await store.get("SELECT * FROM notes WHERE id = ? AND user_id = ?", [Number(result.lastInsertRowid), user.id]));
});
goalsRouter.put("/:goalId/notes/:noteId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  const parsed = noteSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run(`
    UPDATE notes SET title = ?, content = ?, note_type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND goal_id = ? AND user_id = ?
  `, [parsed.data.title, parsed.data.content, parsed.data.noteType, request.params.noteId, request.params.goalId, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Note not found." });
  return response.json(await store.get("SELECT * FROM notes WHERE id = ? AND user_id = ?", [request.params.noteId, user.id]));
});
goalsRouter.delete("/:goalId/notes/:noteId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const goal = await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [request.params.goalId, user.id]);
  if (!goal)
    return response.status(404).json({ error: "Goal not found." });
  const result = await store.run("DELETE FROM notes WHERE id = ? AND goal_id = ? AND user_id = ?", [request.params.noteId, request.params.goalId, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Note not found." });
  return response.status(204).send();
});

// server/routes/projects.ts
import { Router as Router6 } from "express";
import { z as z4 } from "zod";
var projectSchema = z4.object({
  title: z4.string().trim().min(1).max(160),
  description: z4.string().max(1e3).default(""),
  status: z4.string().trim().min(1).max(40).default("idea"),
  priority: z4.string().trim().min(1).max(40).default("medium"),
  roadmap: z4.string().max(2e3).default(""),
  notes: z4.string().max(2e3).default(""),
  riskLevel: z4.enum(["low", "medium", "high"]).default("low"),
  nextAction: z4.string().max(500).default("")
});
var milestoneSchema2 = z4.object({
  title: z4.string().trim().min(1).max(160),
  description: z4.string().max(1e3).default(""),
  dueDate: z4.string().date().nullable().optional(),
  progress: z4.number().int().min(0).max(100).default(0)
});
var noteSchema2 = z4.object({
  title: z4.string().trim().min(1).max(160),
  content: z4.string().max(4e3).default(""),
  noteType: z4.enum(["reflection", "action", "idea", "progress"]).default("reflection")
});
var projectsRouter = Router6();
projectsRouter.use(requireAuth);
projectsRouter.use(requireChild);
projectsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await store.all("SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC", [user.id]));
});
projectsRouter.get("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const project = await store.get("SELECT * FROM projects WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!project)
    return response.status(404).json({ error: "Project not found." });
  return response.json({
    project,
    milestones: await store.all("SELECT * FROM milestones WHERE project_id = ? ORDER BY id DESC", [request.params.id]),
    notes: await store.all("SELECT * FROM notes WHERE project_id = ? ORDER BY created_at DESC", [request.params.id]),
    tasks: await store.all("SELECT * FROM tasks WHERE project_id = ? AND user_id = ? ORDER BY is_completed, due_date, id DESC", [request.params.id, user.id])
  });
});
projectsRouter.post("/", async (request, response) => {
  const parsed = projectSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  const result = await store.run(`
    INSERT INTO projects (user_id, title, description, status, priority, roadmap, notes, risk_level, next_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [user.id, parsed.data.title, parsed.data.description, parsed.data.status, parsed.data.priority, parsed.data.roadmap, parsed.data.notes, parsed.data.riskLevel, parsed.data.nextAction]);
  return response.status(201).json(await store.get("SELECT * FROM projects WHERE id = ?", [Number(result.lastInsertRowid)]));
});
projectsRouter.put("/:id", async (request, response) => {
  const parsed = projectSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  const result = await store.run(`
    UPDATE projects SET title = ?, description = ?, status = ?, priority = ?, roadmap = ?, notes = ?, risk_level = ?, next_action = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `, [parsed.data.title, parsed.data.description, parsed.data.status, parsed.data.priority, parsed.data.roadmap, parsed.data.notes, parsed.data.riskLevel, parsed.data.nextAction, request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Project not found." });
  return response.json(await store.get("SELECT * FROM projects WHERE id = ?", [request.params.id]));
});
projectsRouter.delete("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = await store.run("DELETE FROM projects WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Project not found." });
  return response.status(204).send();
});
projectsRouter.post("/:id/milestones", async (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!await store.get("SELECT id FROM projects WHERE id = ? AND user_id = ?", [request.params.id, user.id]))
    return response.status(404).json({ error: "Project not found." });
  const parsed = milestoneSchema2.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run("INSERT INTO milestones (project_id, title, description, due_date, progress, is_completed) VALUES (?, ?, ?, ?, ?, ?)", [request.params.id, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.progress >= 100]);
  return response.status(201).json(await store.get("SELECT * FROM milestones WHERE id = ?", [Number(result.lastInsertRowid)]));
});
projectsRouter.put("/:projectId/milestones/:milestoneId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!await store.get("SELECT id FROM projects WHERE id = ? AND user_id = ?", [request.params.projectId, user.id]))
    return response.status(404).json({ error: "Project not found." });
  const parsed = milestoneSchema2.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const previous = await store.get("SELECT progress, xp_reward FROM milestones WHERE id = ? AND project_id = ?", [request.params.milestoneId, request.params.projectId]);
  if (!previous)
    return response.status(404).json({ error: "Milestone not found." });
  const result = await store.run("UPDATE milestones SET title = ?, description = ?, due_date = ?, progress = ?, is_completed = ?, completed_at = CASE WHEN ? = true THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END WHERE id = ? AND project_id = ?", [parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.progress, parsed.data.progress >= 100, parsed.data.progress >= 100, request.params.milestoneId, request.params.projectId]);
  if (!result.changes)
    return response.status(404).json({ error: "Milestone not found." });
  if (previous.progress < 100 && parsed.data.progress >= 100) {
    await recordXpEvent(user.id, previous.xp_reward, "milestone", Number(request.params.milestoneId), "Completed project milestone");
    await evaluateAchievements(user.id);
  }
  return response.json(await store.get("SELECT * FROM milestones WHERE id = ?", [request.params.milestoneId]));
});
projectsRouter.delete("/:projectId/milestones/:milestoneId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!await store.get("SELECT id FROM projects WHERE id = ? AND user_id = ?", [request.params.projectId, user.id]))
    return response.status(404).json({ error: "Project not found." });
  const result = await store.run("DELETE FROM milestones WHERE id = ? AND project_id = ?", [request.params.milestoneId, request.params.projectId]);
  return result.changes ? response.status(204).send() : response.status(404).json({ error: "Milestone not found." });
});
projectsRouter.post("/:id/notes", async (request, response) => {
  const user = authenticatedUser(response.locals);
  if (!await store.get("SELECT id FROM projects WHERE id = ? AND user_id = ?", [request.params.id, user.id]))
    return response.status(404).json({ error: "Project not found." });
  const parsed = noteSchema2.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run("INSERT INTO notes (user_id, project_id, title, content, note_type) VALUES (?, ?, ?, ?, ?)", [user.id, request.params.id, parsed.data.title, parsed.data.content, parsed.data.noteType]);
  return response.status(201).json(await store.get("SELECT * FROM notes WHERE id = ?", [Number(result.lastInsertRowid)]));
});
projectsRouter.put("/:projectId/notes/:noteId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = noteSchema2.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run("UPDATE notes SET title = ?, content = ?, note_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ? AND user_id = ?", [parsed.data.title, parsed.data.content, parsed.data.noteType, request.params.noteId, request.params.projectId, user.id]);
  if (!result.changes)
    return response.status(404).json({ error: "Note not found." });
  return response.json(await store.get("SELECT * FROM notes WHERE id = ?", [request.params.noteId]));
});
projectsRouter.delete("/:projectId/notes/:noteId", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = await store.run("DELETE FROM notes WHERE id = ? AND project_id = ? AND user_id = ?", [request.params.noteId, request.params.projectId, user.id]);
  return result.changes ? response.status(204).send() : response.status(404).json({ error: "Note not found." });
});

// server/routes/missions.ts
import { Router as Router7 } from "express";
import { z as z5 } from "zod";
var missionSchema = z5.object({
  childId: z5.number().int().positive(),
  title: z5.string().trim().min(1).max(160),
  description: z5.string().max(1e3).default(""),
  xpReward: z5.number().int().min(0).max(1e3).default(200)
});
var missionsRouter = Router7();
missionsRouter.use(requireAuth);
missionsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const column = user.role === "parent" ? "parent_id" : "child_id";
  response.json(await store.all(`
    SELECT m.*, child.display_name AS child_name, parent.display_name AS parent_name
    FROM parent_child_missions m
    JOIN users child ON child.id = m.child_id
    JOIN users parent ON parent.id = m.parent_id
    WHERE m.${column} = ?
    ORDER BY CASE m.status WHEN 'pending' THEN 0 ELSE 1 END, m.created_at DESC
  `, [user.id]));
});
missionsRouter.post("/", requireParent, async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = missionSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const linkedChild = await store.get("SELECT user_id FROM child_profiles WHERE user_id = ? AND parent_id = ?", [parsed.data.childId, user.id]);
  if (!linkedChild)
    return response.status(404).json({ error: "Linked child not found." });
  const result = await store.run(`
    INSERT INTO parent_child_missions (child_id, parent_id, title, description, xp_reward)
    VALUES (?, ?, ?, ?, ?)
  `, [parsed.data.childId, user.id, parsed.data.title, parsed.data.description, parsed.data.xpReward]);
  return response.status(201).json(await store.get("SELECT * FROM parent_child_missions WHERE id = ?", [Number(result.lastInsertRowid)]));
});
missionsRouter.patch("/:id/submit", requireChild, async (request, response) => {
  const user = authenticatedUser(response.locals);
  const missionId = Number(request.params.id);
  const result = await store.run("UPDATE parent_child_missions SET status = 'child_submitted' WHERE id = ? AND child_id = ? AND status = 'pending'", [missionId, user.id]);
  if (!result.changes)
    return response.status(404).json({ error: "Pending mission not found." });
  return response.json(await store.get("SELECT * FROM parent_child_missions WHERE id = ?", [missionId]));
});
missionsRouter.patch("/:id/validate", requireParent, async (request, response) => {
  const user = authenticatedUser(response.locals);
  const missionId = String(request.params.id);
  const mission = await store.get(`
    SELECT * FROM parent_child_missions
    WHERE id = ? AND parent_id = ? AND status = 'child_submitted'
  `, [missionId, user.id]);
  if (!mission)
    return response.status(404).json({ error: "Submitted mission not found." });
  await store.run(`
    UPDATE parent_child_missions
    SET status = 'completed', validated_by_parent = 1, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [mission.id]);
  const progression = await recordXpEvent(mission.child_id, mission.xp_reward, "parent_mission", mission.id, "Completed parent-child mission");
  const unlockedAchievements = await evaluateAchievements(mission.child_id);
  return response.json({ mission: await store.get("SELECT * FROM parent_child_missions WHERE id = ?", [mission.id]), progression, unlockedAchievements });
});

// server/routes/parent.ts
import { Router as Router8 } from "express";
var parentRouter = Router8();
parentRouter.use(requireAuth);
parentRouter.use(requireParent);
parentRouter.get("/children", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await store.all(`
    SELECT u.id, u.display_name, u.total_xp, u.current_streak, cp.age, cp.grade, cp.age_group, cp.village_level
    FROM child_profiles cp JOIN users u ON u.id = cp.user_id
    WHERE cp.parent_id = ? ORDER BY u.display_name
  `, [user.id]));
});
parentRouter.get("/dashboard", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const children = await store.all(`
    SELECT u.id, u.display_name, u.total_xp, u.current_streak, cp.age, cp.grade, cp.age_group, cp.village_level
    FROM child_profiles cp JOIN users u ON u.id = cp.user_id
    WHERE cp.parent_id = ? ORDER BY u.display_name
  `, [user.id]);
  const summaries = children.map(async (child) => ({
    ...child,
    level: levelFromXp(child.total_xp),
    activeQuests: (await store.get("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND is_completed = 0", [child.id])).count,
    activeHabits: (await store.get("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND is_active = 1", [child.id])).count,
    completedQuests: (await store.get("SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND is_completed = 1", [child.id])).count,
    pendingMissions: (await store.get("SELECT COUNT(*) AS count FROM parent_child_missions WHERE child_id = ? AND parent_id = ? AND status IN ('pending','child_submitted')", [child.id, user.id])).count
  }));
  response.json({ parent: user, children: summaries });
});

// server/routes/quests.ts
import { Router as Router9 } from "express";
import { z as z6 } from "zod";
var questSchema = z6.object({
  title: z6.string().trim().min(1).max(160),
  description: z6.string().max(1e3).default(""),
  dueDate: z6.string().date().nullable().optional(),
  priority: z6.enum(["low", "medium", "high", "critical"]).default("medium"),
  estimatedMinutes: z6.number().int().positive().max(1440).nullable().optional(),
  goalId: z6.number().int().positive().nullable().optional(),
  projectId: z6.number().int().positive().nullable().optional()
});
var questsRouter = Router9();
questsRouter.use(requireAuth);
questsRouter.use(requireChild);
async function linkedRecordsBelongToUser(userId, goalId, projectId) {
  if (goalId && !await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [goalId, userId]))
    return false;
  if (projectId && !await store.get("SELECT id FROM projects WHERE id = ? AND user_id = ?", [projectId, userId]))
    return false;
  return true;
}
questsRouter.get("/", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const filter = z6.enum(["today", "active", "completed", "all"]).catch("all").parse(request.query.filter);
  const clauses = ["user_id = ?"];
  if (filter === "today")
    clauses.push("due_date = date('now','localtime')");
  if (filter === "active")
    clauses.push("is_completed = 0");
  if (filter === "completed")
    clauses.push("is_completed = 1");
  response.json(await store.all(`SELECT * FROM tasks WHERE ${clauses.join(" AND ")} ORDER BY is_completed, due_date, id DESC`, [user.id]));
});
questsRouter.post("/", async (request, response) => {
  const parsed = questSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  if (!await linkedRecordsBelongToUser(user.id, parsed.data.goalId, parsed.data.projectId))
    return response.status(400).json({ error: "Linked goal or project is not available." });
  const result = await store.run(`
    INSERT INTO tasks (user_id, goal_id, project_id, title, description, due_date, priority, estimated_minutes, xp_reward)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10)
  `, [user.id, parsed.data.goalId ?? null, parsed.data.projectId ?? null, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.priority, parsed.data.estimatedMinutes ?? null]);
  return response.status(201).json(await store.get("SELECT * FROM tasks WHERE id = ?", [Number(result.lastInsertRowid)]));
});
questsRouter.put("/:id", async (request, response) => {
  const parsed = questSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const user = authenticatedUser(response.locals);
  if (!await linkedRecordsBelongToUser(user.id, parsed.data.goalId, parsed.data.projectId))
    return response.status(400).json({ error: "Linked goal or project is not available." });
  const result = await store.run(`
    UPDATE tasks SET goal_id = ?, project_id = ?, title = ?, description = ?, due_date = ?, priority = ?, estimated_minutes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `, [parsed.data.goalId ?? null, parsed.data.projectId ?? null, parsed.data.title, parsed.data.description, parsed.data.dueDate ?? null, parsed.data.priority, parsed.data.estimatedMinutes ?? null, request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Quest not found." });
  return response.json(await store.get("SELECT * FROM tasks WHERE id = ?", [request.params.id]));
});
questsRouter.patch("/:id/complete", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = await store.run(`
    UPDATE tasks SET is_completed = 1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND is_completed = 0
  `, [request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Active quest not found." });
  const task = await store.get("SELECT * FROM tasks WHERE id = ?", [request.params.id]);
  const progression = await recordXpEvent(user.id, task.xp_reward, "task", task.id, "Completed quest");
  const unlockedAchievements = await evaluateAchievements(user.id);
  const completedTask = await store.get("SELECT * FROM tasks WHERE id = ?", [request.params.id]);
  return response.json({ ...completedTask, progression, unlockedAchievements });
});
questsRouter.delete("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = await store.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (result.changes === 0)
    return response.status(404).json({ error: "Quest not found." });
  return response.status(204).send();
});

// server/routes/reviews.ts
import { Router as Router10 } from "express";
import { z as z7 } from "zod";
var reviewSchema = z7.object({
  reviewType: z7.enum(["weekly", "monthly"]),
  periodStart: z7.string().date(),
  periodEnd: z7.string().date(),
  answersJson: z7.record(z7.unknown()).default({}),
  summaryJson: z7.record(z7.unknown()).default({})
});
var reviewsRouter = Router10();
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
  `, [user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodStart, parsed.data.periodEnd, user.id, parsed.data.periodEnd, user.id]);
  const strongest = await store.get("SELECT name, score FROM life_areas WHERE user_id = ? ORDER BY score DESC, id LIMIT 1", [user.id]);
  const weakest = await store.get("SELECT name, score FROM life_areas WHERE user_id = ? ORDER BY score, id LIMIT 1", [user.id]);
  const generatedSummary = { ...activity, strongestArea: strongest?.name ?? null, weakestArea: weakest?.name ?? null, recommendedFocus: weakest?.name ?? "Choose one useful priority" };
  const existing = await store.get("SELECT id FROM reviews WHERE user_id = ? AND review_type = ? AND period_start = ?", [user.id, parsed.data.reviewType, parsed.data.periodStart]);
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

// server/routes/village.ts
import { Router as Router11 } from "express";

// server/services/village.ts
function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}
function scoreToLevel(score) {
  if (score >= 0.8)
    return 5;
  if (score >= 0.65)
    return 4;
  if (score >= 0.45)
    return 3;
  if (score >= 0.25)
    return 2;
  return 1;
}
async function persistentZone(userId, zoneId, calculatedProgress) {
  const progress = clamp(calculatedProgress);
  await store.run(`INSERT INTO village_state (user_id, zone_id, level, progress, unlocked)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, zone_id) DO UPDATE SET
    progress = MAX(village_state.progress, excluded.progress),
    level = MAX(village_state.level, excluded.level),
    last_updated = CURRENT_TIMESTAMP`, [userId, zoneId, scoreToLevel(progress), progress, true]);
  return await store.get("SELECT level, progress FROM village_state WHERE user_id = ? AND zone_id = ?", [userId, zoneId]);
}
function streakFromDays(days) {
  let streak = 0;
  let expected = /* @__PURE__ */ new Date();
  expected.setHours(0, 0, 0, 0);
  let first = true;
  for (const row of days) {
    const current = /* @__PURE__ */ new Date(`${row.day}T00:00:00`);
    const diffDays = Math.round((expected.getTime() - current.getTime()) / 864e5);
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
async function getHabitStats(userId) {
  return await store.get(`
    SELECT
      (SELECT COUNT(*) FROM habit_logs hl JOIN habits h2 ON h2.id = hl.habit_id WHERE h2.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= date('now','localtime','-29 days')) AS completed,
      COALESCE(SUM(CASE h.frequency WHEN 'daily' THEN 30 WHEN 'weekly' THEN 4 ELSE 30 END), 0) AS total
    FROM habits h
    WHERE h.user_id = ? AND h.is_active = 1
  `, [userId, userId]);
}
async function getGardenState(userId) {
  const activeHabits = await store.get("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND is_active = 1", [userId]);
  const habitRows = await store.all(`
    SELECT DISTINCT date(hl.completed_on) AS day
    FROM habit_logs hl
    JOIN habits h ON h.id = hl.habit_id
    WHERE h.user_id = ? AND hl.is_completed = 1 AND hl.completed_on >= date('now','localtime','-29 days')
    ORDER BY day DESC
  `, [userId]);
  const stats = await getHabitStats(userId);
  const completionRate = stats.total === 0 ? 0 : stats.completed / stats.total;
  const currentStreak = streakFromDays(habitRows);
  const levelScore = clamp(Math.min(activeHabits.count / 10, 1) * 0.45 + completionRate * 0.55);
  return {
    level: scoreToLevel(levelScore),
    progress: levelScore,
    currentStreak,
    longestStreak: (await store.get("SELECT COALESCE(MAX(longest_streak), 0) AS value FROM habits WHERE user_id = ?", [userId])).value
  };
}
async function getHomeAreaState(userId) {
  const activeHabits = await store.get("SELECT COUNT(*) AS count FROM habits WHERE user_id = ? AND is_active = 1", [userId]);
  const stats = await getHabitStats(userId);
  const completionRate = stats.total === 0 ? 0 : stats.completed / stats.total;
  const levelScore = clamp(Math.min(activeHabits.count / 10, 1) * 0.5 + completionRate * 0.5);
  return {
    level: scoreToLevel(levelScore),
    progress: levelScore,
    activeHabits: activeHabits.count,
    completionRate
  };
}
async function getVillageState(userId) {
  const totalXp = (await store.get("SELECT total_xp FROM users WHERE id = ?", [userId])).total_xp;
  const currentStreak = (await store.get("SELECT current_streak FROM users WHERE id = ?", [userId])).current_streak;
  const reviewCount = (await store.get("SELECT COUNT(*) AS count FROM reviews WHERE user_id = ? AND review_type = 'weekly'", [userId])).count;
  const pathwaysProgress = clamp(reviewCount / 5);
  const projectStats = await store.get("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed FROM projects WHERE user_id = ?", [userId]);
  const goalStats = await store.get("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed, COALESCE(AVG(progress),0) AS average FROM goals WHERE user_id = ?", [userId]);
  const focusCount = (await store.get("SELECT COUNT(*) AS count FROM focus_priorities WHERE user_id = ? AND week_start = date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days')", [userId])).count;
  const discoveryStats = await store.get("SELECT COUNT(DISTINCT c.domain_id) AS domains, COUNT(dc.id) AS completed FROM discovery_completions dc JOIN discovery_challenges c ON c.id = dc.challenge_id WHERE dc.child_id = ?", [userId]);
  const campaign = await store.get("SELECT id FROM school_campaigns WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", [userId]);
  const campaignProgress = campaign ? (await store.get("SELECT COALESCE(AVG(progress),0) AS progress FROM campaign_chapters WHERE campaign_id = ?", [campaign.id])).progress / 100 : 0;
  const workshopProgress = projectStats.total ? clamp((projectStats.completed ?? 0) / projectStats.total * 0.6 + Math.min(projectStats.total / 5, 1) * 0.4) : 0;
  const learningProgress = goalStats.total ? clamp(goalStats.average / 100) : 0;
  const discoveryProgress = clamp(discoveryStats.completed / 6);
  const focusProgress = clamp(focusCount / 3);
  const villageLevel = Math.max(1, Math.floor(totalXp / 500) + 1);
  const garden = await getGardenState(userId);
  const homeArea = await getHomeAreaState(userId);
  await store.run("UPDATE child_profiles SET village_level = MAX(village_level, ?) WHERE user_id = ?", [villageLevel, userId]);
  return {
    villageLevel,
    globalXP: totalXp,
    currentStreak,
    zones: {
      garden: { ...garden, ...await persistentZone(userId, "garden", garden.progress) },
      home_area: { ...homeArea, ...await persistentZone(userId, "home", homeArea.progress) },
      workshop: await persistentZone(userId, "workshop", workshopProgress),
      learning: await persistentZone(userId, "learning", learningProgress),
      market: await persistentZone(userId, "discovery", discoveryProgress),
      town_hall: await persistentZone(userId, "town-hall", campaignProgress),
      lighthouse: await persistentZone(userId, "lighthouse", focusProgress),
      pathways: await persistentZone(userId, "pathways", pathwaysProgress)
    }
  };
}

// server/routes/village.ts
var villageRouter = Router11();
villageRouter.use(requireAuth);
villageRouter.use(requireChild);
villageRouter.get("/state", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await getVillageState(user.id));
});

// server/routes/discovery.ts
import { Router as Router12 } from "express";
var discoveryRouter = Router12();
discoveryRouter.use(requireAuth, requireChild);
function periodKey(frequency) {
  const date = /* @__PURE__ */ new Date();
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
  const profile = await store.get("SELECT age_group FROM child_profiles WHERE user_id = ?", [user.id]);
  const domains = await store.all(`
    SELECT d.*, COUNT(c.id) AS challenge_count,
      SUM(CASE WHEN dc.id IS NOT NULL THEN 1 ELSE 0 END) AS completed_count
    FROM discovery_domains d
    LEFT JOIN discovery_challenges c ON c.domain_id = d.id AND c.age_group IN ('all', ?)
    LEFT JOIN discovery_completions dc ON dc.challenge_id = c.id AND dc.child_id = ? AND dc.completed_period = ?
    WHERE d.age_group IN ('all', ?)
    GROUP BY d.id ORDER BY d.id
  `, [profile.age_group, user.id, periodKey("weekly"), profile.age_group]);
  const challenges = await store.all(`
    SELECT c.*, d.name AS domain_name, CASE WHEN dc.id IS NULL THEN 0 ELSE 1 END AS completed
    FROM discovery_challenges c JOIN discovery_domains d ON d.id = c.domain_id
    LEFT JOIN discovery_completions dc ON dc.challenge_id = c.id AND dc.child_id = ? AND dc.completed_period = CASE c.frequency WHEN 'daily' THEN date('now','localtime') WHEN 'monthly' THEN strftime('%Y-%m','now','localtime') ELSE date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days') END
    WHERE c.age_group IN ('all', ?) AND d.age_group IN ('all', ?)
    ORDER BY completed, c.id
  `, [user.id, profile.age_group, profile.age_group]);
  response.json({ domains, challenges });
});
discoveryRouter.patch("/challenges/:id/complete", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const profile = await store.get("SELECT age_group FROM child_profiles WHERE user_id = ?", [user.id]);
  const challenge = await store.get("SELECT * FROM discovery_challenges WHERE id = ? AND age_group IN ('all', ?)", [request.params.id, profile.age_group]);
  if (!challenge)
    return response.status(404).json({ error: "Discovery challenge not found." });
  const period = periodKey(challenge.frequency);
  const result = await store.run("INSERT OR IGNORE INTO discovery_completions (child_id, challenge_id, completed_period) VALUES (?, ?, ?)", [user.id, challenge.id, period]);
  if (!result.changes)
    return response.status(409).json({ error: "Challenge already completed." });
  const progression = await recordXpEvent(user.id, challenge.xp_reward, "discovery", challenge.id, "Completed discovery challenge");
  const unlockedAchievements = await evaluateAchievements(user.id);
  return response.json({ completion: await store.get("SELECT * FROM discovery_completions WHERE child_id = ? AND challenge_id = ? AND completed_period = ?", [user.id, challenge.id, period]), progression, unlockedAchievements });
});

// server/routes/focus.ts
import { Router as Router13 } from "express";
import { z as z8 } from "zod";
var focusSchema = z8.object({
  goalId: z8.number().int().positive().nullable().optional(),
  projectId: z8.number().int().positive().nullable().optional(),
  priorityType: z8.enum(["main", "secondary"])
}).refine((value) => Boolean(value.goalId) !== Boolean(value.projectId), "Choose exactly one goal or project.");
var challengeSchema = z8.object({ title: z8.string().trim().min(1).max(160), description: z8.string().max(500).default(""), target: z8.number().int().min(1).max(100).default(1) });
var focusRouter = Router13();
focusRouter.use(requireAuth, requireChild);
var weekStartSql = "date('now','localtime','-' || ((CAST(strftime('%w','now','localtime') AS INTEGER) + 6) % 7) || ' days')";
focusRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const week = await store.get(`SELECT ${weekStartSql} AS value`, []);
  const priorities = await store.all(`
    SELECT fp.*, g.title AS goal_title, p.title AS project_title
    FROM focus_priorities fp LEFT JOIN goals g ON g.id = fp.goal_id LEFT JOIN projects p ON p.id = fp.project_id
    WHERE fp.user_id = ? AND fp.week_start = ? ORDER BY CASE fp.priority_type WHEN 'main' THEN 0 ELSE 1 END
  `, [user.id, week.value]);
  const challenges = await store.all("SELECT * FROM weekly_challenges WHERE user_id = ? AND week_start = ? ORDER BY id DESC", [user.id, week.value]);
  response.json({ weekStart: week.value, priorities, challenges });
});
focusRouter.post("/", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = focusSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const week = await store.get(`SELECT ${weekStartSql} AS value`, []);
  const limit = parsed.data.priorityType === "main" ? 1 : 2;
  const count = (await store.get("SELECT COUNT(*) AS count FROM focus_priorities WHERE user_id = ? AND week_start = ? AND priority_type = ?", [user.id, week.value, parsed.data.priorityType])).count;
  if (count >= limit)
    return response.status(409).json({ error: parsed.data.priorityType === "main" ? "Only one main priority is allowed." : "Only two secondary priorities are allowed." });
  if (parsed.data.goalId && !await store.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", [parsed.data.goalId, user.id]))
    return response.status(404).json({ error: "Goal not found." });
  if (parsed.data.projectId && !await store.get("SELECT id FROM projects WHERE id = ? AND user_id = ?", [parsed.data.projectId, user.id]))
    return response.status(404).json({ error: "Project not found." });
  const result = await store.run("INSERT INTO focus_priorities (user_id, goal_id, project_id, week_start, priority_type) VALUES (?, ?, ?, ?, ?)", [user.id, parsed.data.goalId ?? null, parsed.data.projectId ?? null, week.value, parsed.data.priorityType]);
  return response.status(201).json(await store.get("SELECT * FROM focus_priorities WHERE id = ?", [Number(result.lastInsertRowid)]));
});
focusRouter.delete("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const result = await store.run("DELETE FROM focus_priorities WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  return result.changes ? response.status(204).send() : response.status(404).json({ error: "Priority not found." });
});
focusRouter.post("/challenges", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = challengeSchema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const week = await store.get(`SELECT ${weekStartSql} AS value`, []);
  const result = await store.run("INSERT INTO weekly_challenges (user_id, title, description, week_start, target, xp_reward) VALUES (?, ?, ?, ?, ?, 100)", [user.id, parsed.data.title, parsed.data.description, week.value, parsed.data.target]);
  return response.status(201).json(await store.get("SELECT * FROM weekly_challenges WHERE id = ?", [Number(result.lastInsertRowid)]));
});
focusRouter.patch("/challenges/:id/progress", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = z8.object({ progress: z8.number().int().min(0).max(100) }).safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const challenge = await store.get("SELECT id, target, progress, is_completed, xp_reward FROM weekly_challenges WHERE id = ? AND user_id = ?", [request.params.id, user.id]);
  if (!challenge)
    return response.status(404).json({ error: "Challenge not found." });
  const next = Math.min(challenge.target, parsed.data.progress);
  const completed = next >= challenge.target;
  await store.run("UPDATE weekly_challenges SET progress = ?, is_completed = ? WHERE id = ?", [next, completed, challenge.id]);
  const progression = completed && !challenge.is_completed ? await recordXpEvent(user.id, challenge.xp_reward, "weekly_challenge", challenge.id, "Completed weekly challenge") : null;
  if (progression)
    await evaluateAchievements(user.id);
  return response.json({ challenge: await store.get("SELECT * FROM weekly_challenges WHERE id = ?", [challenge.id]), progression });
});

// server/routes/lifeAreas.ts
import { Router as Router14 } from "express";
import { z as z9 } from "zod";
var schema = z9.object({ score: z9.number().int().min(0).max(100), trend: z9.enum(["improving", "stable", "declining"]) });
var lifeAreasRouter = Router14();
lifeAreasRouter.use(requireAuth, requireChild);
lifeAreasRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  response.json(await store.all(`SELECT la.*,
    (SELECT COUNT(*) FROM goals g WHERE g.life_area_id = la.id AND g.status != 'completed') AS active_goals,
    (SELECT COUNT(*) FROM tasks t JOIN goals g ON g.id = t.goal_id WHERE g.life_area_id = la.id AND t.is_completed = 1 AND t.completed_at >= datetime('now','-7 days')) AS weekly_activity
    FROM life_areas la WHERE la.user_id = ? ORDER BY la.id`, [user.id]));
});
lifeAreasRouter.put("/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = schema.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run("UPDATE life_areas SET score = ?, trend = ? WHERE id = ? AND user_id = ?", [parsed.data.score, parsed.data.trend, request.params.id, user.id]);
  return result.changes ? response.json(await store.get("SELECT * FROM life_areas WHERE id = ?", [request.params.id])) : response.status(404).json({ error: "Life area not found." });
});

// server/routes/campaigns.ts
import { Router as Router15 } from "express";
import { z as z10 } from "zod";
var schema2 = z10.object({ title: z10.string().trim().min(1).max(160), schoolYear: z10.string().trim().min(4).max(20), annualGoal: z10.string().max(500).default("") });
var monthNames = ["September", "October", "November", "December", "January", "February", "March", "April", "May", "June", "July", "August"];
var campaignsRouter = Router15();
campaignsRouter.use(requireAuth, requireChild);
campaignsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const campaign = await store.get("SELECT * FROM school_campaigns WHERE user_id = ? ORDER BY id DESC LIMIT 1", [user.id]);
  response.json({ campaign: campaign ?? null, chapters: campaign ? await store.all("SELECT * FROM campaign_chapters WHERE campaign_id = ? ORDER BY month_number", [campaign.id]) : [] });
});
campaignsRouter.post("/", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = schema2.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  const result = await store.run("INSERT INTO school_campaigns (user_id, title, school_year, annual_goal) VALUES (?, ?, ?, ?)", [user.id, parsed.data.title, parsed.data.schoolYear, parsed.data.annualGoal]);
  const id = Number(result.lastInsertRowid);
  for (const [index, month] of monthNames.entries()) {
    await store.run(
      "INSERT INTO campaign_chapters (campaign_id, month_number, title, theme) VALUES (?, ?, ?, ?)",
      [id, index + 1, `Chapter ${index + 1}: ${month}`, index === 0 ? "New beginnings" : "Keep growing"]
    );
  }
  return response.status(201).json({ campaign: await store.get("SELECT * FROM school_campaigns WHERE id = ?", [id]), chapters: await store.all("SELECT * FROM campaign_chapters WHERE campaign_id = ?", [id]) });
});
campaignsRouter.patch("/chapters/:id", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const progress = z10.object({ progress: z10.number().int().min(0).max(100) }).safeParse(request.body);
  if (!progress.success)
    return response.status(400).json({ error: progress.error.flatten() });
  const result = await store.run("UPDATE campaign_chapters SET progress = MAX(progress, ?), is_completed = CASE WHEN ? >= 100 THEN true ELSE is_completed END WHERE id = ? AND campaign_id IN (SELECT id FROM school_campaigns WHERE user_id = ?)", [progress.data.progress, progress.data.progress, request.params.id, user.id]);
  return result.changes ? response.json(await store.get("SELECT * FROM campaign_chapters WHERE id = ?", [request.params.id])) : response.status(404).json({ error: "Chapter not found." });
});

// server/routes/insights.ts
import { Router as Router16 } from "express";
var insightsRouter = Router16();
insightsRouter.use(requireAuth, requireChild);
insightsRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  const preferences = await store.get("SELECT * FROM user_preferences WHERE user_id = ?", [user.id]);
  if (preferences?.habit_reminders && (await store.get("SELECT COUNT(*) AS count FROM habits h WHERE h.user_id = ? AND h.is_active = 1 AND NOT EXISTS (SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime'))", [user.id])).count > 0) {
    await store.run("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Garden reminder', 'Some habits are still waiting for today.', 'habit' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Garden reminder' AND date(created_at,'localtime') = date('now','localtime'))", [user.id, user.id]);
  }
  if (preferences?.review_reminders && !await store.get("SELECT 1 FROM reviews WHERE user_id = ? AND review_type = 'weekly' AND period_start >= date('now','localtime','-7 days')", [user.id])) {
    await store.run("INSERT INTO notifications (user_id, title, message, notification_type) SELECT ?, 'Weekly reflection', 'Visit Pathways and complete your weekly review.', 'review' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND title = 'Weekly reflection' AND date(created_at,'localtime') = date('now','localtime'))", [user.id, user.id]);
  }
  const xpTimeline = await store.all("SELECT date(created_at,'localtime') AS day, SUM(amount) AS xp FROM xp_events WHERE user_id = ? AND created_at >= datetime('now','-29 days') GROUP BY day ORDER BY day", [user.id]);
  const habitHeatmap = await store.all("SELECT completed_on AS day, COUNT(*) AS completed FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ? AND hl.is_completed = 1 AND completed_on >= date('now','-29 days') GROUP BY completed_on ORDER BY completed_on", [user.id]);
  const notifications = await store.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY is_read, created_at DESC LIMIT 20", [user.id]);
  response.json({ xpTimeline, habitHeatmap, notifications });
});

// server/routes/preferences.ts
import { Router as Router17 } from "express";
import { z as z11 } from "zod";
var schema3 = z11.object({
  onboardingCompleted: z11.boolean(),
  habitReminders: z11.boolean(),
  reviewReminders: z11.boolean()
});
var preferencesRouter = Router17();
preferencesRouter.use(requireAuth, requireChild);
preferencesRouter.get("/", async (_request, response) => {
  const user = authenticatedUser(response.locals);
  await store.run("INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)", [user.id]);
  response.json(await store.get("SELECT * FROM user_preferences WHERE user_id = ?", [user.id]));
});
preferencesRouter.put("/", async (request, response) => {
  const user = authenticatedUser(response.locals);
  const parsed = schema3.safeParse(request.body);
  if (!parsed.success)
    return response.status(400).json({ error: parsed.error.flatten() });
  await store.run(`INSERT INTO user_preferences (user_id, onboarding_completed, habit_reminders, review_reminders)
    VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET onboarding_completed = excluded.onboarding_completed,
    habit_reminders = excluded.habit_reminders, review_reminders = excluded.review_reminders, updated_at = CURRENT_TIMESTAMP`, [user.id, parsed.data.onboardingCompleted, parsed.data.habitReminders, parsed.data.reviewReminders]);
  response.json(await store.get("SELECT * FROM user_preferences WHERE user_id = ?", [user.id]));
});

// server/routes/notifications.ts
import { Router as Router18 } from "express";
var notificationsRouter = Router18();
notificationsRouter.use(requireAuth, requireChild);
async function generateLocalNotifications(userId) {
  const preferences = await store.get("SELECT habit_reminders, review_reminders FROM user_preferences WHERE user_id = ?", [userId]);
  if (preferences?.habit_reminders && (await store.get("SELECT COUNT(*) AS count FROM habits h WHERE h.user_id = ? AND h.is_active = 1 AND NOT EXISTS (SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.completed_on = date('now','localtime'))", [userId])).count > 0) {
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
  const unread = (await store.get("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0", [user.id])).count;
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
  return result.changes ? response.json(await store.get("SELECT * FROM notifications WHERE id = ?", [request.params.id])) : response.status(404).json({ error: "Notification not found." });
});

// server/app.ts
function createApp() {
  const app2 = express();
  app2.set("trust proxy", 1);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
  app2.disable("x-powered-by");
  app2.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app2.use(express.json({ limit: "256kb" }));
  app2.use((_request, response, next) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Frame-Options", "DENY");
    next();
  });
  app2.get("/api/health", (_request, response) => response.json({ status: "ok", service: "lifequest-api" }));
  app2.use("/api/auth", authRouter);
  app2.use("/api/achievements", achievementsRouter);
  app2.use("/api/goals", goalsRouter);
  app2.use("/api/habits", habitsRouter);
  app2.use("/api/projects", projectsRouter);
  app2.use("/api/missions", missionsRouter);
  app2.use("/api/parent", parentRouter);
  app2.use("/api/quests", questsRouter);
  app2.use("/api/reviews", reviewsRouter);
  app2.use("/api/dashboard", dashboardRouter);
  app2.use("/api/village", villageRouter);
  app2.use("/api/discovery", discoveryRouter);
  app2.use("/api/focus", focusRouter);
  app2.use("/api/life-areas", lifeAreasRouter);
  app2.use("/api/campaigns", campaignsRouter);
  app2.use("/api/insights", insightsRouter);
  app2.use("/api/preferences", preferencesRouter);
  app2.use("/api/notifications", notificationsRouter);
  app2.use("/api", (_request, response) => response.status(404).json({ error: "API route not found." }));
  app2.use(errorHandler);
  return app2;
}

// server/vercelHandler.ts
var app = createApp();
function handler(request, response) {
  const path = request.query?.path;
  const normalizedPath = Array.isArray(path) ? path.join("/") : path ?? "";
  request.url = `/api/${normalizedPath}`;
  return app(request, response);
}
export {
  handler as default
};
