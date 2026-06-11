const deploymentUrl = process.env.DEPLOYMENT_URL?.replace(/\/$/, "");
if (!deploymentUrl) throw new Error("DEPLOYMENT_URL is required.");

const email = process.env.DEPLOYMENT_TEST_EMAIL ?? "child@lifequest.local";
const password = process.env.DEPLOYMENT_TEST_PASSWORD ?? "lifequest123";
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
let token = "";

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${deploymentUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(bypassSecret ? { "x-vercel-protection-bypass": bypassSecret } : {}),
      ...options.headers,
    },
  });
}

async function expectStatus(path: string, expected: number, options: RequestInit = {}) {
  const response = await request(path, options);
  if (response.status !== expected) {
    throw new Error(`${options.method ?? "GET"} ${path}: expected ${expected}, received ${response.status}: ${await response.text()}`);
  }
  console.log(`${options.method ?? "GET"} ${path}: ${response.status}`);
  return response;
}

await expectStatus("/api/health", 200);
const login = await expectStatus("/api/auth/login", 200, {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
token = (await login.json() as { token: string }).token;

for (const path of ["/api/auth/me", "/api/dashboard/today", "/api/village/state", "/api/quests", "/api/habits"]) {
  await expectStatus(path, 200);
}

await expectStatus("/api/auth/logout", 204, { method: "POST" });
console.log("Deployment smoke test passed.");

export {};
