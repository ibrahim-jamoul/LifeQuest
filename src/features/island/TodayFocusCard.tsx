import { CheckCircle2, Sun } from "lucide-react";

export function TodayFocusCard({ itemCount, onClick }: { itemCount: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="island-card w-full text-left">
      <div className="flex items-center gap-3 text-[#456052]"><span className="grid size-11 place-items-center rounded-2xl bg-[#f5c86b] text-white"><Sun className="size-6" /></span><span><span className="island-eyebrow">Today's focus</span><strong className="block text-base">Daily quests</strong></span></div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#f8f1df] p-3 text-xs font-bold text-[#6c7c70]"><CheckCircle2 className="size-4 text-[#7eaf77]" />{itemCount === 0 ? "Your day is clear" : `${itemCount} quests ready`}</div>
    </button>
  );
}
