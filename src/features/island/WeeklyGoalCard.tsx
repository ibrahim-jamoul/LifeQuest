import { Star } from "lucide-react";
import { ProgressResourceBar } from "./ProgressResourceBar";

export function WeeklyGoalCard({ progress, title, onClick }: { progress: number; title: string | null; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-cozy-lg border-4 border-border bg-cream-secondary/95 p-4 text-left text-text-secondary shadow-cozy-lg transition hover:-translate-y-1">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-cream-secondary text-text-secondary"><Star className="size-5" fill="currentColor" /></span><span className="min-w-0"><span className="block text-[10px] font-extrabold uppercase tracking-[.16em] text-text-secondary/60">Weekly goal</span><strong className="block truncate text-sm">{title ?? "Choose a main priority"}</strong></span><strong className="ml-auto">{Math.round(progress * 100)}%</strong></div>
      <div className="mt-3"><ProgressResourceBar value={progress} color="#8FBF68" /></div>
    </button>
  );
}
