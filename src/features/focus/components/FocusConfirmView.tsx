import { ArrowLeft, Play } from "lucide-react";
import type { FocusAtmosphere } from "../types";
import { formatDurationLabel } from "../focusUtils";

export function FocusConfirmView({
  taskTitle,
  durationMinutes,
  breakMinutes,
  rounds,
  atmosphere,
  needsParentApproval,
  exceedsDailyLimit,
  onBack,
  onStart,
}: {
  taskTitle: string;
  durationMinutes: number;
  breakMinutes: number;
  rounds: number;
  atmosphere: FocusAtmosphere;
  needsParentApproval: boolean;
  exceedsDailyLimit: boolean;
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-[32px] border border-white/15 bg-white/12 p-5 shadow-[0_20px_60px_rgba(0,0,0,.18)] backdrop-blur-md">
        <p className="eyebrow text-white/70">Confirm</p>
        <h2 className="mt-2 text-3xl font-black">Everything looks calm.</h2>
        <p className="mt-3 text-sm leading-7 text-white/82">Take one last glance, then start. After this, Lighthouse keeps the rest quiet.</p>
      </div>

      <div className="rounded-[32px] border border-white/15 bg-white/12 p-5 shadow-[0_20px_60px_rgba(0,0,0,.18)] backdrop-blur-md">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Focus</p>
            <strong className="mt-2 block text-xl">{taskTitle}</strong>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Time</p>
            <strong className="mt-2 block text-xl">{formatDurationLabel(durationMinutes)}</strong>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Break</p>
            <strong className="mt-2 block text-xl">{rounds > 1 ? `${rounds} rounds / ${breakMinutes} min break` : breakMinutes > 0 ? `${breakMinutes} min break` : "No break"}</strong>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Atmosphere</p>
            <strong className="mt-2 block text-xl">{atmosphere.name}</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="button-secondary" onClick={onBack}>
          <ArrowLeft className="size-4" /> Change setup
        </button>
        <button className="button-primary" disabled={needsParentApproval || exceedsDailyLimit} onClick={onStart}>
          <Play className="size-4" /> Start focus
        </button>
      </div>
      {needsParentApproval ? <p className="text-sm font-bold text-white/80">This duration is above the current parent approval limit.</p> : null}
      {exceedsDailyLimit ? <p className="text-sm font-bold text-white/80">This session would exceed today&apos;s Lighthouse time limit.</p> : null}
    </div>
  );
}
