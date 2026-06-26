export type {
  FocusAtmosphere,
  FocusBreakOption,
  FocusDraft,
  FocusHistoryEntry,
  FocusJourney,
  FocusPack,
  FocusRules,
  FocusSession,
  FocusSetupStep,
  FocusStep,
  FocusTask,
  FocusTheme,
  ReviewFeeling,
  ReviewFinish,
  TaskSource,
} from "./types";

import type { FocusAtmosphere, FocusRules } from "./types";

export const LIGHTHOUSE_DRAFT_KEY = "lifequest.lighthouse-draft";
export const LIGHTHOUSE_HISTORY_KEY = "lifequest.lighthouse-history";
export const LIGHTHOUSE_RULES_KEY = "lifequest.lighthouse-rules";

export const LIGHTHOUSE_ATMOSPHERES: FocusAtmosphere[] = [
  {
    id: "cozy-clock",
    name: "Warm Quiet Room",
    theme: "cozy_clock",
    background: "linear-gradient(180deg, #fff3d8 0%, #f8e8bc 100%)",
    accent: "#f4a261",
    clockStyle: "circle",
    available: true,
    subtitle: "Warm light, slow movement, quiet focus.",
  },
  {
    id: "calm-ocean",
    name: "Calm Ocean",
    theme: "calm_ocean",
    background: "linear-gradient(180deg, #9fddea 0%, #74c6d9 48%, #54a9c1 100%)",
    accent: "#fff7e3",
    clockStyle: "hourglass",
    available: true,
    subtitle: "Soft water colors and a quiet rhythm.",
  },
  {
    id: "forest-desk",
    name: "Forest Study",
    theme: "forest_desk",
    background: "linear-gradient(180deg, #dff1d8 0%, #bfe0b5 52%, #89bb81 100%)",
    accent: "#4f8c43",
    clockStyle: "circle",
    available: true,
    subtitle: "Soft greens, subtle drift, steady attention.",
  },
];

export const DEFAULT_LIGHTHOUSE_RULES: FocusRules = {
  childId: "",
  allowedDurations: [5, 10, 15, 25, 40, 60],
  allowedBreakDurations: [0, 3, 5, 10],
  maxDailyFocusMinutes: 0,
  canPause: true,
  canCancel: true,
  canFinishEarly: true,
  canUseCustomTask: true,
  allowMultipleRounds: true,
  allowedTaskSources: ["workshop", "learning_corner", "garden", "town_hall", "custom"],
  allowedAtmosphereIds: LIGHTHOUSE_ATMOSPHERES.map((item) => item.id),
  requireParentApprovalAboveMinutes: 0,
};

export const LIGHTHOUSE_MODE_PRESETS = [
  { id: "quick-focus", name: "Quick Focus", duration: 10, breakMinutes: 0, rounds: 1, atmosphereId: "calm-ocean", canPause: true, canCancel: true },
  { id: "deep-focus", name: "Deep Focus", duration: 25, breakMinutes: 5, rounds: 2, atmosphereId: "forest-desk", canPause: true, canCancel: false },
  { id: "reading-mode", name: "Reading Mode", duration: 15, breakMinutes: 3, rounds: 1, atmosphereId: "cozy-clock", canPause: true, canCancel: true },
  { id: "homework-mode", name: "Homework Mode", duration: 25, breakMinutes: 3, rounds: 1, atmosphereId: "cozy-clock", canPause: false, canCancel: true },
  { id: "creative-mode", name: "Creative Mode", duration: 15, breakMinutes: 5, rounds: 2, atmosphereId: "forest-desk", canPause: true, canCancel: true },
  { id: "calm-mode", name: "Calm Mode", duration: 5, breakMinutes: 0, rounds: 1, atmosphereId: "calm-ocean", canPause: true, canCancel: true },
] as const;
