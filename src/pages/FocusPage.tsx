import { ArrowLeft, Compass, Flame, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import {
  DEFAULT_LIGHTHOUSE_RULES,
  LIGHTHOUSE_ATMOSPHERES,
  LIGHTHOUSE_DRAFT_KEY,
  LIGHTHOUSE_HISTORY_KEY,
  LIGHTHOUSE_RULES_KEY,
  type FocusDraft,
  type FocusHistoryEntry,
  type FocusPack,
  type FocusRules,
  type FocusSession,
  type FocusSetupStep,
  type FocusStep,
  type ReviewFeeling,
  type ReviewFinish,
} from "../features/focus/lighthouseConfig";
import { FocusAtmosphereLayers, SavePill, startAmbientAudioForTheme } from "../features/focus/components/FocusAtmosphereView";
import { FocusBreakView } from "../features/focus/components/FocusBreakView";
import { FocusReviewView } from "../features/focus/components/FocusReviewView";
import { FocusSessionView } from "../features/focus/components/FocusSessionView";
import { FocusSetup } from "../features/focus/components/FocusSetup";
import { readLighthouseJson, removeLighthouseJson, writeLighthouseJson } from "../features/focus/focusStorage";
import {
  buildDefaultJourney,
  clampToAllowed,
  createId,
  formatFocusEta,
  formatTime,
  getCurrentIso,
  getFocusTasks,
  isFocusableStep,
  isSameLocalDay,
  normalizeDurationMinutes,
  normalizeStoredDraft,
  stepLabel,
} from "../features/focus/focusUtils";
import { api } from "../lib/api/client";
import { useAppStore } from "../store";

export function FocusPage() {
  const navigate = useNavigate();
  const bootstrap = useAppStore((state) => state.bootstrap);
  const todaySnapshot = useAppStore((state) => state.todaySnapshot);
  const refreshToday = useAppStore((state) => state.refreshToday);
  const refreshVillage = useAppStore((state) => state.refreshVillage);

  const storedRules = useMemo(() => {
    const saved = readLighthouseJson<Partial<FocusRules>>(LIGHTHOUSE_RULES_KEY, {});
    const validAtmosphereIds = new Set(LIGHTHOUSE_ATMOSPHERES.map((item) => item.id));
    const filteredAtmospheres = saved.allowedAtmosphereIds?.filter((item) => validAtmosphereIds.has(item));
    return {
      ...DEFAULT_LIGHTHOUSE_RULES,
      ...saved,
      allowedTaskSources: saved.allowedTaskSources?.length ? saved.allowedTaskSources : DEFAULT_LIGHTHOUSE_RULES.allowedTaskSources,
      allowedAtmosphereIds: filteredAtmospheres?.length ? filteredAtmospheres : LIGHTHOUSE_ATMOSPHERES.map((item) => item.id),
    };
  }, []);

  const loadedDraft = useMemo(
    () => normalizeStoredDraft(readLighthouseJson<FocusDraft | null>(LIGHTHOUSE_DRAFT_KEY, null)),
    [],
  );

  const [rules] = useState<FocusRules>(() => storedRules);
  const [pack, setPack] = useState<FocusPack>({ priorities: [], quests: [], projects: [], habits: [] });
  const [loading, setLoading] = useState(true);
  const [draftExists, setDraftExists] = useState<boolean>(() => Boolean(loadedDraft));
  const [journey, setJourney] = useState(() => loadedDraft?.journey ?? buildDefaultJourney());
  const [session, setSession] = useState<FocusSession | null>(() => loadedDraft?.session ?? null);
  const [remainingMs, setRemainingMs] = useState<number>(() => loadedDraft?.remainingMs ?? 0);
  const [breakRemainingMs, setBreakRemainingMs] = useState<number>(() => loadedDraft?.breakRemainingMs ?? 0);
  const [customTaskTitle, setCustomTaskTitle] = useState<string>(() => loadedDraft?.customTaskTitle ?? "");
  const [customDurationHours, setCustomDurationHours] = useState<string>(() => String(Math.floor((loadedDraft?.journey.selectedDurationMinutes ?? 15) / 60)));
  const [customDurationMinutes, setCustomDurationMinutes] = useState<string>(() => String((loadedDraft?.journey.selectedDurationMinutes ?? 15) % 60));
  const [reviewFinish, setReviewFinish] = useState<ReviewFinish>(() => loadedDraft?.reviewFinish ?? "yes");
  const [reviewFeeling, setReviewFeeling] = useState<ReviewFeeling>(() => loadedDraft?.reviewFeeling ?? "okay");
  const [exitMessage, setExitMessage] = useState("Focus saved. Return when you are ready.");
  const [navigationNotice, setNavigationNotice] = useState<string | null>(null);
  const [leaveGuardOpen, setLeaveGuardOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<FocusHistoryEntry[]>(() => readLighthouseJson<FocusHistoryEntry[]>(LIGHTHOUSE_HISTORY_KEY, []));
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState(true);

  const sessionRef = useRef(session);
  const journeyRef = useRef(journey);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioCleanupRef = useRef<(() => void) | null>(null);

  const isLocked = isFocusableStep(journey.currentStep);

  useBeforeUnload(
    (event) => {
      if (!isLocked) return;
      event.preventDefault();
      event.returnValue = "";
    },
    { capture: true },
  );

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    journeyRef.current = journey;
  }, [journey]);

  useEffect(() => {
    document.title = "Lighthouse - LifeQuest";
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    return () => {
      ambientAudioCleanupRef.current?.();
      ambientAudioCleanupRef.current = null;
      const context = audioContextRef.current;
      audioContextRef.current = null;
      void context?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!isLocked) {
      setLeaveGuardOpen(false);
      return undefined;
    }

    const handlePopState = () => {
      if (!isFocusableStep(journeyRef.current.currentStep)) return;
      window.history.pushState({ lighthouseLock: true, t: Date.now() }, "", window.location.href);
      setLeaveGuardOpen(true);
    };

    window.history.pushState({ lighthouseLock: true, t: Date.now() }, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLocked]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [focusData, projects, habits] = await Promise.all([
          api.focus.get(),
          api.projects.list(),
          api.habits.list(),
        ]);
        if (!mounted) return;
        setPack({ priorities: focusData.priorities, quests: focusData.challenges, projects, habits });
        setLoading(false);
      } catch {
        if (!mounted) return;
        setPack({ priorities: [], quests: [], projects: [], habits: [] });
        setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const suggestions = useMemo(() => getFocusTasks(pack, rules, customTaskTitle), [customTaskTitle, pack, rules]);
  const availableAtmospheres = useMemo(
    () => LIGHTHOUSE_ATMOSPHERES.filter((item) => rules.allowedAtmosphereIds.includes(item.id)),
    [rules.allowedAtmosphereIds],
  );
  const minAllowedDuration = Math.min(...rules.allowedDurations);
  const maxAllowedDuration = Math.max(...rules.allowedDurations);
  const selectedTask = useMemo(() => suggestions.find((item) => item.id === journey.selectedTaskId) ?? null, [journey.selectedTaskId, suggestions]);
  const selectedTaskTitle = journey.selectedTaskId === "custom"
    ? (customTaskTitle.trim() || journey.selectedTaskTitle || "Write my own focus")
    : (selectedTask?.title ?? journey.selectedTaskTitle ?? "");
  const selectedTaskDetail = journey.selectedTaskId === "custom"
    ? "A custom focus task you chose yourself."
    : (selectedTask?.detail ?? "Choose one task to keep the session simple.");
  const selectedTaskSource = journey.selectedTaskId === "custom" ? "custom" : (selectedTask?.source ?? journey.selectedTaskSource);
  const selectedDurationMinutes = Math.max(
    minAllowedDuration,
    Math.min(
      maxAllowedDuration,
      normalizeDurationMinutes(journey.selectedDurationMinutes ?? (rules.allowedDurations[0] ?? 15), rules.allowedDurations[0] ?? 15),
    ),
  );
  const selectedBreakMinutes = clampToAllowed(journey.selectedBreakMinutes ?? 0, rules.allowedBreakDurations);
  const selectedRounds = journey.selectedRounds ?? 1;
  const selectedAtmosphere = availableAtmospheres.find((item) => item.id === journey.selectedAtmosphereId) ?? availableAtmospheres[0] ?? LIGHTHOUSE_ATMOSPHERES[0];
  const minutesFocusedToday = useMemo(
    () => historyEntries.filter((entry) => isSameLocalDay(entry.createdAt)).reduce((sum, entry) => sum + entry.durationMinutes * entry.rounds, 0),
    [historyEntries],
  );
  const remainingDailyMinutes = rules.maxDailyFocusMinutes > 0 ? Math.max(0, rules.maxDailyFocusMinutes - minutesFocusedToday) : Number.POSITIVE_INFINITY;
  const exceedsDailyLimit = rules.maxDailyFocusMinutes > 0 && selectedDurationMinutes * selectedRounds > remainingDailyMinutes;
  const needsParentApproval = rules.requireParentApprovalAboveMinutes > 0 && selectedDurationMinutes > rules.requireParentApprovalAboveMinutes;
  const breakOptions = useMemo(
    () => [
      { breakMinutes: 0, rounds: 1, title: "No break", detail: "One focus session, then review." },
      { breakMinutes: 3, rounds: 1, title: "Short break", detail: "One focus session, then a 3 minute break." },
      { breakMinutes: 5, rounds: 1, title: "Focus + break", detail: "One focus session, then a calm 5 minute break." },
      { breakMinutes: 3, rounds: 2, title: "Multiple rounds", detail: "Two focus rounds with one short break in between." },
    ].filter((option) => rules.allowMultipleRounds || option.rounds === 1),
    [rules.allowMultipleRounds],
  );
  const customDurationTotal = Math.max(0, (Number(customDurationHours) || 0) * 60 + (Number(customDurationMinutes) || 0));
  const focusProgress = useMemo(() => {
    if (!session) return 0;
    const totalFocusMs = Math.max(1, session.durationMinutes * session.rounds * 60_000);
    const completedRounds = Math.max(0, session.currentRound - 1);
    const elapsedThisRound = Math.max(0, session.durationMinutes * 60_000 - remainingMs);
    return Math.min(1, (completedRounds * session.durationMinutes * 60_000 + elapsedThisRound) / totalFocusMs);
  }, [remainingMs, session]);
  const totalElapsedFocusMs = useMemo(() => {
    if (!session) return 0;
    const completedRounds = Math.max(0, session.currentRound - 1);
    const elapsedThisRound = Math.max(0, session.durationMinutes * 60_000 - remainingMs);
    return completedRounds * session.durationMinutes * 60_000 + elapsedThisRound;
  }, [remainingMs, session]);
  const manualBreakIntervalMs = 20 * 60_000;
  const manualBreakUnlocks = session ? Math.floor(totalElapsedFocusMs / manualBreakIntervalMs) : 0;
  const manualBreakAvailable = Boolean(
    session &&
    rules.canPause &&
    session.status === "running" &&
    manualBreakUnlocks > (session.manualBreaksUsed ?? 0),
  );
  const manualBreakWaitMs = session ? Math.max(0, ((session.manualBreaksUsed ?? 0) + 1) * manualBreakIntervalMs - totalElapsedFocusMs) : manualBreakIntervalMs;
  const focusEta = formatFocusEta(remainingMs);
  const manualBreakLabel = manualBreakAvailable ? "Take a break now" : `Break in ${formatFocusEta(manualBreakWaitMs).primary.replace(" left", "")}`;

  useEffect(() => {
    if (!journey.selectedTaskId && suggestions.length) {
      setJourney((current) => ({
        ...current,
        selectedTaskId: suggestions[0].id,
        selectedTaskTitle: suggestions[0].title,
        selectedTaskSource: suggestions[0].source,
      }));
    }
  }, [journey.selectedTaskId, suggestions]);

  useEffect(() => {
    if (!journey.selectedDurationMinutes) {
      setJourney((current) => ({ ...current, selectedDurationMinutes }));
    }
  }, [journey.selectedDurationMinutes, selectedDurationMinutes]);

  useEffect(() => {
    setCustomDurationHours(String(Math.floor(selectedDurationMinutes / 60)));
    setCustomDurationMinutes(String(selectedDurationMinutes % 60));
  }, [selectedDurationMinutes]);

  useEffect(() => {
    if (!availableAtmospheres.length) return;
    if (availableAtmospheres.some((item) => item.id === journey.selectedAtmosphereId)) return;
    setJourney((current) => ({ ...current, selectedAtmosphereId: availableAtmospheres[0].id }));
  }, [availableAtmospheres, journey.selectedAtmosphereId]);

  useEffect(() => {
    if (rules.allowMultipleRounds || selectedRounds === 1) return;
    setJourney((current) => ({ ...current, selectedRounds: 1, selectedBreakMinutes: 0 }));
  }, [rules.allowMultipleRounds, selectedRounds]);

  useEffect(() => {
    const activeDraft = journey.currentStep !== "enter" || Boolean(journey.selectedTaskId) || Boolean(session) || Boolean(customTaskTitle);
    if (!activeDraft) {
      removeLighthouseJson(LIGHTHOUSE_DRAFT_KEY);
      setDraftExists(false);
      return;
    }

    const draft: FocusDraft = {
      journey,
      session,
      remainingMs,
      breakRemainingMs,
      customTaskTitle,
      reviewFinish,
      reviewFeeling,
    };
    writeLighthouseJson(LIGHTHOUSE_DRAFT_KEY, draft);
    setDraftExists(true);
  }, [breakRemainingMs, customTaskTitle, journey, remainingMs, reviewFeeling, reviewFinish, session]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    ambientAudioCleanupRef.current?.();
    ambientAudioCleanupRef.current = null;

    const canPlayAmbient = ambientSoundEnabled && (journey.currentStep === "focus" || journey.currentStep === "break");
    if (!canPlayAmbient) {
      void audioContextRef.current?.suspend().catch(() => undefined);
      return undefined;
    }

    const AudioContextCtor = window.AudioContext
      ?? (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) return undefined;

    let cancelled = false;

    const bootAmbientSound = async () => {
      const context = audioContextRef.current ?? new AudioContextCtor();
      audioContextRef.current = context;
      try {
        if (context.state === "suspended") {
          await context.resume();
        }
      } catch {
        return;
      }
      if (cancelled) return;
      ambientAudioCleanupRef.current = startAmbientAudioForTheme(context, selectedAtmosphere.theme);
    };

    void bootAmbientSound();

    return () => {
      cancelled = true;
      ambientAudioCleanupRef.current?.();
      ambientAudioCleanupRef.current = null;
    };
  }, [ambientSoundEnabled, journey.currentStep, selectedAtmosphere.theme]);

  useEffect(() => {
    if (!isLocked) return undefined;
    const id = window.setInterval(() => {
      const activeSession = sessionRef.current;
      const currentJourney = journeyRef.current;
      if (!activeSession) return;

      if (currentJourney.currentStep === "focus") {
        if (activeSession.status === "paused") return;
        setRemainingMs((current) => {
          if (current <= 1000) {
            const nextRound = activeSession.currentRound + 1;
            if (nextRound <= activeSession.rounds) {
              if (activeSession.breakMinutes > 0) {
                setSession((currentSession) => currentSession ? { ...currentSession, currentRound: activeSession.currentRound, status: "break", breakMode: "scheduled" } : currentSession);
                setJourney((currentJourneyState) => ({ ...currentJourneyState, currentStep: "break" }));
                setBreakRemainingMs(activeSession.breakMinutes * 60_000);
                return 0;
              }

              setSession((currentSession) => currentSession ? { ...currentSession, currentRound: nextRound, status: "running" } : currentSession);
              return activeSession.durationMinutes * 60_000;
            }

            setJourney((currentJourneyState) => ({ ...currentJourneyState, currentStep: "review" }));
            setSession((currentSession) => currentSession ? { ...currentSession, status: "completed" } : currentSession);
            return 0;
          }

          return current - 1000;
        });
      }

      if (currentJourney.currentStep === "break") {
        setBreakRemainingMs((current) => {
          if (current <= 1000) {
            if (activeSession.breakMode === "manual") {
              setSession((currentSession) => currentSession ? { ...currentSession, status: "running", breakMode: undefined } : currentSession);
              setJourney((currentJourneyState) => ({ ...currentJourneyState, currentStep: "focus" }));
              return 0;
            }
            const nextRound = activeSession.currentRound + 1;
            if (nextRound <= activeSession.rounds) {
              setSession((currentSession) => currentSession ? { ...currentSession, currentRound: nextRound, status: "running", breakMode: undefined } : currentSession);
              setJourney((currentJourneyState) => ({ ...currentJourneyState, currentStep: "focus" }));
              setRemainingMs(activeSession.durationMinutes * 60_000);
              return 0;
            }

            setJourney((currentJourneyState) => ({ ...currentJourneyState, currentStep: "review" }));
            setSession((currentSession) => currentSession ? { ...currentSession, status: "completed" } : currentSession);
            return 0;
          }
          return current - 1000;
        });
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [isLocked]);

  if (loading && !todaySnapshot) {
    return <div className="grid min-h-screen place-items-center bg-[#102747] text-sm font-bold text-white">Preparing the Lighthouse...</div>;
  }

  const openStep = (step: FocusStep) => setJourney((current) => ({
    ...current,
    currentStep: step,
    setupStep: step === "setup" ? current.setupStep ?? "task" : current.setupStep,
  }));

  const openSetupStep = (step: FocusSetupStep) => {
    setJourney((current) => ({
      ...current,
      currentStep: "setup",
      setupStep: step,
    }));
  };

  const chooseTask = (task: { id: string; title: string; source: FocusSession["taskSource"]; detail: string }) => {
    setJourney((current) => ({
      ...current,
      selectedTaskId: task.id,
      selectedTaskTitle: task.title,
      selectedTaskSource: task.source,
    }));
  };

  const startFocusSession = () => {
    if (!selectedTaskTitle.trim() || exceedsDailyLimit || needsParentApproval) return;
    const nextSession: FocusSession = {
      id: createId(),
      taskTitle: selectedTaskTitle.trim(),
      taskSource: selectedTaskSource,
      durationMinutes: selectedDurationMinutes,
      breakMinutes: selectedBreakMinutes,
      rounds: selectedRounds,
      currentRound: 1,
      manualBreaksUsed: 0,
      status: "running",
      startedAt: getCurrentIso(),
      completed: false,
      atmosphereId: selectedAtmosphere.id,
    };

    setSession(nextSession);
    setRemainingMs(selectedDurationMinutes * 60_000);
    setBreakRemainingMs(selectedBreakMinutes * 60_000);
    setReviewFinish("yes");
    setReviewFeeling("okay");
    setJourney((current) => ({ ...current, currentStep: "focus", setupStep: "confirm" }));
  };

  const saveAndExit = async (completed: boolean) => {
    const nextSession = sessionRef.current;
    if (!nextSession) return;

    const entry: FocusHistoryEntry = {
      id: createId(),
      sessionId: nextSession.id,
      childId: String(todaySnapshot?.user.id ?? ""),
      taskTitle: nextSession.taskTitle,
      taskSource: nextSession.taskSource,
      durationMinutes: nextSession.durationMinutes,
      breakMinutes: nextSession.breakMinutes,
      rounds: nextSession.rounds,
      completed,
      difficultyFeedback: reviewFeeling,
      atmosphereId: nextSession.atmosphereId,
      startedAt: nextSession.startedAt,
      endedAt: getCurrentIso(),
      interrupted: !completed,
      createdAt: getCurrentIso(),
    };

    const nextHistory = [entry, ...historyEntries].slice(0, 30);
    writeLighthouseJson(LIGHTHOUSE_HISTORY_KEY, nextHistory);
    setHistoryEntries(nextHistory);
    removeLighthouseJson(LIGHTHOUSE_DRAFT_KEY);
    setDraftExists(false);
    setSession((current) => current ? { ...current, endedAt: entry.createdAt, completed } : current);
    setJourney((current) => ({ ...current, currentStep: "exit" }));
    setExitMessage(completed ? "Focus saved. You can come back anytime." : "Focus stopped and saved. Come back when you are ready.");
    await Promise.all([refreshToday().catch(() => undefined), refreshVillage().catch(() => undefined)]);
  };

  const leaveToIsland = async () => {
    removeLighthouseJson(LIGHTHOUSE_DRAFT_KEY);
    setDraftExists(false);
    navigate("/", { replace: true });
  };

  const finishEarly = async () => {
    await saveAndExit(false);
  };

  const startManualBreak = () => {
    const currentSession = sessionRef.current;
    if (!currentSession || !manualBreakAvailable) return;
    const manualBreakMinutes = currentSession.breakMinutes > 0
      ? currentSession.breakMinutes
      : (rules.allowedBreakDurations.find((value) => value > 0) ?? 5);
    setSession((current) => current ? {
      ...current,
      status: "break",
      breakMode: "manual",
      manualBreaksUsed: (current.manualBreaksUsed ?? 0) + 1,
    } : current);
    setBreakRemainingMs(manualBreakMinutes * 60_000);
    setJourney((current) => ({ ...current, currentStep: "break" }));
  };

  const continueAfterBreak = () => {
    const currentSession = sessionRef.current;
    if (currentSession?.breakMode === "manual") {
      setJourney((current) => ({ ...current, currentStep: "focus" }));
      setSession((current) => current ? { ...current, status: "running", breakMode: undefined } : current);
      setBreakRemainingMs(0);
      return;
    }
    setJourney((current) => ({ ...current, currentStep: "focus" }));
    setRemainingMs((currentSession?.durationMinutes ?? selectedDurationMinutes) * 60_000);
    setSession((current) => current ? { ...current, status: "running", breakMode: undefined } : current);
    setBreakRemainingMs(0);
  };

  const submitReview = async () => {
    await saveAndExit(reviewFinish === "yes");
  };

  const selectedAtmosphereStyle = {
    background: selectedAtmosphere.background,
  };

  return (
    <div className="fixed inset-0 overflow-hidden text-white" style={selectedAtmosphereStyle}>
      <FocusAtmosphereLayers atmosphere={selectedAtmosphere} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.35),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,.2),transparent_22%),linear-gradient(180deg,rgba(9,26,49,.22),rgba(9,26,49,.48))]" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <main className="relative z-10 flex h-full flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-[22px] border border-white/15 bg-white/12 shadow-[0_10px_24px_rgba(0,0,0,.16)] backdrop-blur-md">
              <Compass className="size-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Lighthouse</p>
              <h1 className="text-[1.15rem] font-black sm:text-[1.4rem]">Focus ritual</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SavePill text={stepLabel(journey.currentStep)} />
            <SavePill text={selectedAtmosphere.name} />
            {draftExists && journey.currentStep === "enter" ? <SavePill text="Draft ready" /> : null}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
          {journey.currentStep === "enter" ? (
            <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-2xl place-items-center">
              <div className="w-full rounded-[30px] border border-white/15 bg-white/12 p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)] backdrop-blur-md sm:p-7">
                <p className="eyebrow text-white/70">Enter the focus space</p>
                <h2 className="mt-2 text-[2rem] font-black sm:text-[2.5rem]">The Lighthouse is ready.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/82">Choose one thing, shape a calm ritual around it, then let the rest fall quiet.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="button-primary" onClick={() => openSetupStep("task")}>
                    <Play className="size-4" /> Start focus
                  </button>
                  <button
                    className="button-secondary"
                    disabled={!draftExists}
                    onClick={() => {
                      const draft = normalizeStoredDraft(readLighthouseJson<FocusDraft | null>(LIGHTHOUSE_DRAFT_KEY, null));
                      if (!draft) return;
                      setJourney(draft.journey);
                      setSession(draft.session);
                      setRemainingMs(draft.remainingMs);
                      setBreakRemainingMs(draft.breakRemainingMs);
                      setCustomTaskTitle(draft.customTaskTitle);
                      setReviewFinish(draft.reviewFinish);
                      setReviewFeeling(draft.reviewFeeling);
                      setDraftExists(true);
                      setNavigationNotice("Last session restored.");
                    }}
                  >
                    <RotateCcw className="size-4" /> Continue last session
                  </button>
                  <button className="button-secondary" onClick={leaveToIsland}>
                    <ArrowLeft className="size-4" /> Back to island
                  </button>
                </div>
                {navigationNotice ? <p className="mt-4 text-sm font-bold text-white/80">{navigationNotice}</p> : null}
              </div>
            </div>
          ) : null}

          {journey.currentStep === "setup" ? (
            <FocusSetup
              rules={rules}
              setupStep={journey.setupStep ?? "task"}
              suggestions={suggestions}
              selectedTaskId={journey.selectedTaskId}
              selectedTaskTitle={selectedTaskTitle}
              selectedTaskDetail={selectedTaskDetail}
              customTaskTitle={customTaskTitle}
              onCustomTaskChange={setCustomTaskTitle}
              onSelectTask={chooseTask}
              selectedDurationMinutes={selectedDurationMinutes}
              onSelectDuration={(minutes) => setJourney((current) => ({ ...current, selectedDurationMinutes: minutes }))}
              customDurationHours={customDurationHours}
              customDurationMinutes={customDurationMinutes}
              onCustomDurationHoursChange={setCustomDurationHours}
              onCustomDurationMinutesChange={setCustomDurationMinutes}
              onApplyCustomDuration={() =>
                setJourney((current) => ({
                  ...current,
                  selectedDurationMinutes: Math.max(minAllowedDuration, Math.min(maxAllowedDuration, Math.max(1, customDurationTotal))),
                }))
              }
              customDurationTotal={customDurationTotal}
              remainingDailyMinutes={remainingDailyMinutes}
              exceedsDailyLimit={exceedsDailyLimit}
              needsParentApproval={needsParentApproval}
              breakOptions={breakOptions}
              selectedBreakMinutes={selectedBreakMinutes}
              selectedRounds={selectedRounds}
              onSelectBreakOption={(breakMinutes, rounds) => setJourney((current) => ({ ...current, selectedBreakMinutes: breakMinutes, selectedRounds: rounds }))}
              availableAtmospheres={availableAtmospheres}
              selectedAtmosphere={selectedAtmosphere}
              onSelectAtmosphere={(atmosphereId) => setJourney((current) => ({ ...current, selectedAtmosphereId: atmosphereId }))}
              onBackToEnter={() => openStep("enter")}
              onSetupStepChange={openSetupStep}
              onStartFocus={startFocusSession}
            />
          ) : null}

          {journey.currentStep === "focus" && session ? (
            <FocusSessionView
              session={session}
              atmosphere={selectedAtmosphere}
              focusProgress={focusProgress}
              focusEtaPrimary={focusEta.primary}
              focusEtaSecondary={focusEta.secondary}
              manualBreakAvailable={manualBreakAvailable}
              manualBreakLabel={manualBreakLabel}
              canPause={rules.canPause}
              canFinishEarly={rules.canFinishEarly}
              canCancel={rules.canCancel}
              ambientSoundEnabled={ambientSoundEnabled}
              onToggleSound={() => setAmbientSoundEnabled((current) => !current)}
              onManualBreak={startManualBreak}
              onDone={() => openStep("review")}
              onStop={() => void finishEarly()}
            />
          ) : null}

          {journey.currentStep === "break" ? (
            <FocusBreakView
              breakRemainingLabel={formatTime(breakRemainingMs)}
              isManualBreak={session?.breakMode === "manual"}
              ambientSoundEnabled={ambientSoundEnabled}
              onToggleSound={() => setAmbientSoundEnabled((current) => !current)}
              onContinue={continueAfterBreak}
              onFinish={() => void finishEarly()}
              canCancel={rules.canCancel}
            />
          ) : null}

          {journey.currentStep === "review" ? (
            <FocusReviewView
              reviewFinish={reviewFinish}
              reviewFeeling={reviewFeeling}
              onReviewFinishChange={setReviewFinish}
              onReviewFeelingChange={setReviewFeeling}
              onBack={() => openStep("focus")}
              onSave={() => void submitReview()}
            />
          ) : null}

          {journey.currentStep === "exit" ? (
            <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-2xl place-items-center">
              <div className="w-full rounded-[32px] border border-white/15 bg-white/10 p-5 text-center shadow-[0_22px_72px_rgba(0,0,0,.22)] backdrop-blur-md">
                <div className="mx-auto grid size-14 place-items-center rounded-full border border-white/15 bg-white/12">
                  <Flame className="size-7 text-white" />
                </div>
                <h2 className="mt-4 text-[2rem] font-black sm:text-[2.35rem]">{exitMessage}</h2>
                <p className="mt-3 text-sm leading-6 text-white/80">You chose one thing, stayed with it, and came back with a clear stop.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button className="button-primary" onClick={() => void leaveToIsland()}>
                    <ArrowLeft className="size-4" /> Back to island
                  </button>
                  <button className="button-secondary" onClick={() => openStep("enter")}>
                    <RotateCcw className="size-4" /> Start another focus
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {leaveGuardOpen ? (
        <div className="absolute inset-0 z-[90] grid place-items-center bg-[#102747]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border-2 border-white/15 bg-[#12294c] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,.28)]">
            <p className="eyebrow text-white/70">Focus mode is active</p>
            <h2 className="mt-2 text-2xl font-black">Stay with one thing</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">The Lighthouse is keeping you inside the focus path for now.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="button-secondary" onClick={() => setLeaveGuardOpen(false)}>Keep focusing</button>
              {manualBreakAvailable ? (
                <button
                  className="button-secondary"
                  onClick={() => {
                    startManualBreak();
                    setLeaveGuardOpen(false);
                  }}
                >
                  <Play className="size-4" /> Take a break now
                </button>
              ) : null}
              {rules.canCancel ? (
                <button
                  className="button-primary"
                  onClick={async () => {
                    setLeaveGuardOpen(false);
                    await finishEarly();
                    await leaveToIsland();
                  }}
                >
                  Stop and leave
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
