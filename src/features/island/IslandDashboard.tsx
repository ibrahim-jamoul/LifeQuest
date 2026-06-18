import { BookMarked, Flame, Menu, Settings, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { islandZones } from "./data";
import { IslandActionPanel } from "./IslandActionPanel";
import { CodedIslandScene } from "./scene/CodedIslandScene";
import { LifeBalanceCard } from "./LifeBalanceCard";
import { ProgressResourceBar } from "./ProgressResourceBar";
import { TodayFocusCard } from "./TodayFocusCard";
import type { IslandPanel, IslandSummary, IslandZoneData } from "./types";
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

export function IslandDashboard() {
  const [panel, setPanel] = useState<IslandPanel>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  const openZone = (zone: IslandZoneData) => setPanel({ kind: "zone", zone });
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

  const zones = islandZones.map((zone, index) => {
    if (!villageState) return zone;
    const key = zone.id === "home" ? "home_area" : zone.id === "town-hall" ? "town_hall" : zone.id as keyof VillageState["zones"];
    const live = villageState.zones[key];
    const progress = Math.round(live.progress * 100);
    const state: "quiet" | "growing" | "thriving" = progress >= 65 ? "thriving" : progress >= 35 ? "growing" : "quiet";
    return { ...zone, progress, level: live.level, state, unlocked: index < 4 || villageState.villageLevel >= 2 };
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
    zones,
  };

  return (
    <div className={`island-page relative h-[100svh] min-h-[680px] overflow-hidden text-island-ink ${isNight ? "island-night" : ""}`}>
      <CodedIslandScene zones={summary.zones} season={summary.season} avatar={todaySnapshot?.profile} activeZoneId={panel?.kind === "zone" ? panel.zone.id : undefined} onZoneClick={openZone} />
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-b from-[#143d3c]/25 via-transparent to-[#143d3c]/25" />
      {flashMessage ? (
        <div className="pointer-events-none absolute right-4 top-24 z-50 rounded-2xl border border-white/70 bg-cream-secondary/95 px-4 py-3 text-sm font-semibold text-text-secondary shadow-cozy-lg">
          {flashMessage}
          <button className="pointer-events-auto ml-3 text-xs font-black uppercase tracking-wide text-text-secondary" onClick={clearFlashMessage}>Dismiss</button>
        </div>
      ) : null}

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
