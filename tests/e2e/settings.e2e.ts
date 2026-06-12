import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("child display name persists after settings reload", async ({ page }) => {
  await login(page);
  const displayName = `Explorer ${Date.now()}`;
  await page.goto("/settings");
  await page.getByLabel("Display name").fill(displayName);
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue(displayName);
});
