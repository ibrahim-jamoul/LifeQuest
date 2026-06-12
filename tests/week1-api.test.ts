import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import "../server/db/init";
import { createApp } from "../server/app";
import { db } from "../server/db/database";
import { hashPassword } from "../server/services/auth";

const email = "week1-test-child@lifequest.local";
const parentEmail = "week6-test-parent@lifequest.local";
const password = "test-password";
let server: Server;
let baseUrl = "";
let token = "";
let childId = 0;

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "", ...options.headers },
  });
}

beforeAll(async () => {
  db.prepare("DELETE FROM users WHERE email = ?").run(email);
  db.prepare("DELETE FROM users WHERE email = ?").run(parentEmail);
  const parentId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(parentEmail, hashPassword(password), "API Test Parent").lastInsertRowid);
  db.prepare("INSERT INTO parent_profiles (user_id) VALUES (?)").run(parentId);
  childId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(email, hashPassword(password), "API Test Child").lastInsertRowid);
  db.prepare("INSERT INTO child_profiles (user_id, age, grade, age_group, parent_id) VALUES (?, 10, 'CM2', '10-12', ?)").run(childId, parentId);
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not start.");
  baseUrl = `http://127.0.0.1:${address.port}`;
  const login = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  token = (await login.json() as { token: string }).token;
});

afterAll(async () => {
  db.prepare("DELETE FROM users WHERE email = ?").run(email);
  db.prepare("DELETE FROM users WHERE email = ?").run(parentEmail);
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("week 1 API", () => {
  it("authenticates and returns the current child", async () => {
    const response = await request("/api/auth/me");
    expect(response.status).toBe(200);
    expect((await response.json() as { user: { role: string } }).user.role).toBe("child");
  });

  it("supports habit CRUD and a daily log", async () => {
    const created = await request("/api/habits", { method: "POST", body: JSON.stringify({ name: "Read", category: "Learning", frequency: "daily" }) });
    expect(created.status).toBe(201);
    const habit = await created.json() as { id: number };
    expect((await request(`/api/habits/${habit.id}/log`, { method: "POST", body: JSON.stringify({ note: "Done" }) })).status).toBe(201);
    expect((await request(`/api/habits/${habit.id}`, { method: "PUT", body: JSON.stringify({ name: "Read together", category: "Learning", frequency: "daily" }) })).status).toBe(200);
    expect((await request(`/api/habits/${habit.id}`, { method: "DELETE" })).status).toBe(204);
  });

  it("supports quest CRUD and completion", async () => {
    const created = await request("/api/quests", { method: "POST", body: JSON.stringify({ title: "Test quest", priority: "high" }) });
    expect(created.status).toBe(201);
    const quest = await created.json() as { id: number };
    expect((await request(`/api/quests/${quest.id}`, { method: "PUT", body: JSON.stringify({ title: "Updated quest", priority: "medium" }) })).status).toBe(200);
    expect((await request(`/api/quests/${quest.id}/complete`, { method: "PATCH" })).status).toBe(200);
    expect((await request(`/api/quests/${quest.id}`, { method: "DELETE" })).status).toBe(204);
  });

  it("returns a real daily snapshot", async () => {
    const response = await request("/api/dashboard/today");
    expect(response.status).toBe(200);
    const snapshot = await response.json() as { quests: unknown[]; habits: unknown[]; focusPriorities: unknown[]; todayQuests: unknown[]; lifeBalance: unknown[]; progression: { totalXp: number } };
    expect(snapshot.quests).toBeInstanceOf(Array);
    expect(snapshot.habits).toBeInstanceOf(Array);
    expect(snapshot.focusPriorities).toBeInstanceOf(Array);
    expect(snapshot.todayQuests).toBeInstanceOf(Array);
    expect(snapshot.lifeBalance).toBeInstanceOf(Array);
    expect(snapshot.progression.totalXp).toBeGreaterThanOrEqual(0);
  });

  it("returns real focus priorities and life-area scores in the daily snapshot", async () => {
    db.prepare("INSERT OR REPLACE INTO life_areas (user_id, name, score, trend) VALUES (?, 'Dashboard truth', 73, 'improving')").run(childId);
    await request("/api/quests", { method: "POST", body: JSON.stringify({ title: "Dashboard fallback quest", priority: "high" }) });
    const snapshot = await (await request("/api/dashboard/today")).json() as {
      focusPriorities: Array<{ priority_type: string }>;
      todayQuests: Array<{ title: string }>;
      lifeBalance: Array<{ name: string; score: number }>;
    };
    expect(snapshot.focusPriorities.length > 0 || snapshot.todayQuests.length > 0).toBe(true);
    expect(snapshot.lifeBalance.find((area) => area.name === "Dashboard truth")?.score).toBe(73);
  });

  it("awards XP and updates progress when completing work", async () => {
    const questResponse = await request("/api/quests", { method: "POST", body: JSON.stringify({ title: "Progress quest", priority: "high" }) });
    const quest = await questResponse.json() as { id: number; xp_reward: number };
    const questComplete = await request(`/api/quests/${quest.id}/complete`, { method: "PATCH" });
    expect(questComplete.status).toBe(200);

    const habitResponse = await request("/api/habits", { method: "POST", body: JSON.stringify({ name: "Progress habit", category: "Learning", frequency: "daily" }) });
    const habit = await habitResponse.json() as { id: number };
    const habitLog = await request(`/api/habits/${habit.id}/log`, { method: "POST", body: JSON.stringify({ note: "done" }) });
    expect(habitLog.status).toBe(201);

    const snapshot = await (await request("/api/dashboard/today")).json() as { progression: { totalXp: number; currentStreak: number } };
    expect(snapshot.progression.totalXp).toBeGreaterThan(0);
    expect(snapshot.progression.currentStreak).toBeGreaterThan(0);
  });

  it("unlocks achievements automatically from verified actions", async () => {
    const response = await request("/api/achievements");
    expect(response.status).toBe(200);
    const achievements = await response.json() as Array<{ code: string; unlocked: number }>;
    expect(achievements.find((achievement) => achievement.code === "first_quest")?.unlocked).toBe(1);
  });

  it("supports the protected parent-child mission flow", async () => {
    const parentLogin = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email: parentEmail, password }) });
    token = (await parentLogin.json() as { token: string }).token;

    const dashboard = await request("/api/parent/dashboard");
    expect(dashboard.status).toBe(200);

    const created = await request("/api/missions", {
      method: "POST",
      body: JSON.stringify({ childId, title: "Build something together", description: "Create a small useful object." }),
    });
    expect(created.status).toBe(201);
    const mission = await created.json() as { id: number };
    expect((await request(`/api/missions/${mission.id}/validate`, { method: "PATCH" })).status).toBe(404);

    const childLogin = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    token = (await childLogin.json() as { token: string }).token;
    expect((await request(`/api/missions/${mission.id}/submit`, { method: "PATCH" })).status).toBe(200);

    const parentLoginAgain = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email: parentEmail, password }) });
    token = (await parentLoginAgain.json() as { token: string }).token;
    expect((await request(`/api/missions/${mission.id}/validate`, { method: "PATCH" })).status).toBe(200);
    expect((await request(`/api/missions/${mission.id}/validate`, { method: "PATCH" })).status).toBe(404);

    const persistedMission = db.prepare("SELECT status, validated_by_parent FROM parent_child_missions WHERE id = ?").get(mission.id) as { status: string; validated_by_parent: number };
    const missionXp = db.prepare("SELECT COUNT(*) AS count FROM xp_events WHERE user_id = ? AND source_type = 'parent_mission' AND source_id = ?").get(childId, mission.id) as { count: number };
    const coAdventurer = db.prepare(`
      SELECT COUNT(*) AS count
      FROM user_achievements ua
      JOIN achievements a ON a.id = ua.achievement_id
      WHERE ua.user_id = ? AND a.code = 'co_adventurer'
    `).get(childId) as { count: number };
    expect(persistedMission).toMatchObject({ status: "completed", validated_by_parent: 1 });
    expect(missionXp.count).toBe(1);
    expect(coAdventurer.count).toBe(1);

    const childLoginAgain = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    token = (await childLoginAgain.json() as { token: string }).token;
    const missions = await (await request("/api/missions")).json() as Array<{ id: number; status: string }>;
    expect(missions.find((item) => item.id === mission.id)?.status).toBe("completed");
    const achievements = await (await request("/api/achievements")).json() as Array<{ code: string; unlocked: number }>;
    expect(achievements.find((achievement) => achievement.code === "co_adventurer")?.unlocked).toBe(1);
  });

  it("closes review, goal, and project detail flows", async () => {
    const start = new Date().toISOString().slice(0, 10);
    const review = await request("/api/reviews", { method: "POST", body: JSON.stringify({ reviewType: "weekly", periodStart: start, periodEnd: start, answersJson: { focus: "Ship" } }) });
    expect(review.status).toBe(201);
    expect((await request("/api/reviews", { method: "POST", body: JSON.stringify({ reviewType: "weekly", periodStart: start, periodEnd: start, answersJson: { focus: "Improve" } }) })).status).toBe(200);

    const goalResponse = await request("/api/goals", { method: "POST", body: JSON.stringify({ title: "Test goal", category: "Projet personnel", status: "in_progress" }) });
    const goal = await goalResponse.json() as { id: number };
    const milestoneResponse = await request(`/api/goals/${goal.id}/milestones`, { method: "POST", body: JSON.stringify({ title: "Ship milestone", progress: 100, xpReward: 40 }) });
    expect(milestoneResponse.status).toBe(201);
    expect((await request(`/api/goals/${goal.id}/complete`, { method: "PATCH" })).status).toBe(200);
    expect((await request(`/api/goals/${goal.id}/complete`, { method: "PATCH" })).status).toBe(409);

    const projectResponse = await request("/api/projects", { method: "POST", body: JSON.stringify({ title: "Test project" }) });
    const project = await projectResponse.json() as { id: number };
    expect((await request(`/api/projects/${project.id}/milestones`, { method: "POST", body: JSON.stringify({ title: "Project step" }) })).status).toBe(201);
    expect((await request(`/api/projects/${project.id}/notes`, { method: "POST", body: JSON.stringify({ title: "Project note" }) })).status).toBe(201);
    expect((await request("/api/quests", { method: "POST", body: JSON.stringify({ title: "Project quest", projectId: project.id }) })).status).toBe(201);
    const detail = await request(`/api/projects/${project.id}`);
    expect(detail.status).toBe(200);
    const projectDetail = await detail.json() as { milestones: unknown[]; notes: unknown[]; tasks: unknown[] };
    expect(projectDetail.milestones).toHaveLength(1);
    expect(projectDetail.tasks).toHaveLength(1);
  });

  it("supports roadmap weeks 7 to 10 flows", async () => {
    const goalResponse = await request("/api/goals", { method: "POST", body: JSON.stringify({ title: "Main school focus", category: "Scolaire", status: "in_progress" }) });
    const goal = await goalResponse.json() as { id: number };
    const priorityResponse = await request("/api/focus", { method: "POST", body: JSON.stringify({ goalId: goal.id, priorityType: "main" }) });
    expect(priorityResponse.status).toBe(201);
    const priority = await priorityResponse.json() as { id: number };
    expect((await request("/api/focus", { method: "POST", body: JSON.stringify({ goalId: goal.id, priorityType: "main" }) })).status).toBe(409);
    const challengeResponse = await request("/api/focus/challenges", { method: "POST", body: JSON.stringify({ title: "Read three times", target: 3 }) });
    const challenge = await challengeResponse.json() as { id: number };
    expect((await request(`/api/focus/challenges/${challenge.id}/progress`, { method: "PATCH", body: JSON.stringify({ progress: 3 }) })).status).toBe(200);

    const discovery = await (await request("/api/discovery")).json() as { challenges: Array<{ id: number }> };
    expect(discovery.challenges.length).toBeGreaterThan(0);
    expect((await request(`/api/discovery/challenges/${discovery.challenges[0].id}/complete`, { method: "PATCH" })).status).toBe(200);

    const campaignResponse = await request("/api/campaigns", { method: "POST", body: JSON.stringify({ title: "School adventure", schoolYear: "2026-2027", annualGoal: "Grow confidently" }) });
    expect(campaignResponse.status).toBe(201);
    expect((await campaignResponse.json() as { chapters: unknown[] }).chapters).toHaveLength(12);

    db.prepare("INSERT OR IGNORE INTO life_areas (user_id, name, score, trend) VALUES (?, 'Learning', 50, 'stable')").run(childId);
    const areas = await (await request("/api/life-areas")).json() as Array<{ id: number }>;
    expect((await request(`/api/life-areas/${areas[0].id}`, { method: "PUT", body: JSON.stringify({ score: 70, trend: "improving" }) })).status).toBe(200);
    expect((await request("/api/preferences", { method: "PUT", body: JSON.stringify({ onboardingCompleted: true, habitReminders: true, reviewReminders: true }) })).status).toBe(200);
    expect((await request("/api/insights")).status).toBe(200);
    const before = await (await request("/api/village/state")).json() as { zones: { lighthouse: { progress: number } } };
    expect((await request(`/api/focus/${priority.id}`, { method: "DELETE" })).status).toBe(204);
    const after = await (await request("/api/village/state")).json() as { zones: { lighthouse: { progress: number } } };
    expect(after.zones.lighthouse.progress).toBeGreaterThanOrEqual(before.zones.lighthouse.progress);
  });

  it("closes linked-action, repeatable discovery, and generated-review gaps", async () => {
    const goalResponse = await request("/api/goals", { method: "POST", body: JSON.stringify({ title: "Linked action goal", category: "Habitudes", status: "in_progress" }) });
    const goal = await goalResponse.json() as { id: number };
    expect((await request("/api/quests", { method: "POST", body: JSON.stringify({ title: "Linked quest", goalId: goal.id }) })).status).toBe(201);
    expect((await request("/api/habits", { method: "POST", body: JSON.stringify({ name: "Linked habit", category: "Habitudes", goalId: goal.id }) })).status).toBe(201);
    const detail = await (await request(`/api/goals/${goal.id}`)).json() as { tasks: unknown[]; habits: unknown[] };
    expect(detail.tasks).toHaveLength(1);
    expect(detail.habits).toHaveLength(1);

    const discovery = await (await request("/api/discovery")).json() as { challenges: Array<{ id: number }> };
    const challengeId = discovery.challenges[0].id;
    db.prepare("DELETE FROM discovery_completions WHERE child_id = ? AND challenge_id = ?").run(childId, challengeId);
    db.prepare("INSERT INTO discovery_completions (child_id, challenge_id, completed_period, completed_at) VALUES (?, ?, 'previous-week', date('now','-8 days'))").run(childId, challengeId);
    expect((await request(`/api/discovery/challenges/${challengeId}/complete`, { method: "PATCH" })).status).toBe(200);

    const start = new Date().toISOString().slice(0, 10);
    const review = await request("/api/reviews", { method: "POST", body: JSON.stringify({ reviewType: "monthly", periodStart: start, periodEnd: start, answersJson: { progress: "Good" } }) });
    const payload = await review.json() as { generatedSummary: { completedTasks: number; habitCheckins: number; xpGained: number; recommendedFocus: string } };
    expect(payload.generatedSummary.completedTasks).toBeGreaterThanOrEqual(0);
    expect(payload.generatedSummary.habitCheckins).toBeGreaterThanOrEqual(0);
    expect(payload.generatedSummary.xpGained).toBeGreaterThanOrEqual(0);
    expect(payload.generatedSummary.recommendedFocus.length).toBeGreaterThan(0);
  });

  it("blocks completion of a locked discovery challenge even when its id is known", async () => {
    const domainResult = db.prepare(`
      INSERT INTO discovery_domains (name, description, icon, age_group, unlocked_at_village_level)
      VALUES ('Locked test domain', 'Only available later', 'lock', 'all', 99)
    `).run();
    const domainId = Number(domainResult.lastInsertRowid);
    const challengeResult = db.prepare(`
      INSERT INTO discovery_challenges (domain_id, title, description, age_group, frequency, xp_reward)
      VALUES (?, 'Locked known challenge', 'Must remain inaccessible', 'all', 'weekly', 50)
    `).run(domainId);
    const challengeId = Number(challengeResult.lastInsertRowid);
    try {
      const response = await request(`/api/discovery/challenges/${challengeId}/complete`, { method: "PATCH" });
      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({ requiredLevel: 99 });
      expect((db.prepare("SELECT COUNT(*) AS count FROM discovery_completions WHERE child_id = ? AND challenge_id = ?").get(childId, challengeId) as { count: number }).count).toBe(0);
    } finally {
      db.prepare("DELETE FROM discovery_domains WHERE id = ?").run(domainId);
    }
  });

  it("supports week 11 local notifications and profile reliability", async () => {
    const profile = await request("/api/auth/profile", { method: "PUT", body: JSON.stringify({ displayName: "Polished Test Child", age: 11, grade: "Year 6", avatarIcon: "compass", avatarColor: "#123456" }) });
    expect(profile.status).toBe(200);
    const profilePayload = await profile.json() as { user: { displayName: string }; profile: { avatar_icon: string; avatar_color: string } };
    expect(profilePayload.user.displayName).toBe("Polished Test Child");
    expect(profilePayload.profile.avatar_icon).toBe("compass");
    expect(profilePayload.profile.avatar_color).toBe("#123456");

    const me = await request("/api/auth/me");
    const mePayload = await me.json() as { profile: { avatar_icon: string; avatar_color: string } };
    expect(mePayload.profile.avatar_icon).toBe("compass");
    expect(mePayload.profile.avatar_color).toBe("#123456");

    const today = await request("/api/dashboard/today");
    const todayPayload = await today.json() as { profile: { avatar_icon: string; avatar_color: string } };
    expect(todayPayload.profile.avatar_icon).toBe("compass");
    expect(todayPayload.profile.avatar_color).toBe("#123456");

    const preferences = await request("/api/preferences", { method: "PUT", body: JSON.stringify({ onboardingCompleted: true, habitReminders: true, reviewReminders: false, pushReminders: true }) });
    expect(preferences.status).toBe(200);
    expect(Boolean((await preferences.json() as { push_reminders: number | boolean }).push_reminders)).toBe(true);
    const persistedPreferences = await request("/api/preferences");
    expect(Boolean((await persistedPreferences.json() as { push_reminders: number | boolean }).push_reminders)).toBe(true);

    const response = await request("/api/notifications");
    expect(response.status).toBe(200);
    const notificationState = await response.json() as { notifications: Array<{ id: number; is_read: number }>; unread: number };
    expect(notificationState.notifications.length).toBeGreaterThan(0);
    expect(notificationState.unread).toBeGreaterThan(0);

    expect((await request(`/api/notifications/${notificationState.notifications[0].id}/read`, { method: "PATCH" })).status).toBe(200);
    expect((await request("/api/notifications/read-all", { method: "PATCH" })).status).toBe(204);
    const after = await (await request("/api/notifications")).json() as { unread: number };
    expect(after.unread).toBe(0);
  });
});
