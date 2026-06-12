import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.BASE_URL ? undefined : {
    command: "npm run e2e:prepare && npm run dev:e2e",
    url: "http://localhost:3100/login",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_PATH: "./data/e2e.db", PORT: "4100", VITE_API_URL: "http://localhost:4100/api" },
  },
});
