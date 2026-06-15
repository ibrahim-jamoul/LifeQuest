import { Star } from "lucide-react";
import { ProgressResourceBar } from "./ProgressResourceBar";

export function WeeklyGoalCard({ progress, title, onClick }: { progress: number; title: string | null; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-[22px] border-4 border-[#8b633e] bg-[#6b4f3a]/95 p-4 text-left text-[#fff6e5] shadow-[0_8px_24px_rgba(63,53,40,.2)] transition hover:-translate-y-1">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#f4a261] text-[#6b4f3a]"><Star className="size-5" fill="currentColor" /></span><span className="min-w-0"><span className="block text-[10px] font-extrabold uppercase tracking-[.16em] text-[#fff6e5]/60">Weekly goal</span><strong className="block truncate text-sm">{title ?? "Choose a main priority"}</strong></span><strong className="ml-auto">{Math.round(progress * 100)}%</strong></div>
      <div className="mt-3"><ProgressResourceBar value={progress} color="#8FBF68" /></div>
    </button>
  );
}
