import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { ReviewFeeling, ReviewFinish } from "../types";

export function FocusReviewView({
  reviewFinish,
  reviewFeeling,
  onReviewFinishChange,
  onReviewFeelingChange,
  onBack,
  onSave,
}: {
  reviewFinish: ReviewFinish;
  reviewFeeling: ReviewFeeling;
  onReviewFinishChange: (value: ReviewFinish) => void;
  onReviewFeelingChange: (value: ReviewFeeling) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-[720px] place-items-center">
      <div className="w-full rounded-[28px] border border-white/15 bg-white/10 px-5 py-5 shadow-[0_22px_70px_rgba(0,0,0,.2)] backdrop-blur-md sm:px-6 sm:py-6">
        <p className="eyebrow text-white/70">Session review</p>
        <h2 className="mt-2 text-[1.85rem] font-black leading-tight sm:text-[2.1rem]">Quick review</h2>
        <p className="mt-2.5 max-w-lg text-sm leading-6 text-white/80">Just two questions. Keep it light.</p>

        <div className="mt-5 space-y-4">
          <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 sm:p-[1.125rem]">
            <p className="text-sm font-black text-white">Did you finish what you wanted to do?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Yes, finished", value: "yes" as const },
                { label: "Almost", value: "almost" as const },
                { label: "Not yet", value: "not_yet" as const },
              ].map((choice) => (
                <button
                  key={choice.value}
                  className={`min-h-[42px] rounded-full border-2 px-4 py-2 text-sm font-black transition ${reviewFinish === choice.value ? "border-white bg-white/20 text-white" : "border-white/15 bg-white/8 text-white/78"}`}
                  onClick={() => onReviewFinishChange(choice.value)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 sm:p-[1.125rem]">
            <p className="text-sm font-black text-white">How did it feel?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Easy", value: "easy" as const },
                { label: "Okay", value: "okay" as const },
                { label: "Hard", value: "hard" as const },
                { label: "Distracted", value: "distracted" as const },
              ].map((choice) => (
                <button
                  key={choice.value}
                  className={`min-h-[42px] rounded-full border-2 px-4 py-2 text-sm font-black transition ${reviewFeeling === choice.value ? "border-white bg-white/20 text-white" : "border-white/15 bg-white/8 text-white/78"}`}
                  onClick={() => onReviewFeelingChange(choice.value)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
          <button className="button-secondary min-w-[138px] justify-center" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </button>
          <button className="button-primary min-w-[172px] justify-center" onClick={onSave}>
            <CheckCircle2 className="size-4" /> Save and leave
          </button>
        </div>
      </div>
    </div>
  );
}
