import { Hexagon } from "lucide-react";

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-primary text-white shadow-cozy-lg">
        <Hexagon className="size-5" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div>
          <p className={`m-0 font-display text-lg font-bold tracking-wide ${inverse ? "text-text-secondary" : "text-text-primary"}`}>LifeQuest</p>
          <p className={`m-0 text-[10px] font-extrabold uppercase tracking-[.18em] ${inverse ? "text-text-secondary/65" : "text-text-muted"}`}>Grow your village</p>
        </div>
      )}
    </div>
  );
}
