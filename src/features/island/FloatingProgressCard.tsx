import type { LucideIcon } from "lucide-react";
import { ProgressResourceBar } from "./ProgressResourceBar";

export function FloatingProgressCard({ eyebrow, title, value, icon: Icon, color, onClick }: {
  eyebrow: string; title: string; value: number; icon: LucideIcon; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full rounded-cozy-lg border-2 border-white/70 bg-cream-secondary/95 p-4 text-left text-text-secondary shadow-cozy-lg transition hover:-translate-y-1">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl text-white" style={{ backgroundColor: color }}><Icon className="size-5" /></span><span><span className="block text-[10px] font-black uppercase tracking-[.16em] opacity-50">{eyebrow}</span><strong className="text-sm">{title}</strong></span><strong className="ml-auto text-lg">{value}%</strong></div>
      <div className="mt-3"><ProgressResourceBar value={value} color={color} /></div>
    </button>
  );
}
