import { CheckCircle2, Sun } from "lucide-react";

export function TodayFocusCard({ items, onClick }: { items: string[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="island-card w-full text-left">
      <div className="flex items-center gap-3 text-text-secondary"><span className="grid size-11 place-items-center rounded-2xl bg-cream-secondary text-white"><Sun className="size-6" /></span><span><span className="island-eyebrow">Today's focus</span><strong className="block text-base">Daily quests</strong></span></div>
      <div className="mt-4 rounded-2xl bg-cream-secondary p-3 text-xs font-bold text-text-secondary">
        {items.length === 0 ? <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-text-secondary" />Your day is clear</span> : items.slice(0, 3).map((item) => <span className="mt-1 flex items-center gap-2 first:mt-0" key={item}><span className="size-4 shrink-0 rounded-md border-2 border-border bg-cream" /><span className="truncate">{item}</span></span>)}
      </div>
    </button>
  );
}
