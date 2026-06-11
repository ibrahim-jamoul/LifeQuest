import { ArrowRight, CheckCircle2, Flag, HeartPulse, Sparkles, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import type { IslandPanel, IslandSummary } from "./types";
import { IslandZoneCard } from "./IslandZoneCard";

export function IslandActionPanel({ panel, summary, onClose }: { panel: IslandPanel; summary: IslandSummary; onClose: () => void }) {
  if (!panel) return null;
  const generic = {
    today: { icon: CheckCircle2, title: "Today's Focus", text: "Your daily quests will collect the most useful tasks for today.", route: "/tasks", action: "Open tasks" },
    weekly: { icon: Flag, title: "Weekly Goal", text: "Choose one main priority and use your weekly review to keep direction.", route: "/reviews/weekly", action: "Open weekly planning" },
    balance: { icon: HeartPulse, title: "Life Balance", text: "Compare progress across every island zone and find neglected areas.", route: "/life-areas", action: "Open life areas" },
    progression: { icon: Zap, title: `Level ${summary.level} · ${summary.levelTitle}`, text: `${summary.totalXp} XP earned. Complete meaningful actions to restore and upgrade the island.`, route: "/achievements", action: "Open progression" },
  } as const;
  const info = panel.kind === "zone" ? null : generic[panel.kind];
  const InfoIcon = info?.icon ?? Sparkles;

  return (
    <>
      <button aria-label="Close island panel" className="fixed inset-0 z-40 bg-[#34544a]/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-y-auto bg-[#fffaf0] p-5 text-[#405448] shadow-[-20px_0_60px_rgba(46,74,62,.22)] sm:p-7">
        <button aria-label="Close panel" onClick={onClose} className="ml-auto grid size-10 place-items-center rounded-2xl bg-[#f0e7d3] transition hover:rotate-6"><X className="size-5" /></button>
        {panel.kind === "zone" ? (
          <div className="mt-5 space-y-5">
            <IslandZoneCard zone={panel.zone} />
            <div><span className="island-eyebrow">About this place</span><p className="mt-2 text-sm leading-6 text-[#64766a]">{panel.zone.description}</p></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["Goals", panel.zone.linkedGoals], ["Tasks", panel.zone.linkedTasks], ["XP", panel.zone.xpEarned]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f8f1df] p-3"><strong className="block text-lg">{value}</strong><span className="text-[10px] font-black uppercase tracking-wider opacity-50">{label}</span></div>)}
            </div>
            <div className="rounded-3xl bg-[#dfeeda] p-4"><span className="island-eyebrow">Next recommended action</span><p className="mb-0 mt-2 text-sm font-bold">{panel.zone.nextAction}</p></div>
            <Link to={panel.zone.route} className="island-action">Visit workspace <ArrowRight className="size-4" /></Link>
          </div>
        ) : info ? (
          <div className="mt-8">
            <span className="grid size-14 place-items-center rounded-3xl bg-[#83b37d] text-white"><InfoIcon className="size-7" /></span>
            <h2 className="mb-2 mt-5 text-2xl font-black">{info.title}</h2><p className="text-sm leading-6 text-[#64766a]">{info.text}</p>
            <div className="my-6 rounded-3xl bg-[#f8f1df] p-5 text-center"><strong className="block text-3xl">{panel.kind === "progression" ? summary.totalXp : panel.kind === "today" ? summary.todayFocusItems : panel.kind === "weekly" ? `${Math.round(summary.weeklyProgress * 100)}%` : `${summary.lifeBalance}%`}</strong><span className="island-eyebrow">Current value</span></div>
            <Link to={info.route} className="island-action">{info.action}<ArrowRight className="size-4" /></Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
