import { defineConfig } from '@playwright/test';

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

const portrait = [
  ['portrait-320x568', 320, 568],
  ['portrait-390x844', 390, 844],
  ['portrait-540x960', 540, 960],
  ['portrait-768x1024', 768, 1024],
];

const landscape = [
  ['landscape-844x390', 844, 390],
  ['landscape-1024x768', 1024, 768],
];

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['line']],
  use: {
    baseURL: externalBaseURL || 'http://127.0.0.1:8767',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
    locale: 'fr-FR',
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: externalBaseURL ? undefined : {
    command: 'node tools/serve.mjs --host 127.0.0.1 --port 8767',
    url: 'http://127.0.0.1:8767',
    timeout: 30_000,
    reuseExistingServer: false,
  },
  projects: [...portrait, ...landscape].map(([name, width, height]) => ({
    name,
    use: {
      viewport: { width, height },
      screen: { width, height },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
    },
  })),
});
