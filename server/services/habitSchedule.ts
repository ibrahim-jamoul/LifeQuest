const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function customScheduleDays(schedule: string | null | undefined): string[] {
  if (!schedule) return [];
  return schedule.toLowerCase().split(",").map((day) => day.trim().slice(0, 3)).filter((day) => dayNames.includes(day as typeof dayNames[number]));
}

export function isHabitDueToday(frequency: string, customSchedule: string | null | undefined, date = new Date()): boolean {
  if (frequency !== "custom") return true;
  return customScheduleDays(customSchedule).includes(dayNames[date.getDay()]);
}
