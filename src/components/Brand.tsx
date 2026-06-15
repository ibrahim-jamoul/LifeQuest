import { Hexagon } from "lucide-react";

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-[#6faf5c] text-white shadow-[0_5px_0_#5d8c61]">
        <Hexagon className="size-5" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div>
          <p className={`m-0 font-display text-lg font-bold tracking-wide ${inverse ? "text-[#fff6e5]" : "text-[#5a4632]"}`}>LifeQuest</p>
          <p className={`m-0 text-[10px] font-extrabold uppercase tracking-[.18em] ${inverse ? "text-[#fff6e5]/65" : "text-[#8d7a64]"}`}>Grow your village</p>
        </div>
      )}
    </div>
  );
}
