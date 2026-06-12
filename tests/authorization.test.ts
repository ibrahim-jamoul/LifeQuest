import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import "../server/db/init";
import { createApp } from "../server/app";
import { db } from "../server/db/database";
import { hashPassword } from "../server/services/auth";

const password = "authorization-test-password";
const suffix = Date.now();
const emails = {
  childA: `authorization-child-a-${suffix}@lifequest.local`,
  childB: `authorization-child-b-${suffix}@lifequest.local`,
  parentA: `authorization-parent-a-${suffix}@lifequest.local`,
  parentB: `authorization-parent-b-${suffix}@lifequest.local`,
};

let server: Server;
let baseUrl = "";
let childAId = 0;
let childBId = 0;
let childAToken = "";
let childBToken = "";
let parentAToken = "";
let parentBToken = "";

async function api(path: string, token = "", options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function login(email: string) {
  const response = await api("/api/auth/login", "", { method: "POST", body: JSON.stringify({ email, password }) });
  expect(response.status).toBe(200);
  return (await response.json() as { token: string }).token;
}

beforeAll(async () => {
  const parentAId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(emails.parentA, hashPassword(password), "Authorization Parent A").lastInsertRowid);
  const parentBId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(emails.parentB, hashPassword(password), "Authorization Parent B").lastInsertRowid);
  db.prepare("INSERT INTO parent_profiles (user_id) VALUES (?)").run(parentAId);
  db.prepare("INSERT INTO parent_profiles (user_id) VALUES (?)").run(parentBId);
  childAId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(emails.childA, hashPassword(password), "Authorization Child A").lastInsertRowid);
  childBId = Number(db.prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)").run(emails.childB, hashPassword(password), "Authorization Child B").lastInsertRowid);
  db.prepare("INSERT INTO child_profiles (user_id, age, grade, age_group, parent_id) VALUES (?, 10, 'CM2', '10-12', ?)").run(childAId, parentAId);
  db.prepare("INSERT INTO child_profiles (user_id, age, grade, age_group, parent_id) VALUES (?, 11, 'CM2', '10-12', ?)").run(childBId, parentBId);

  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Authorization test server did not start.");
  baseUrl = `http://127.0.0.1:${address.port}`;

  [childAToken, childBToken, parentAToken, parentBToken] = await Promise.all([
    login(emails.childA),
    login(emails.childB),
    login(emails.parentA),
    login(emails.parentB),
  ]);
});

afterAll(async () => {
  for (const email of Object.values(emails)) db.prepare("DELETE FROM users WHERE email = ?").run(email);
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("authorization", () => {
  it("isolates quests, habits, goals, and projects between children", async () => {
    const quest = await (await api("/api/quests", childAToken, { method: "POST", body: JSON.stringify({ title: "Child A quest" }) })).json() as { id: number };
    const habit = await (await api("/api/habits", childAToken, { method: "POST", body: JSON.stringify({ name: "Child A habit", category: "Health", frequency: "daily" }) })).json() as { id: number };
    const goal = await (await api("/api/goals", childAToken, { method: "POST", body: JSON.stringify({ title: "Child A goal", category: "Learning" }) })).json() as { id: number };
    const project = await (await api("/api/projects", childAToken, { method: "POST", body: JSON.stringify({ title: "Child A project" }) })).json() as { id: number };

    const quests = await (await api("/api/quests", childBToken)).json() as Array<{ id: number }>;
    const habits = await (await api("/api/habits", childBToken)).json() as Array<{ id: number }>;
    const goals = await (await api("/api/goals", childBToken)).json() as Array<{ id: number }>;
    const projects = await (await api("/api/projects", childBToken)).json() as Array<{ id: number }>;
    expect(quests.some((item) => item.id === quest.id)).toBe(false);
    expect(habits.some((item) => item.id === habit.id)).toBe(false);
    expect(goals.some((item) => item.id === goal.id)).toBe(false);
    expect(projects.some((item) => item.id === project.id)).toBe(false);

    expect((await api(`/api/quests/${quest.id}/complete`, childBToken, { method: "PATCH" })).status).toBe(404);
    expect((await api(`/api/quests/${quest.id}`, childBToken, { method: "DELETE" })).status).toBe(404);
    expect((await api(`/api/habits/${habit.id}/log`, childBToken, { method: "POST", body: JSON.stringify({}) })).status).toBe(404);
    expect((await api(`/api/habits/${habit.id}`, childBToken, { method: "DELETE" })).status).toBe(404);
    expect((await api(`/api/goals/${goal.id}`, childBToken)).status).toBe(404);
    expect((await api(`/api/goals/${goal.id}`, childBToken, { method: "DELETE" })).status).toBe(404);
    expect((await api(`/api/projects/${project.id}`, childBToken)).status).toBe(404);
    expect((await api(`/api/projects/${project.id}`, childBToken, { method: "DELETE" })).status).toBe(404);
  });

  it("isolates missions by linked child and parent", async () => {
    const created = await api("/api/missions", parentAToken, {
      method: "POST",
      body: JSON.stringify({ childId: childAId, title: "Private family mission" }),
    });
    expect(created.status).toBe(201);
    const mission = await created.json() as { id: number };

    const childBMissions = await (await api("/api/missions", childBToken)).json() as Array<{ id: number }>;
    const parentBMissions = await (await api("/api/missions", parentBToken)).json() as Array<{ id: number }>;
    expect(childBMissions.some((item) => item.id === mission.id)).toBe(false);
    expect(parentBMissions.some((item) => item.id === mission.id)).toBe(false);
    expect((await api(`/api/missions/${mission.id}/submit`, childBToken, { method: "PATCH" })).status).toBe(404);
    expect((await api(`/api/missions/${mission.id}/validate`, parentBToken, { method: "PATCH" })).status).toBe(404);
  });

  it("rejects child access to parent-only routes", async () => {
    expect((await api("/api/missions", childAToken, { method: "POST", body: JSON.stringify({ childId: childAId, title: "Forbidden" }) })).status).toBe(403);
    expect((await api("/api/missions/1/validate", childAToken, { method: "PATCH" })).status).toBe(403);
    expect((await api("/api/parent/children", childAToken)).status).toBe(403);
    expect((await api("/api/parent/dashboard", childAToken)).status).toBe(403);
  });

  it("rejects parent access to child-only routes", async () => {
    expect((await api("/api/quests", parentAToken)).status).toBe(403);
    expect((await api("/api/habits", parentAToken, { method: "POST", body: JSON.stringify({ name: "Forbidden", category: "Health" }) })).status).toBe(403);
    expect((await api("/api/village/state", parentAToken)).status).toBe(403);
    expect((await api("/api/discovery", parentAToken)).status).toBe(403);
  });

  it("rejects missing, malformed, and expired tokens", async () => {
    expect((await api("/api/quests")).status).toBe(401);
    expect((await api("/api/quests", "not-a-valid-token")).status).toBe(401);

    const expiringToken = await login(emails.childB);
    db.prepare("UPDATE auth_sessions SET expires_at = datetime('now', '-1 day') WHERE user_id = ?").run(childBId);
    expect((await api("/api/quests", expiringToken)).status).toBe(401);
  });
});
