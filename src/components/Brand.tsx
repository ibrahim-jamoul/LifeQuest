import { Hexagon } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-[#6faf5c] text-white shadow-[0_5px_0_#5d8c61]">
        <Hexagon className="size-5" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div>
          <p className="m-0 text-sm font-black tracking-wide text-[#5a4632]">LIFEQUEST</p>
          <p className="m-0 text-[10px] font-black uppercase tracking-[.22em] text-[#8d7a64]">Personal operating system</p>
        </div>
      )}
    </div>
  );
}
