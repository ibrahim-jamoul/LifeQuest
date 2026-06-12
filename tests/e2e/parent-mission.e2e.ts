import { expect, test } from "@playwright/test";
import { childAccount, login, parentAccount } from "./helpers";

test("parent creates and validates a child mission", async ({ page }) => {
  await login(page);
  const missionTitle = `Test E2E mission ${Date.now()}`;

  await page.goto("/parent-access");
  await page.getByPlaceholder("Parent email").fill(parentAccount.email);
  await page.getByPlaceholder("Parent password").fill(parentAccount.password);
  await page.getByRole("button", { name: "Open parent lodge" }).click();
  await page.getByPlaceholder("Mission title").fill(missionTitle);
  await page.getByRole("button", { name: "Create mission" }).click();
  await expect(page.getByRole("article").filter({ hasText: missionTitle })).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await login(page, childAccount);
  await page.goto("/missions");
  const childMission = page.getByRole("article").filter({ hasText: missionTitle });
  await childMission.getByRole("button", { name: "I did this mission" }).click();
  await expect(childMission.getByText("Sent to parent for validation")).toBeVisible();

  await page.goto("/parent-access");
  await page.getByPlaceholder("Parent email").fill(parentAccount.email);
  await page.getByPlaceholder("Parent password").fill(parentAccount.password);
  await page.getByRole("button", { name: "Open parent lodge" }).click();
  const parentMission = page.getByRole("article").filter({ hasText: missionTitle });
  await parentMission.getByRole("button", { name: "Validate" }).click();
  await expect(parentMission.getByText("Completed")).toBeVisible();
});
