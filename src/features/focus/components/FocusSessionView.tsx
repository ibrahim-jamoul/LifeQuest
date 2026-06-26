import { CheckCircle2, Play, X } from "lucide-react";
import { FocusAmbientStage, FocusSoundToggle, SavePill } from "./FocusAtmosphereView";
import type { FocusAtmosphere, FocusSession } from "../types";

export function FocusSessionView({
  session,
  atmosphere,
  focusProgress,
  focusEtaPrimary,
  focusEtaSecondary,
  manualBreakAvailable,
  manualBreakLabel,
  canPause,
  canFinishEarly,
  canCancel,
  ambientSoundEnabled,
  onToggleSound,
  onManualBreak,
  onDone,
  onStop,
}: {
  session: FocusSession;
  atmosphere: FocusAtmosphere;
  focusProgress: number;
  focusEtaPrimary: string;
  focusEtaSecondary: string;
  manualBreakAvailable: boolean;
  manualBreakLabel: string;
  canPause: boolean;
  canFinishEarly: boolean;
  canCancel: boolean;
  ambientSoundEnabled: boolean;
  onToggleSound: () => void;
  onManualBreak: () => void;
  onDone: () => void;
  onStop: () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-[1080px] place-items-center">
      <div className="w-full rounded-[32px] border border-white/15 bg-white/10 px-5 py-[1.125rem] shadow-[0_22px_72px_rgba(0,0,0,.22)] backdrop-blur-md sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-white/70">Active focus</p>
            <h2 className="mt-1.5 max-w-[16ch] text-[1.8rem] font-black leading-tight sm:text-[2.15rem]">{session.taskTitle}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FocusSoundToggle enabled={ambientSoundEnabled} onToggle={onToggleSound} />
            <SavePill text={`Round ${session.currentRound}/${session.rounds}`} />
            <SavePill text={atmosphere.name} />
            <SavePill text="In progress" />
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.24fr_.76fr]">
          <div className="rounded-[28px] border border-white/12 bg-white/10 p-4 sm:p-[1.125rem]">
            <div className="mx-auto flex max-w-2xl flex-col items-center">
              <FocusAmbientStage atmosphere={atmosphere} paused={session.status === "paused"} progress={focusProgress} />
              <div className="mt-4 grid w-full gap-3 lg:grid-cols-[1.1fr_.9fr]">
                <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 sm:p-[1.125rem]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Quiet progress</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div>
                      <strong className="block text-[1.7rem] text-white sm:text-[2rem]">{Math.round(focusProgress * 100)}%</strong>
                      <p className="mt-1 max-w-[26ch] text-sm leading-5 text-white/74">Stay with the task. The motion is only there to keep the space alive.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Remaining</p>
                      <strong className="mt-1.5 block text-[1.55rem] leading-tight text-white sm:text-[1.8rem]">{focusEtaPrimary}</strong>
                      <span className="mt-1 block text-xs text-white/62">{focusEtaSecondary}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 sm:p-[1.125rem]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Focus state</p>
                  <strong className="mt-2 block text-[1rem] text-white sm:text-[1.05rem]">{session.status === "paused" ? "Calm pause" : "Deep flow"}</strong>
                  <p className="mt-2 text-sm leading-5 text-white/74">{session.rounds > 1 ? `Round ${session.currentRound} of ${session.rounds}` : "Single round session"} with {atmosphere.name}.</p>
                </div>
              </div>
              <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                {canPause ? (
                  <button className="button-secondary min-w-[176px] justify-center" disabled={!manualBreakAvailable} onClick={onManualBreak}>
                    <Play className="size-4" /> {manualBreakLabel}
                  </button>
                ) : null}
                <button className="button-primary min-w-[156px] justify-center" disabled={!canFinishEarly} onClick={onDone}>
                  <CheckCircle2 className="size-4" /> I am done
                </button>
                {canCancel ? (
                  <button className="button-secondary min-w-[156px] justify-center" onClick={onStop}>
                    <X className="size-4" /> Stop session
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Current focus</p>
              <strong className="mt-2 block text-[1.45rem] leading-tight sm:text-[1.55rem]">{session.taskTitle}</strong>
              <p className="mt-2 text-sm leading-5 text-white/76">Just one step. No dashboard. No clutter. Only this.</p>
            </div>

            <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Focus cues</p>
              <ul className="mt-3 space-y-1.5 text-sm leading-5 text-white/80">
                <li>- Let the animation stay behind your attention.</li>
                <li>- Keep working on the same concrete thing.</li>
                <li>- Use a break only when you really need one.</li>
              </ul>
            </div>

            <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Session detail</p>
              <div className="mt-3 grid gap-1.5 text-sm leading-5 text-white/80">
                <div className="flex justify-between gap-3"><span>Duration</span><strong>{session.durationMinutes} min</strong></div>
                <div className="flex justify-between gap-3"><span>Break</span><strong>{session.breakMinutes > 0 ? `${session.breakMinutes} min` : "None"}</strong></div>
                <div className="flex justify-between gap-3"><span>Rounds</span><strong>{session.rounds}</strong></div>
                <div className="flex justify-between gap-3"><span>Atmosphere</span><strong>{atmosphere.name}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
