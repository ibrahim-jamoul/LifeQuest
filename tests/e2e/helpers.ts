import { expect, type Page } from "@playwright/test";

export const childAccount = { email: "child@lifequest.local", password: "lifequest123" };
export const parentAccount = { email: "parent@lifequest.local", password: "lifequest123" };

export async function login(page: Page, account = childAccount) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  const onboarding = page.getByRole("button", { name: "Start exploring" });
  if (await onboarding.waitFor({ state: "visible", timeout: 3_000 }).then(() => true).catch(() => false)) await onboarding.click();
}
