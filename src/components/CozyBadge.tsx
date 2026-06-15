import type { ReactNode } from "react";

const tones = {
  important: "bg-cream-secondary text-text-secondary",
  medium: "bg-cream-secondary text-text-secondary",
  habit: "bg-cream-secondary text-text-secondary",
  review: "bg-cream-secondary text-text-secondary",
  high: "bg-cream-secondary text-text-secondary",
  neutral: "bg-cream-secondary text-text-secondary",
};
export function CozyBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${tones[tone]}`}>{children}</span>;
}
