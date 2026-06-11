import { describe, expect, it } from "vitest";
import { db } from "../server/db/database";
import { hashPassword } from "../server/services/auth";
import { calculateCurrentStreak, distractionRisk, levelFromXp, recordXpEvent, titleForLevel } from "../server/services/gamification";

describe("gamification", () => {
  it("calculates levels from total XP", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(2500)).toBe(6);
  });

  it("uses the latest unlocked level title", () => {
    expect(titleForLevel(12)).toBe("Serious Operator");
  });

  it("flags excessive active work", () => {
    expect(distractionRisk(5, 4)).toBe("high");
  });

  it("calculates current streak from consecutive xp days", async () => {
    const email = `streak-${Date.now()}@lifequest.local`;
    const userId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(email, hashPassword("test-password"), "Streak Test").lastInsertRowid);
    try {
      db.prepare("INSERT INTO xp_events (user_id, source_type, source_id, amount, reason, created_at) VALUES (?, 'test', 1, 5, 'day 1', date('now','localtime','-2 days'))").run(userId);
      db.prepare("INSERT INTO xp_events (user_id, source_type, source_id, amount, reason, created_at) VALUES (?, 'test', 2, 5, 'day 2', date('now','localtime','-1 day'))").run(userId);
      db.prepare("INSERT INTO xp_events (user_id, source_type, source_id, amount, reason, created_at) VALUES (?, 'test', 3, 5, 'day 3', date('now','localtime'))").run(userId);
      expect(await calculateCurrentStreak(userId)).toBe(3);
    } finally {
      db.prepare("DELETE FROM xp_events WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    }
  });

  it("resets streak after a missed day", async () => {
    const email = `gap-${Date.now()}@lifequest.local`;
    const userId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(email, hashPassword("test-password"), "Gap Test").lastInsertRowid);
    try {
      db.prepare("INSERT INTO xp_events (user_id, source_type, source_id, amount, reason, created_at) VALUES (?, 'test', 1, 5, 'day 1', date('now','localtime','-3 days'))").run(userId);
      db.prepare("INSERT INTO xp_events (user_id, source_type, source_id, amount, reason, created_at) VALUES (?, 'test', 2, 5, 'day 2', date('now','localtime','-1 day'))").run(userId);
      expect(await calculateCurrentStreak(userId)).toBe(0);
    } finally {
      db.prepare("DELETE FROM xp_events WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    }
  });

  it("records xp events and updates total xp", async () => {
    const email = `xp-${Date.now()}@lifequest.local`;
    const userId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(email, hashPassword("test-password"), "XP Test").lastInsertRowid);
    try {
      const result = await recordXpEvent(userId, 10, "task", 99, "Completed task");
      expect(result.totalXp).toBeGreaterThanOrEqual(10);
      expect(result.level).toBeGreaterThanOrEqual(1);
      expect((db.prepare("SELECT COUNT(*) AS count FROM xp_events WHERE user_id = ?").get(userId) as { count: number }).count).toBe(1);
    } finally {
      db.prepare("DELETE FROM xp_events WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    }
  });
});
