import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookMarked, Compass, Crosshair, Flame, Menu, RotateCcw, Settings, Sparkles, Zap, ZoomIn, ZoomOut } from "lucide-react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { islandZones } from "./data";
import { IslandActionPanel } from "./IslandActionPanel";
import { CodedIslandScene } from "./scene/CodedIslandScene";
import { LifeBalanceCard } from "./LifeBalanceCard";
import { ProgressResourceBar } from "./ProgressResourceBar";
import { TodayFocusCard } from "./TodayFocusCard";
import type { IslandPanel, IslandSummary, IslandZoneData, IslandZoneReviewStatus } from "./types";
import { VillageMenu } from "./VillageMenu";
import { WeeklyGoalCard } from "./WeeklyGoalCard";
import { useAppStore } from "../../store";
import { api, type VillageState } from "../../lib/api/client";
import { ChildAvatar } from "../../components/ChildAvatar";

function seasonForDate(date: Date): string {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return "Summer";
  if (month >= 2 && month <= 4) return "Autumn";
  if (month >= 5 && month <= 7) return "Winter";
  return "Spring";
}

const MAP_ASPECT_RATIO = 1672 / 941;
const ISLAND_STAGE_OVERSCAN = 1.06;
const MIN_CAMERA_ZOOM = 1;
const MAX_CAMERA_ZOOM = 1.6;
const CAMERA_ZOOM_STEP = 0.08;
const CAMERA_PAN_STEP = 90;
const VISUAL_REVIEW_COMPLETED_ZONE_IDS: string[] = [];

type CameraPan = { x: number; y: number };
type CameraPointer = { x: number; y: number };
type CameraGesture = {
  startX: number;
  startY: number;
  startPan: CameraPan;
  dragging: boolean;
  pinchStartDistance: number | null;
  pinchStartZoom: number;
};

function clampCameraZoom(value: number): number {
  return Math.min(MAX_CAMERA_ZOOM, Math.max(MIN_CAMERA_ZOOM, Number(value.toFixed(2))));
}

function getCameraPanBounds(zoom: number): CameraPan {
  if (typeof window === "undefined" || typeof document === "undefined") return { x: 0, y: 0 };

  const viewport = document.querySelector<HTMLElement>(".island-viewport");
  const viewportWidth = viewport?.clientWidth ?? window.innerWidth;
  const viewportHeight = viewport?.clientHeight ?? window.innerHeight;
  const stageWidth = Math.max(viewportWidth * ISLAND_STAGE_OVERSCAN, viewportHeight * MAP_ASPECT_RATIO * ISLAND_STAGE_OVERSCAN);
  const stageHeight = stageWidth / MAP_ASPECT_RATIO;

  return {
    x: Math.max(0, Math.floor((stageWidth * zoom - viewportWidth) / 2)),
    y: Math.max(0, Math.floor((stageHeight * zoom - viewportHeight) / 2)),
  };
}

function clampCameraPan(value: CameraPan, bounds: CameraPan): CameraPan {
  return {
    x: Math.min(bounds.x, Math.max(-bounds.x, Math.round(value.x))),
    y: Math.min(bounds.y, Math.max(-bounds.y, Math.round(value.y))),
  };
}

function getPointerDistance(pointers: CameraPointer[]): number {
  if (pointers.length < 2) return 0;

  return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
}

function isInteractiveSceneTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(".island-building, .zone-sign, a, button"));
}

export function IslandDashboard() {
  const [panel, setPanel] = useState<IslandPanel>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [cameraControlsOpen, setCameraControlsOpen] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraPan, setCameraPan] = useState<CameraPan>({ x: 0, y: 0 });
  const [cameraPanBounds, setCameraPanBounds] = useState<CameraPan>({ x: 0, y: 0 });
  const [cameraDragging, setCameraDragging] = useState(false);
  const cameraZoomRef = useRef(cameraZoom);
  const cameraPanRef = useRef(cameraPan);
  const cameraPanBoundsRef = useRef(cameraPanBounds);
  const cameraPointersRef = useRef<Map<number, CameraPointer>>(new Map());
  const cameraGestureRef = useRef<CameraGesture | null>(null);
  const suppressNextZoneClickRef = useRef(false);
  const cameraMenuRef = useRef<HTMLDivElement | null>(null);
  const bootstrap = useAppStore((state) => state.bootstrap);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const todaySnapshot = useAppStore((state) => state.todaySnapshot);
  const dashboardSummary = useAppStore((state) => state.dashboardSummary);
  const villageState = useAppStore((state) => state.villageState);
  const flashMessage = useAppStore((state) => state.flashMessage);
  const clearFlashMessage = useAppStore((state) => state.clearFlashMessage);

  useEffect(() => {
    void bootstrap();
    void api.preferences.get().then((value) => setShowOnboarding(!Boolean(value.onboarding_completed)));
  }, [bootstrap]);

  useEffect(() => {
    const syncCameraBounds = () => {
      const bounds = getCameraPanBounds(cameraZoomRef.current);
      const nextPan = clampCameraPan(cameraPanRef.current, bounds);

      setCameraPanBounds(bounds);
      setCameraPan(nextPan);
      cameraPanBoundsRef.current = bounds;
      cameraPanRef.current = nextPan;
    };

    syncCameraBounds();
    window.addEventListener("resize", syncCameraBounds);
    return () => window.removeEventListener("resize", syncCameraBounds);
  }, [cameraZoom]);

  useEffect(() => {
    if (!cameraControlsOpen) return;

    const closeCameraMenuOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (cameraMenuRef.current?.contains(target)) return;

      setCameraControlsOpen(false);
    };

    document.addEventListener("pointerdown", closeCameraMenuOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeCameraMenuOnOutsidePress);
  }, [cameraControlsOpen]);

  const openZone = (zone: IslandZoneData) => {
    if (suppressNextZoneClickRef.current) {
      suppressNextZoneClickRef.current = false;
      return;
    }

    setPanel({ kind: "zone", zone });
  };
  const now = new Date();
  const isNight = now.getHours() < 6 || now.getHours() >= 19;
  const totalXp = todaySnapshot?.progression.totalXp ?? dashboardSummary?.totalXp ?? 0;
  const streak = todaySnapshot?.progression.currentStreak ?? dashboardSummary?.currentStreak ?? 0;
  const focusItems = todaySnapshot?.focusPriorities.length
    ? todaySnapshot.focusPriorities.map((priority) => priority.goal_title ?? priority.project_title ?? "Weekly priority")
    : todaySnapshot?.todayQuests.map((quest) => quest.title) ?? [];
  const todayCount = focusItems.length;
  const activeMissions = todaySnapshot?.progression.activeParentMissions ?? 0;
  const journeyProgress = Math.min(1, totalXp / 2500);
  const mainFocus = todaySnapshot?.focusPriorities.find((priority) => priority.priority_type === "main");
  const weeklyProgress = Math.min(1, Number(mainFocus?.focus_progress ?? 0) / 100);
  const lifeBalance = todaySnapshot?.lifeBalance.length ? Math.round(todaySnapshot.lifeBalance.reduce((sum, area) => sum + area.score, 0) / todaySnapshot.lifeBalance.length) : 0;
  const setCameraPanSafely = (nextValue: CameraPan, bounds = cameraPanBoundsRef.current) => {
    const nextPan = clampCameraPan(nextValue, bounds);

    cameraPanRef.current = nextPan;
    setCameraPan(nextPan);
  };
  const updateCameraZoom = (nextValue: number) => {
    const nextZoom = clampCameraZoom(nextValue);
    const nextBounds = getCameraPanBounds(nextZoom);

    cameraZoomRef.current = nextZoom;
    cameraPanBoundsRef.current = nextBounds;
    setCameraZoom(nextZoom);
    setCameraPanBounds(nextBounds);
    setCameraPan((value) => {
      const nextPan = clampCameraPan(value, nextBounds);
      cameraPanRef.current = nextPan;
      return nextPan;
    });
  };
  const moveCamera = (delta: CameraPan) => {
    setCameraPanSafely({ x: cameraPanRef.current.x + delta.x, y: cameraPanRef.current.y + delta.y });
  };
  const resetCamera = () => {
    const bounds = getCameraPanBounds(1);

    cameraZoomRef.current = 1;
    cameraPanRef.current = { x: 0, y: 0 };
    cameraPanBoundsRef.current = bounds;
    setCameraZoom(1);
    setCameraPan({ x: 0, y: 0 });
    setCameraPanBounds(bounds);
  };
  const resetCameraPan = () => setCameraPanSafely({ x: 0, y: 0 });
  const zoomIn = () => updateCameraZoom(cameraZoom + CAMERA_ZOOM_STEP);
  const zoomOut = () => updateCameraZoom(cameraZoom - CAMERA_ZOOM_STEP);
  const panUp = () => moveCamera({ x: 0, y: CAMERA_PAN_STEP });
  const panDown = () => moveCamera({ x: 0, y: -CAMERA_PAN_STEP });
  const panLeft = () => moveCamera({ x: CAMERA_PAN_STEP, y: 0 });
  const panRight = () => moveCamera({ x: -CAMERA_PAN_STEP, y: 0 });
  const centerView = resetCameraPan;
  const cameraActionStyle = (): CSSProperties => ({
    opacity: cameraControlsOpen ? 1 : 0,
    pointerEvents: cameraControlsOpen ? "auto" : "none",
    transform: cameraControlsOpen ? "translate(0, 0) scale(1)" : "translate(var(--camera-start-x), var(--camera-start-y)) scale(.62)",
  });
  const handleCameraWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    updateCameraZoom(cameraZoomRef.current + (event.deltaY < 0 ? CAMERA_ZOOM_STEP : -CAMERA_ZOOM_STEP));
  };
  const handleCameraPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isInteractiveSceneTarget(event.target)) return;

    cameraPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);

    const pointers = Array.from(cameraPointersRef.current.values());
    if (pointers.length === 1) {
      cameraGestureRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startPan: cameraPanRef.current,
        dragging: false,
        pinchStartDistance: null,
        pinchStartZoom: cameraZoomRef.current,
      };
      return;
    }

    if (pointers.length === 2) {
      cameraGestureRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startPan: cameraPanRef.current,
        dragging: true,
        pinchStartDistance: getPointerDistance(pointers),
        pinchStartZoom: cameraZoomRef.current,
      };
      suppressNextZoneClickRef.current = true;
      setCameraDragging(true);
    }
  };
  const handleCameraPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cameraPointersRef.current.has(event.pointerId)) return;

    cameraPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = cameraGestureRef.current;
    if (!gesture) return;

    const pointers = Array.from(cameraPointersRef.current.values());
    if (pointers.length >= 2 && gesture.pinchStartDistance) {
      event.preventDefault();
      suppressNextZoneClickRef.current = true;
      setCameraDragging(true);
      updateCameraZoom(gesture.pinchStartZoom * (getPointerDistance(pointers) / gesture.pinchStartDistance));
      return;
    }

    if (pointers.length === 1) {
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const movedEnough = Math.abs(deltaX) + Math.abs(deltaY) > 4;

      if (movedEnough) {
        event.preventDefault();
        gesture.dragging = true;
        suppressNextZoneClickRef.current = true;
        setCameraDragging(true);
      }

      if (gesture.dragging) {
        setCameraPanSafely({ x: gesture.startPan.x + deltaX, y: gesture.startPan.y + deltaY });
      }
    }
  };
  const finishCameraPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (cameraGestureRef.current?.dragging) {
      suppressNextZoneClickRef.current = true;
      window.setTimeout(() => {
        suppressNextZoneClickRef.current = false;
      }, 0);
    }

    cameraPointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const pointers = Array.from(cameraPointersRef.current.values());
    if (pointers.length === 1) {
      cameraGestureRef.current = {
        startX: pointers[0].x,
        startY: pointers[0].y,
        startPan: cameraPanRef.current,
        dragging: false,
        pinchStartDistance: null,
        pinchStartZoom: cameraZoomRef.current,
      };
      setCameraDragging(false);
      return;
    }

    cameraGestureRef.current = null;
    setCameraDragging(false);
  };

  const zones = islandZones.map((zone, index) => {
    if (!villageState) return zone;
    const key = zone.id === "home" ? "home_area" : zone.id === "town-hall" ? "town_hall" : zone.id as keyof VillageState["zones"];
    const live = villageState.zones[key];
    const progress = Math.round(live.progress * 100);
    const state: "quiet" | "growing" | "thriving" = progress >= 65 ? "thriving" : progress >= 35 ? "growing" : "quiet";
    return { ...zone, progress, level: live.level, state, unlocked: index < 4 || villageState.villageLevel >= 2 };
  });
  const currentReviewZoneId = islandZones.find((zone) => !VISUAL_REVIEW_COMPLETED_ZONE_IDS.includes(zone.id))?.id;
  const reviewZones: IslandZoneData[] = zones.map((zone) => {
    const reviewStatus: IslandZoneReviewStatus = VISUAL_REVIEW_COMPLETED_ZONE_IDS.includes(zone.id)
      ? "completed"
      : zone.id === currentReviewZoneId
        ? "current"
        : "pending";

    return { ...zone, reviewStatus };
  });

  const summary: IslandSummary = {
    currentDay: now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    season: seasonForDate(now),
    journeyProgress,
    totalXp,
    level: dashboardSummary?.level ?? todaySnapshot?.profile.village_level ?? 1,
    levelTitle: dashboardSummary?.levelTitle ?? "Starter",
    streak,
    todayFocusItems: todayCount,
    weeklyProgress,
    lifeBalance,
    zones: reviewZones,
  };

  return (
    <div className={`island-page relative h-[100svh] min-h-[680px] overflow-hidden text-island-ink ${isNight ? "island-night" : ""}`}>
      <CodedIslandScene
        zones={summary.zones}
        season={summary.season}
        avatar={todaySnapshot?.profile}
        activeZoneId={panel?.kind === "zone" ? panel.zone.id : undefined}
        cameraZoom={cameraZoom}
        cameraPan={cameraPan}
        isCameraDragging={cameraDragging}
        onCameraPointerDown={handleCameraPointerDown}
        onCameraPointerMove={handleCameraPointerMove}
        onCameraPointerUp={finishCameraPointer}
        onCameraPointerCancel={finishCameraPointer}
        onCameraWheel={handleCameraWheel}
        onZoneClick={openZone}
      />
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-b from-[#143d3c]/25 via-transparent to-[#143d3c]/25" />
      {flashMessage ? (
        <div className="pointer-events-none absolute right-4 top-24 z-50 rounded-2xl border border-white/70 bg-cream-secondary/95 px-4 py-3 text-sm font-semibold text-text-secondary shadow-cozy-lg">
          {flashMessage}
          <button className="pointer-events-auto ml-3 text-xs font-black uppercase tracking-wide text-text-secondary" onClick={clearFlashMessage}>Dismiss</button>
        </div>
      ) : null}

      <div ref={cameraMenuRef} className={`island-camera-menu ${cameraControlsOpen ? "is-open" : ""}`}>
        <div id="island-camera-controls" className="island-camera-grid" role={cameraControlsOpen ? "dialog" : undefined} aria-label="Camera view controls">
          <button aria-label="Zoom in" title="Zoom in" className={`island-camera-button camera-cell-tl ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={zoomIn} disabled={cameraZoom >= MAX_CAMERA_ZOOM} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><ZoomIn className="size-5" /></button>
          <button aria-label="Move view up" title="Move view up" className={`island-camera-button camera-cell-t ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={panUp} disabled={cameraPan.y >= cameraPanBounds.y} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><ArrowUp className="size-5" /></button>
          <button aria-label="Zoom out" title="Zoom out" className={`island-camera-button camera-cell-tr ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={zoomOut} disabled={cameraZoom <= MIN_CAMERA_ZOOM} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><ZoomOut className="size-5" /></button>
          <button aria-label="Move view left" title="Move view left" className={`island-camera-button camera-cell-l ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={panLeft} disabled={cameraPan.x >= cameraPanBounds.x} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><ArrowLeft className="size-5" /></button>
          <button aria-label="Move view right" title="Move view right" className={`island-camera-button camera-cell-r ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={panRight} disabled={cameraPan.x <= -cameraPanBounds.x} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><ArrowRight className="size-5" /></button>
          <button aria-label="Reset camera" title="Reset camera" className={`island-camera-button camera-cell-bl ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={resetCamera} disabled={cameraZoom === 1 && cameraPan.x === 0 && cameraPan.y === 0} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><RotateCcw className="size-5" /></button>
          <button aria-label="Move view down" title="Move view down" className={`island-camera-button camera-cell-b ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={panDown} disabled={cameraPan.y <= -cameraPanBounds.y} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><ArrowDown className="size-5" /></button>
          <button aria-label="Center view" title="Center view" className={`island-camera-button camera-cell-br island-camera-center ${cameraControlsOpen ? "is-visible" : ""}`} style={cameraActionStyle()} onClick={centerView} disabled={cameraPan.x === 0 && cameraPan.y === 0} tabIndex={cameraControlsOpen ? 0 : -1} aria-hidden={!cameraControlsOpen}><Crosshair className="size-5" /></button>
          <button
            aria-controls="island-camera-controls"
            aria-expanded={cameraControlsOpen}
            aria-label="Camera controls"
            title="Camera controls"
            className={`island-camera-trigger ${cameraControlsOpen ? "is-active" : ""}`}
            onClick={() => setCameraControlsOpen((value) => !value)}
          >
            <Compass className="size-6" />
          </button>
        </div>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-3 sm:p-5">
        <div className="pointer-events-auto rounded-cozy-lg border-2 border-border/90 bg-cream-light/95 px-4 py-3 shadow-cozy-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-2xl bg-island-green text-white"><Sparkles className="size-4" /></span>
            <div>
              <span className="island-eyebrow">LifeQuest Island</span>
              <h1 className="m-0 font-display text-base font-bold sm:text-lg">{todaySnapshot?.currentChapter ? `${todaySnapshot.currentChapter.title} · ${todaySnapshot.currentChapter.theme}` : "Chapter One · New beginnings"}</h1>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-text-secondary"><ChildAvatar size="sm" icon={todaySnapshot?.profile.avatar_icon} color={todaySnapshot?.profile.avatar_color} /><span>{todaySnapshot?.user.displayName ?? "Explorer"}</span></div>
          <div className="mt-2 flex items-center gap-3 text-[10px] font-bold text-text-secondary">
            <span>{summary.currentDay}</span><span>·</span><span>{summary.season}</span>
          </div>
          <div className="mt-2"><ProgressResourceBar value={summary.journeyProgress} color="#75a876" /></div>
          {loading ? <p className="mt-2 text-[11px] font-semibold text-text-secondary">Loading today's snapshot...</p> : null}
          {error ? <p className="mt-2 text-[11px] font-semibold text-red-600">{error}</p> : null}
        </div>

        <div className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex">
          <button onClick={() => setPanel({ kind: "progression" })} className="island-resource"><Zap className="size-4 text-text-secondary" /><span><small>XP</small><strong>{totalXp}</strong></span></button>
          <button onClick={() => setPanel({ kind: "progression" })} className="island-resource"><Sparkles className="size-4 text-text-secondary" /><span><small>Level</small><strong>{summary.level}</strong></span></button>
          <button onClick={() => setPanel({ kind: "progression" })} className="island-resource"><Flame className="size-4 text-text-secondary" /><span><small>Streak</small><strong>{streak}</strong></span></button>
        </div>
        <div className="pointer-events-auto ml-auto flex flex-wrap items-center justify-end gap-2">
          <button onClick={() => setPanel({ kind: "progression" })} className="island-resource lg:hidden"><Zap className="size-4 text-text-secondary" /><span><small>XP</small><strong>{totalXp}</strong></span></button>
          <Link to="/reviews/weekly" aria-label="Open journal" className="island-icon-button"><BookMarked className="size-5" /></Link>
          <Link to="/settings" aria-label="Open settings" className="island-icon-button hidden sm:grid"><Settings className="size-5" /></Link>
          <button aria-label="Open village menu" onClick={() => setMenuOpen(true)} className="island-icon-button"><Menu className="size-5" /></button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 p-3 sm:p-5">
        <div className="pointer-events-auto w-48 sm:w-56"><TodayFocusCard items={focusItems} onClick={() => setPanel({ kind: "today" })} /></div>
        <div className="pointer-events-auto hidden items-end gap-3 md:flex">
          <div className="w-52"><WeeklyGoalCard progress={weeklyProgress} title={mainFocus?.goal_title ?? mainFocus?.project_title ?? null} onClick={() => setPanel({ kind: "weekly" })} /></div>
          <Link to="/missions" className="w-44 rounded-cozy-lg border-2 border-parent/40 bg-parent/95 p-4 text-left text-cream shadow-cozy-lg transition hover:-translate-y-1"><span className="block text-[10px] font-extrabold uppercase tracking-[.16em] text-cream/70">Parent mission</span><strong className="mt-2 block text-sm">{activeMissions} active</strong></Link>
        </div>
        <div className="pointer-events-auto w-44 sm:w-52"><LifeBalanceCard value={lifeBalance} areaCount={todaySnapshot?.lifeBalance.length ?? 0} onClick={() => setPanel({ kind: "balance" })} /></div>
      </div>

      <IslandActionPanel panel={panel} summary={summary} onClose={() => setPanel(null)} />
      <VillageMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      {showOnboarding ? <div className="absolute inset-0 z-[70] grid place-items-center bg-island-deep/65 p-5"><section aria-modal="true" role="dialog" aria-labelledby="onboarding-title" className="panel max-w-lg p-6 text-center"><Sparkles className="mx-auto size-8 text-primary" /><p className="eyebrow mt-4">Welcome to your village</p><h2 id="onboarding-title" className="mt-2 text-2xl font-black text-text-primary">Your real actions grow this island</h2><p className="mt-3 text-sm leading-6 text-text-secondary">Complete quests, build habits, explore challenges, choose a weekly focus, and review your progress. New land unlocks as your village level grows.</p><button className="button-primary mt-5" onClick={async () => { await api.preferences.update({ onboardingCompleted: true, habitReminders: true, reviewReminders: true, pushReminders: false }); setShowOnboarding(false); }}>Start exploring</button></section></div> : null}
    </div>
  );
}
