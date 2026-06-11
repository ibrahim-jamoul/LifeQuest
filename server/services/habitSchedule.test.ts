import { describe, expect, it } from "vitest";
import { customScheduleDays, isHabitDueToday } from "./habitSchedule";

describe("habit schedule", () => {
  it("normalizes custom schedule day names", () => {
    expect(customScheduleDays("Monday, WED, friday")).toEqual(["mon", "wed", "fri"]);
  });

  it("only marks a custom habit due on a configured day", () => {
    expect(isHabitDueToday("custom", "mon,wed", new Date("2026-06-10T10:00:00"))).toBe(true);
    expect(isHabitDueToday("custom", "mon,wed", new Date("2026-06-11T10:00:00"))).toBe(false);
  });

  it("keeps daily and weekly habits available", () => {
    expect(isHabitDueToday("daily", null)).toBe(true);
    expect(isHabitDueToday("weekly", null)).toBe(true);
  });
});
