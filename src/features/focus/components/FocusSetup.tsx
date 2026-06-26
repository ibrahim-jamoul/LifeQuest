import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Plus, TimerReset } from "lucide-react";
import type { ReactNode } from "react";
import type { FocusAtmosphere, FocusBreakOption, FocusRules, FocusSetupStep, FocusTask } from "../types";
import { formatDurationLabel } from "../focusUtils";

type FocusSetupProps = {
  rules: FocusRules;
  setupStep: FocusSetupStep;
  suggestions: FocusTask[];
  selectedTaskId?: string;
  selectedTaskTitle: string;
  selectedTaskDetail?: string;
  customTaskTitle: string;
  onCustomTaskChange: (value: string) => void;
  onSelectTask: (task: FocusTask) => void;
  selectedDurationMinutes: number;
  onSelectDuration: (minutes: number) => void;
  customDurationHours: string;
  customDurationMinutes: string;
  onCustomDurationHoursChange: (value: string) => void;
  onCustomDurationMinutesChange: (value: string) => void;
  onApplyCustomDuration: () => void;
  customDurationTotal: number;
  remainingDailyMinutes: number;
  exceedsDailyLimit: boolean;
  needsParentApproval: boolean;
  breakOptions: FocusBreakOption[];
  selectedBreakMinutes: number;
  selectedRounds: number;
  onSelectBreakOption: (breakMinutes: number, rounds: number) => void;
  availableAtmospheres: FocusAtmosphere[];
  selectedAtmosphere: FocusAtmosphere;
  onSelectAtmosphere: (atmosphereId: string) => void;
  onBackToEnter: () => void;
  onSetupStepChange: (step: FocusSetupStep) => void;
  onStartFocus: () => void;
};

const SETUP_FLOW: Array<{ id: FocusSetupStep; label: string; title: string; subtitle: string }> = [
  { id: "task", label: "Task", title: "Choose one clear thing.", subtitle: "Only one decision right now." },
  { id: "time", label: "Time", title: "Choose a realistic block.", subtitle: "Adjust it like a focus dial." },
  { id: "break", label: "Break", title: "Choose your rhythm.", subtitle: "One round or a calm pause in the middle." },
  { id: "atmosphere", label: "Place", title: "Pick the mood.", subtitle: "Let the room match the work." },
  { id: "confirm", label: "Start", title: "Everything is ready.", subtitle: "One last glance, then begin." },
];

const TIME_DELTAS = [5, 15, 30, 60];
const PRESET_SHORTCUTS = [5, 10, 15, 25];

function StepProgress({ currentStep }: { currentStep: FocusSetupStep }) {
  const currentIndex = SETUP_FLOW.findIndex((item) => item.id === currentStep);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {SETUP_FLOW.map((step, index) => {
        const isActive = currentStep === step.id;
        const isDone = index < currentIndex;
        return (
          <div
            key={step.id}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] transition sm:px-3 ${
              isActive
                ? "border-white bg-white/22 text-white"
                : isDone
                  ? "border-white/20 bg-white/12 text-white/88"
                  : "border-white/10 bg-white/6 text-white/55"
            }`}
          >
            {step.label}
          </div>
        );
      })}
    </div>
  );
}

function SetupShell({
  setupStep,
  children,
}: {
  setupStep: FocusSetupStep;
  children: ReactNode;
}) {
  const currentMeta = SETUP_FLOW.find((item) => item.id === setupStep) ?? SETUP_FLOW[0];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1020px] items-center justify-center py-2 sm:py-4">
      <div className="w-full space-y-3 sm:space-y-4">
        <div className="mx-auto max-w-[44rem] rounded-[28px] border border-white/15 bg-white/11 px-5 py-4 text-center shadow-[0_18px_48px_rgba(0,0,0,.16)] backdrop-blur-md sm:px-7 sm:py-[1.125rem]">
          <p className="eyebrow text-white/70">Focus setup</p>
          <h2 className="mt-1.5 text-[1.8rem] font-black leading-tight sm:text-[2.15rem]">{currentMeta.title}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/80 sm:text-[14px] sm:leading-6">{currentMeta.subtitle}</p>
          <div className="mt-3.5 sm:mt-4">
            <StepProgress currentStep={setupStep} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

type StepActionsProps = {
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextIcon?: ReactNode;
};

function StepActions({ onBack, onNext, nextLabel = "Next", nextDisabled, nextIcon }: StepActionsProps) {
  return (
    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button className="button-secondary min-w-[124px] justify-center" onClick={onBack}>
        <ArrowLeft className="size-4" /> Back
      </button>
      {onNext ? (
        <button className="button-primary min-w-[140px] justify-center" disabled={nextDisabled} onClick={onNext}>
          {nextLabel} {nextIcon ?? <ArrowRight className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}

export function FocusSetup({
  rules,
  setupStep,
  suggestions,
  selectedTaskId,
  selectedTaskTitle,
  selectedTaskDetail,
  customTaskTitle,
  onCustomTaskChange,
  onSelectTask,
  selectedDurationMinutes,
  onSelectDuration,
  customDurationHours,
  customDurationMinutes,
  onCustomDurationHoursChange,
  onCustomDurationMinutesChange,
  onApplyCustomDuration,
  customDurationTotal,
  remainingDailyMinutes,
  exceedsDailyLimit,
  needsParentApproval,
  breakOptions,
  selectedBreakMinutes,
  selectedRounds,
  onSelectBreakOption,
  availableAtmospheres,
  selectedAtmosphere,
  onSelectAtmosphere,
  onBackToEnter,
  onSetupStepChange,
  onStartFocus,
}: FocusSetupProps) {
  const lifeQuestSuggestions = suggestions.filter((item) => item.source !== "custom").slice(0, 5);
  const hasTaskSelection = selectedTaskTitle.trim().length > 0;
  const minDuration = Math.min(...rules.allowedDurations);
  const maxRuleDuration = Math.max(...rules.allowedDurations);
  const maxDuration = Number.isFinite(remainingDailyMinutes)
    ? Math.max(minDuration, Math.min(maxRuleDuration, remainingDailyMinutes))
    : maxRuleDuration;
  const durationUnavailable = rules.maxDailyFocusMinutes > 0 && remainingDailyMinutes < minDuration;
  const canDecrease = selectedDurationMinutes > minDuration;
  const canIncrease = selectedDurationMinutes < maxDuration;

  const moveStep = (direction: -1 | 1) => {
    const currentIndex = SETUP_FLOW.findIndex((item) => item.id === setupStep);
    const nextStep = SETUP_FLOW[currentIndex + direction];
    if (nextStep) onSetupStepChange(nextStep.id);
  };

  const adjustDuration = (delta: number) => {
    const nextValue = Math.max(minDuration, Math.min(maxDuration, selectedDurationMinutes + delta));
    onSelectDuration(nextValue);
  };

  const formatBreakLabel = () => {
    if (selectedRounds > 1) return `${selectedRounds} rounds with ${selectedBreakMinutes} min break`;
    if (selectedBreakMinutes > 0) return `${selectedBreakMinutes} min break`;
    return "No break";
  };

  if (setupStep === "task") {
    return (
      <SetupShell setupStep={setupStep}>
        <div className="mx-auto max-w-[760px] rounded-[28px] border border-white/15 bg-white/12 px-5 py-[1.125rem] shadow-[0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-md sm:px-6 sm:py-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Choose task</p>
          <h3 className="mt-2 text-[1.6rem] font-black leading-tight sm:text-[1.9rem]">What do you want to finish?</h3>
          <div className="mt-4 grid gap-2.5">
            {lifeQuestSuggestions.map((task) => {
              const selected = selectedTaskId === task.id;
              return (
                <button
                  key={task.id}
                  className={`min-h-[96px] rounded-[20px] border-2 px-4 py-3.5 text-left transition sm:px-5 ${selected ? "border-white bg-white/20" : "border-white/10 bg-white/8 hover:border-white/30 hover:bg-white/15"}`}
                  onClick={() => onSelectTask(task)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">{task.source.replace("_", " ")}</p>
                      <strong className="mt-1.5 block text-[1rem] sm:text-[1.05rem]">{task.title}</strong>
                      <p className="mt-1 text-sm leading-5 text-white/76">{task.detail}</p>
                    </div>
                    <CheckCircle2 className={`mt-1 size-5 ${selected ? "text-white" : "text-white/35"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {rules.canUseCustomTask && rules.allowedTaskSources.includes("custom") ? (
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.06] p-4 sm:p-[1.125rem]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">Custom task</p>
              <textarea
                className="input mt-3 min-h-28 bg-white/88 text-text-primary sm:min-h-24"
                value={customTaskTitle}
                onChange={(event) => onCustomTaskChange(event.target.value)}
                placeholder="Example: Finish my reading pages"
              />
              <button
                className="button-secondary mt-3"
                onClick={() => onSelectTask({ id: "custom", title: customTaskTitle || "Write my own focus", detail: "A custom focus task.", source: "custom" })}
              >
                Use this task
              </button>
            </div>
          ) : null}

          <StepActions onBack={onBackToEnter} onNext={() => onSetupStepChange("time")} nextDisabled={!hasTaskSelection} />
        </div>
      </SetupShell>
    );
  }

  if (setupStep === "time") {
    return (
      <SetupShell setupStep={setupStep}>
        <div className="mx-auto max-w-[960px] rounded-[28px] border border-white/15 bg-white/12 px-5 py-[1.125rem] shadow-[0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-md sm:px-6 sm:py-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Choose time</p>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.18fr_.82fr] xl:items-stretch">
            <div className="rounded-[24px] border border-white/12 bg-white/10 px-5 py-5 text-center sm:px-6 sm:py-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/65">Focus dial</p>
              <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-[24px] border border-white/12 bg-white/12 px-5 py-5 shadow-[0_14px_36px_rgba(0,0,0,.16)] sm:min-h-[252px]">
                <div className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/12 bg-white/12 px-8 py-9 sm:min-w-[276px] sm:px-10 sm:py-11">
                  <strong className="text-[2.5rem] font-black tracking-tight sm:text-[3.8rem]">{formatDurationLabel(selectedDurationMinutes)}</strong>
                </div>
              </div>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/74 sm:text-[14px]">
                {durationUnavailable
                  ? "No valid focus block is available right now because today's limit is already reached."
                  : `Pick something realistic between ${formatDurationLabel(minDuration)} and ${formatDurationLabel(maxDuration)}.`}
              </p>
              {needsParentApproval ? <p className="mt-3 text-sm font-bold text-white/80">This choice needs parent approval first.</p> : null}
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                {TIME_DELTAS.map((delta) => (
                  <button
                    key={`plus-${delta}`}
                    aria-label={`Add ${formatDurationLabel(delta)}`}
                    className="min-h-[64px] rounded-[18px] border border-white/12 bg-white/10 px-4 py-3.5 text-left transition hover:border-white/30 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={durationUnavailable || !canIncrease}
                    onClick={() => adjustDuration(delta)}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Plus className="size-4" />
                      <strong className="text-[15px] sm:text-base">{`+${formatDurationLabel(delta)}`}</strong>
                    </div>
                  </button>
                ))}
                {TIME_DELTAS.map((delta) => (
                  <button
                    key={`minus-${delta}`}
                    aria-label={`Subtract ${formatDurationLabel(delta)}`}
                    className="min-h-[64px] rounded-[18px] border border-white/12 bg-white/10 px-4 py-3.5 text-left transition hover:border-white/30 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={durationUnavailable || !canDecrease}
                    onClick={() => adjustDuration(-delta)}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Minus className="size-4" />
                      <strong className="text-[15px] sm:text-base">{`-${formatDurationLabel(delta)}`}</strong>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.07] p-4 sm:p-[1.125rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Preset shortcuts</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PRESET_SHORTCUTS.map((minutes) => {
                    const disabled = minutes < minDuration || minutes > maxDuration || durationUnavailable;
                    const selected = selectedDurationMinutes === minutes;
                    return (
                      <button
                        key={minutes}
                        disabled={disabled}
                        className={`min-h-[52px] rounded-[16px] border px-3 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
                          selected ? "border-white bg-white/22 text-white" : "border-white/10 bg-white/10 text-white/82 hover:border-white/30 hover:bg-white/15"
                        }`}
                        onClick={() => onSelectDuration(minutes)}
                      >
                        {formatDurationLabel(minutes)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4 sm:p-[1.125rem]">
                <div className="flex items-center gap-2">
                  <TimerReset className="size-4 text-white/70" />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Manual time</p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[.75fr_.75fr_auto]">
                  <label className="text-sm font-bold text-white/85">
                    Hours
                    <input className="input mt-2 bg-white/88 text-text-primary" type="number" min={0} max={12} value={customDurationHours} onChange={(event) => onCustomDurationHoursChange(event.target.value)} />
                  </label>
                  <label className="text-sm font-bold text-white/85">
                    Minutes
                    <input className="input mt-2 bg-white/88 text-text-primary" type="number" min={0} max={59} value={customDurationMinutes} onChange={(event) => onCustomDurationMinutesChange(event.target.value)} />
                  </label>
                  <button className="button-secondary self-end" disabled={customDurationTotal <= 0} onClick={onApplyCustomDuration}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <StepActions onBack={() => moveStep(-1)} onNext={() => moveStep(1)} nextDisabled={durationUnavailable || selectedDurationMinutes <= 0 || exceedsDailyLimit} />
          {exceedsDailyLimit ? <p className="mt-3 text-sm font-bold text-white/80">This session would exceed today's Lighthouse time limit.</p> : null}
        </div>
      </SetupShell>
    );
  }

  if (setupStep === "break") {
    return (
      <SetupShell setupStep={setupStep}>
        <div className="mx-auto max-w-[740px] rounded-[28px] border border-white/15 bg-white/12 px-5 py-[1.125rem] shadow-[0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-md sm:px-6 sm:py-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Choose break</p>
          <h3 className="mt-2 text-[1.6rem] font-black leading-tight sm:text-[1.9rem]">Do you want a break?</h3>
          <div className="mt-4 grid gap-2.5">
            {breakOptions.map((option) => {
              const selected = selectedBreakMinutes === option.breakMinutes && selectedRounds === option.rounds;
              return (
                <button
                  key={`${option.breakMinutes}-${option.rounds}`}
                  className={`min-h-[84px] rounded-[20px] border-2 px-4 py-3.5 text-left transition sm:px-5 ${selected ? "border-white bg-white/20" : "border-white/10 bg-white/8 hover:border-white/30 hover:bg-white/15"}`}
                  onClick={() => onSelectBreakOption(option.breakMinutes, option.rounds)}
                >
                  <strong className="block text-[1rem] sm:text-[1.05rem]">{option.title}</strong>
                  <p className="mt-1 text-sm leading-5 text-white/76">{option.detail}</p>
                </button>
              );
            })}
          </div>
          <StepActions onBack={() => moveStep(-1)} onNext={() => moveStep(1)} />
        </div>
      </SetupShell>
    );
  }

  if (setupStep === "atmosphere") {
    return (
      <SetupShell setupStep={setupStep}>
        <div className="mx-auto max-w-[940px] rounded-[28px] border border-white/15 bg-white/12 px-5 py-[1.125rem] shadow-[0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-md sm:px-6 sm:py-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Choose atmosphere</p>
          <h3 className="mt-2 text-[1.6rem] font-black leading-tight sm:text-[1.9rem]">Which mood helps you most?</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {availableAtmospheres.map((atmosphere) => {
              const selected = selectedAtmosphere.id === atmosphere.id;
              return (
                <button
                  key={atmosphere.id}
                  className={`min-h-[188px] rounded-[20px] border-2 px-4 py-3.5 text-left transition sm:px-5 ${selected ? "border-white bg-white/20" : "border-white/10 bg-white/8 hover:border-white/30 hover:bg-white/15"}`}
                  onClick={() => onSelectAtmosphere(atmosphere.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-[1rem] sm:text-[1.05rem]">{atmosphere.name}</strong>
                    <CheckCircle2 className={`size-5 ${selected ? "text-white" : "text-white/35"}`} />
                  </div>
                  <p className="mt-2 text-sm leading-5 text-white/76">{atmosphere.subtitle}</p>
                  <div className="mt-3 h-24 rounded-[16px] border border-white/15 sm:h-28" style={{ background: atmosphere.background }} />
                </button>
              );
            })}
          </div>
          <StepActions onBack={() => moveStep(-1)} onNext={() => moveStep(1)} />
        </div>
      </SetupShell>
    );
  }

  return (
    <SetupShell setupStep={setupStep}>
      <div className="mx-auto max-w-[720px] rounded-[28px] border border-white/15 bg-white/12 px-5 py-[1.125rem] shadow-[0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-md sm:px-6 sm:py-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Confirm</p>
        <h3 className="mt-2 text-[1.7rem] font-black leading-tight sm:text-[2rem]">Ready to begin?</h3>
        <p className="mt-2 text-sm leading-6 text-white/76">A quick check, then start.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/12 bg-white/[0.08] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Task</p>
            <strong className="mt-2 block text-[1.05rem] leading-6">{selectedTaskTitle || "Pick your focus first"}</strong>
          </div>
          <div className="rounded-[18px] border border-white/12 bg-white/[0.08] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Time</p>
            <strong className="mt-2 block text-[1.05rem]">{formatDurationLabel(selectedDurationMinutes)}</strong>
          </div>
          <div className="rounded-[18px] border border-white/12 bg-white/[0.08] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Break</p>
            <strong className="mt-2 block text-[1.05rem]">{formatBreakLabel()}</strong>
          </div>
          <div className="rounded-[18px] border border-white/12 bg-white/[0.08] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Atmosphere</p>
            <strong className="mt-2 block text-[1.05rem]">{selectedAtmosphere.name}</strong>
          </div>
        </div>

        <StepActions
          onBack={() => moveStep(-1)}
          onNext={onStartFocus}
          nextLabel="Start focus"
          nextDisabled={!hasTaskSelection || exceedsDailyLimit || needsParentApproval}
          nextIcon={<ArrowRight className="size-4" />}
        />
        {needsParentApproval ? <p className="mt-3 text-sm font-bold text-white/80">This duration is above the current parent approval limit.</p> : null}
        {exceedsDailyLimit ? <p className="mt-3 text-sm font-bold text-white/80">This session would exceed today's Lighthouse time limit.</p> : null}
      </div>
    </SetupShell>
  );
}
