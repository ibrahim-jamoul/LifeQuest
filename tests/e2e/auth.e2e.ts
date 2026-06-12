import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("child can sign in, see the HUD, and log out", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await expect(page.getByRole("button", { name: /XP/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Streak/ })).toBeVisible();
  await page.getByRole("button", { name: "Open village menu" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
