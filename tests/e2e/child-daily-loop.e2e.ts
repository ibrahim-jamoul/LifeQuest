import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("child completes a quest and habit then returns to the village", async ({ page }) => {
  await login(page);
  const questTitle = `Test E2E quest ${Date.now()}`;
  await page.goto("/quests");
  await page.getByPlaceholder("Quest title").fill(questTitle);
  await page.getByRole("button", { name: "Add quest" }).click();
  const quest = page.getByRole("article").filter({ hasText: questTitle });
  await expect(quest).toBeVisible();
  const editedQuestTitle = `${questTitle} edited`;
  await quest.getByRole("button", { name: `Edit ${questTitle}` }).click();
  await page.getByLabel("Edit quest title").fill(editedQuestTitle);
  await page.getByRole("button", { name: "Save quest" }).click();
  const editedQuest = page.getByRole("article").filter({ hasText: editedQuestTitle });
  await expect(editedQuest).toBeVisible();
  await editedQuest.getByRole("button", { name: "Complete" }).click();
  await expect(page.getByText("Quest completed. XP gained.")).toBeVisible();

  const habitTitle = `Test E2E habit ${Date.now()}`;
  await page.goto("/habits");
  await page.getByPlaceholder("Habit name").fill(habitTitle);
  await page.getByRole("button", { name: "Add habit" }).click();
  const habit = page.getByRole("article").filter({ hasText: habitTitle });
  await expect(habit).toBeVisible();
  const editedHabitTitle = `${habitTitle} edited`;
  await habit.getByRole("button", { name: `Edit ${habitTitle}` }).click();
  await page.getByLabel("Edit habit name").fill(editedHabitTitle);
  await page.getByRole("button", { name: "Save habit" }).click();
  const editedHabit = page.getByRole("article").filter({ hasText: editedHabitTitle });
  await expect(editedHabit).toBeVisible();
  await editedHabit.getByRole("button", { name: "Log today" }).click();
  await expect(page.getByText("Habit logged. Streak updated.")).toBeVisible();
  await editedHabit.getByRole("button", { name: `View history for ${editedHabitTitle}` }).click();
  await expect(editedHabit.getByText("Last 30 days")).toBeVisible();
  await expect(editedHabit.getByText("Checked from habits page")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("img", { name: "Interactive coded LifeQuest village island" })).toBeVisible();
  await expect(page.getByRole("button", { name: /XP/ })).toBeVisible();
});
