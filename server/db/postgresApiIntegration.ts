import type { Server } from "node:http";
import { createApp } from "../app";
import { store } from "./store";

const email = process.env.POSTGRES_TEST_EMAIL ?? "child@lifequest.local";
const password = process.env.POSTGRES_TEST_PASSWORD ?? "lifequest123";
let token = "";
let server: Server | undefined;

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });
}

async function expectStatus(path: string, expected: number, options: RequestInit = {}) {
  const response = await request(path, options);
  if (response.status !== expected) {
    throw new Error(`${options.method ?? "GET"} ${path}: expected ${expected}, received ${response.status}: ${await response.text()}`);
  }
  return response;
}

const app = createApp();
server = app.listen(0);
await new Promise<void>((resolve) => server?.once("listening", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Integration API did not start.");
const baseUrl = `http://127.0.0.1:${address.port}/api`;

try {
  const login = await expectStatus("/auth/login", 200, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  token = (await login.json() as { token: string }).token;

  for (const path of ["/auth/me", "/dashboard/today", "/quests", "/habits", "/village/state", "/achievements"]) {
    await expectStatus(path, 200);
  }

  const questResponse = await expectStatus("/quests", 201, {
    method: "POST",
    body: JSON.stringify({ title: "Supabase runtime integration quest", priority: "low" }),
  });
  const quest = await questResponse.json() as { id: number };
  await expectStatus(`/quests/${quest.id}`, 204, { method: "DELETE" });

  const habitResponse = await expectStatus("/habits", 201, {
    method: "POST",
    body: JSON.stringify({ name: "Supabase runtime integration habit", category: "Learning", frequency: "daily" }),
  });
  const habit = await habitResponse.json() as { id: number };
  await expectStatus(`/habits/${habit.id}`, 204, { method: "DELETE" });

  await expectStatus("/auth/logout", 204, { method: "POST" });
  console.log("Supabase-backed Express API integration passed.");
} finally {
  if (server) await new Promise<void>((resolve, reject) => server?.close((error) => error ? reject(error) : resolve()));
  await store.close();
}
