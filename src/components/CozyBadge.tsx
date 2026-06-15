import type { ReactNode } from "react";

const tones = {
  important: "bg-[#f3e8ff] text-[#7c3aed]",
  medium: "bg-[#e0f2fe] text-[#0369a1]",
  habit: "bg-[#dcfce7] text-[#15803d]",
  review: "bg-[#fef3c7] text-[#d97706]",
  high: "bg-[#fee2e2] text-[#dc2626]",
  neutral: "bg-[#f5e9d0] text-[#7a6a58]",
};
export function CozyBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${tones[tone]}`}>{children}</span>;
}
