import type { FocusPriority, Habit, WeeklyChallenge } from "../../lib/api/client";

export type FocusStep =
  | "enter"
  | "setup"
  | "focus"
  | "break"
  | "review"
  | "exit";

export type FocusSetupStep = "task" | "time" | "break" | "atmosphere" | "confirm";

export type TaskSource = "workshop" | "learning_corner" | "garden" | "town_hall" | "custom";
export type ReviewFeeling = "easy" | "okay" | "hard" | "distracted";
export type ReviewFinish = "yes" | "almost" | "not_yet";
export type FocusTheme = "cozy_clock" | "calm_ocean" | "forest_desk";

export type FocusRules = {
  childId: string;
  allowedDurations: number[];
  allowedBreakDurations: number[];
  maxDailyFocusMinutes: number;
  canPause: boolean;
  canCancel: boolean;
  canFinishEarly: boolean;
  canUseCustomTask: boolean;
  allowMultipleRounds: boolean;
  allowedTaskSources: TaskSource[];
  allowedAtmosphereIds: string[];
  requireParentApprovalAboveMinutes: number;
};

export type FocusAtmosphere = {
  id: string;
  name: string;
  theme: FocusTheme;
  background: string;
  accent: string;
  clockStyle: "circle" | "hourglass";
  available: boolean;
  subtitle: string;
};

export type FocusHistoryEntry = {
  id: string;
  sessionId: string;
  childId: string;
  taskTitle: string;
  taskSource?: TaskSource;
  durationMinutes: number;
  breakMinutes: number;
  rounds: number;
  completed: boolean;
  difficultyFeedback: ReviewFeeling;
  atmosphereId?: string;
  startedAt?: string;
  endedAt: string;
  interrupted: boolean;
  createdAt: string;
};

export type FocusJourney = {
  id: string;
  currentStep: FocusStep;
  setupStep?: FocusSetupStep;
  selectedTaskId?: string;
  selectedTaskTitle?: string;
  selectedTaskSource?: TaskSource;
  selectedDurationMinutes?: number;
  selectedBreakMinutes?: number;
  selectedRounds?: number;
  selectedAtmosphereId?: string;
};

export type FocusSession = {
  id: string;
  taskTitle: string;
  taskSource?: TaskSource;
  durationMinutes: number;
  breakMinutes: number;
  rounds: number;
  currentRound: number;
  manualBreaksUsed: number;
  breakMode?: "scheduled" | "manual";
  status: "setup" | "running" | "paused" | "break" | "completed" | "interrupted" | "cancelled";
  startedAt?: string;
  endedAt?: string;
  completed: boolean;
  atmosphereId?: string;
  difficultyFeedback?: ReviewFeeling;
};

export type FocusDraft = {
  journey: FocusJourney;
  session: FocusSession | null;
  remainingMs: number;
  breakRemainingMs: number;
  customTaskTitle: string;
  reviewFinish: ReviewFinish;
  reviewFeeling: ReviewFeeling;
};

export type FocusTask = {
  id: string;
  title: string;
  detail: string;
  source: TaskSource;
};

export type FocusPack = {
  priorities: FocusPriority[];
  quests: WeeklyChallenge[];
  projects: Array<{ id: number; title: string; status: string }>;
  habits: Habit[];
};

export type FocusBreakOption = {
  breakMinutes: number;
  rounds: number;
  title: string;
  detail: string;
};
