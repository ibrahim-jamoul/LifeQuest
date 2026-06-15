import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, meta, icon: Icon, accent = "text-mint" }: {
  label: string; value: string; meta: string; icon: LucideIcon; accent?: string;
}) {
  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between">
        <span className="eyebrow">{label}</span>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <p className="mb-1 mt-5 text-3xl font-black tracking-tight">{value}</p>
      <p className="m-0 text-xs font-semibold text-[#7a6a58]">{meta}</p>
    </article>
  );
}
