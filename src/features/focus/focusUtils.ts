import type {
  FocusDraft,
  FocusJourney,
  FocusPack,
  FocusRules,
  FocusSetupStep,
  FocusStep,
  FocusTask,
} from "./types";

const LEGACY_SETUP_STEPS = new Set(["choose_focus", "choose_duration", "choose_breaks", "choose_atmosphere"]);
const LEGACY_SETUP_STEP_MAP: Record<string, FocusSetupStep> = {
  choose_focus: "task",
  choose_duration: "time",
  choose_breaks: "break",
  choose_atmosphere: "atmosphere",
  confirm: "confirm",
};

export function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `focus-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function formatDurationLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes} min`;
}

export function formatFocusEta(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (totalSeconds <= 60) {
    return {
      primary: totalSeconds <= 10 ? "Almost done" : "Less than a minute left",
      secondary: formatTime(ms),
    };
  }
  if (hours > 0 && minutes > 0) {
    return { primary: `${hours}h ${minutes}m left`, secondary: formatTime(ms) };
  }
  if (hours > 0) {
    return { primary: `${hours}h left`, secondary: formatTime(ms) };
  }
  return { primary: `${totalMinutes} min left`, secondary: formatTime(ms) };
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized;
  const value = Number.parseInt(expanded, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function clampToAllowed(value: number, allowed: number[]) {
  return allowed.includes(value) ? value : allowed[0] ?? value;
}

export function normalizeDurationMinutes(value: number, fallback: number) {
  return Math.max(1, Math.round(Number.isFinite(value) ? value : fallback));
}

export function getCurrentIso() {
  return new Date().toISOString();
}

export function isSameLocalDay(iso: string, reference = new Date()) {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export function getFocusTasks(pack: FocusPack, rules: FocusRules, customTaskTitle: string): FocusTask[] {
  const mainPriority = pack.priorities.find((item) => item.priority_type === "main") ?? pack.priorities[0];
  const nextProject = pack.projects.find((project) => project.status !== "completed") ?? pack.projects[0];
  const nextGoal = pack.quests.length ? pack.quests[0] : null;
  const nextHabit = pack.habits.find((habit) => habit.is_active !== false) ?? pack.habits[0] ?? null;

  const tasks: FocusTask[] = [];

  if (nextProject && rules.allowedTaskSources.includes("workshop")) {
    tasks.push({
      id: `workshop:${nextProject.id}`,
      title: nextProject.title,
      detail: "A real project step from the Workshop.",
      source: "workshop",
    });
  }

  if (nextGoal && rules.allowedTaskSources.includes("learning_corner")) {
    tasks.push({
      id: `learning:${nextGoal.id}`,
      title: nextGoal.title,
      detail: "A short learning or revision step.",
      source: "learning_corner",
    });
  }

  if (nextHabit && rules.allowedTaskSources.includes("garden")) {
    tasks.push({
      id: `garden:${nextHabit.id}`,
      title: nextHabit.name,
      detail: "A routine step from the Garden.",
      source: "garden",
    });
  }

  if (mainPriority && rules.allowedTaskSources.includes("town_hall")) {
    tasks.push({
      id: `town:${mainPriority.id}`,
      title: mainPriority.goal_title ?? mainPriority.project_title ?? "Main priority",
      detail: "Your current Lighthouse priority.",
      source: "town_hall",
    });
  }

  if (rules.canUseCustomTask && rules.allowedTaskSources.includes("custom")) {
    tasks.push({
      id: "custom",
      title: customTaskTitle.trim() || "Write my own focus",
      detail: "A custom task you choose yourself.",
      source: "custom",
    });
  }

  return tasks.slice(0, 5);
}

export function buildDefaultJourney(): FocusJourney {
  return {
    id: createId(),
    currentStep: "enter",
    setupStep: "task",
    selectedDurationMinutes: 15,
    selectedBreakMinutes: 0,
    selectedRounds: 1,
    selectedAtmosphereId: "cozy-clock",
  };
}

export function normalizeStoredStep(step: string | undefined): FocusStep {
  if (!step) return "enter";
  if (LEGACY_SETUP_STEPS.has(step)) return "setup";
  if (step === "confirm") return "setup";
  if (step === "focus" || step === "break" || step === "review" || step === "exit" || step === "enter" || step === "setup") {
    return step;
  }
  return "enter";
}

export function normalizeStoredSetupStep(step: string | undefined, currentStep: string | undefined): FocusSetupStep {
  if (step === "task" || step === "time" || step === "break" || step === "atmosphere" || step === "confirm") {
    return step;
  }
  if (currentStep && LEGACY_SETUP_STEP_MAP[currentStep]) {
    return LEGACY_SETUP_STEP_MAP[currentStep];
  }
  return "task";
}

export function normalizeStoredDraft(draft: FocusDraft | null): FocusDraft | null {
  if (!draft) return null;
  return {
    ...draft,
    journey: {
      ...draft.journey,
      currentStep: normalizeStoredStep(draft.journey?.currentStep),
      setupStep: normalizeStoredSetupStep(draft.journey?.setupStep, draft.journey?.currentStep),
    },
  };
}

export function isFocusableStep(step: FocusStep) {
  return step === "focus" || step === "break";
}

export function stepLabel(step: FocusStep) {
  return {
    enter: "Enter",
    setup: "Setup",
    confirm: "Confirm",
    focus: "Focus",
    break: "Break",
    review: "Review",
    exit: "Return",
  }[step];
}
