import { Play, X } from "lucide-react";
import { FocusSoundToggle } from "./FocusAtmosphereView";

export function FocusBreakView({
  breakRemainingLabel,
  isManualBreak,
  ambientSoundEnabled,
  onToggleSound,
  onContinue,
  onFinish,
  canCancel,
}: {
  breakRemainingLabel: string;
  isManualBreak: boolean;
  ambientSoundEnabled: boolean;
  onToggleSound: () => void;
  onContinue: () => void;
  onFinish: () => void;
  canCancel: boolean;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-[720px] place-items-center">
      <div className="w-full rounded-[28px] border border-white/15 bg-white/10 px-5 py-5 text-center shadow-[0_22px_70px_rgba(0,0,0,.2)] backdrop-blur-md sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <p className="eyebrow text-white/70">Break time</p>
          <FocusSoundToggle enabled={ambientSoundEnabled} onToggle={onToggleSound} />
        </div>
        <h2 className="mt-2 text-[1.8rem] font-black leading-tight sm:text-[2.15rem]">{isManualBreak ? "Take a calm pause" : "Take a calm break"}</h2>
        <div className="mt-5 text-[3.1rem] font-black tracking-tight sm:text-[4.1rem]">{breakRemainingLabel}</div>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/80">
          {isManualBreak ? "Stretch, sip water, and come back to the same task." : "Stand up, look away from the screen, breathe slowly, then return."}
        </p>
        <div className="mx-auto mt-4 max-w-lg rounded-[20px] border border-white/12 bg-white/[0.08] p-4 text-left text-sm text-white/78 sm:p-[1.125rem]">
          <p className="font-black text-white">Try one offline thing now:</p>
          <ul className="mt-2 space-y-1 leading-6">
            <li>- 5 deep breaths</li>
            <li>- shoulder stretch</li>
            <li>- sip of water</li>
          </ul>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <button className="button-primary min-w-[152px] justify-center" onClick={onContinue}>
            <Play className="size-4" /> Continue
          </button>
          {canCancel ? (
            <button className="button-secondary min-w-[152px] justify-center" onClick={onFinish}>
              <X className="size-4" /> Finish
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
