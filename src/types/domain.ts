export type GoalStatus = "not_started" | "in_progress" | "paused" | "completed";
export type Priority = "low" | "medium" | "high" | "critical";

export interface DashboardSummary {
  activeGoals: number;
  tasksToday: number;
  completedToday: number;
  currentStreak: number;
  totalXp: number;
  level: number;
  focusScore: number;
  distractionRisk: "low" | "medium" | "high";
}
