import { Flag } from "lucide-react";
import { ProgressResourceBar } from "./ProgressResourceBar";

export function WeeklyGoalCard({ progress, onClick }: { progress: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="island-card w-full text-left">
      <div className="flex items-center gap-3 text-[#456052]"><span className="grid size-10 place-items-center rounded-2xl bg-[#df9470] text-white"><Flag className="size-5" /></span><span><span className="island-eyebrow">Weekly goal</span><strong className="block text-sm">Choose the main quest</strong></span><strong className="ml-auto">{Math.round(progress * 100)}%</strong></div>
      <div className="mt-3"><ProgressResourceBar value={progress} color="#df9470" /></div>
    </button>
  );
}
