import type { ReactNode } from "react";

export function StatusBadge({ variant, children }: { variant: "important" | "medium" | "habit" | "review" | "high" | "parent"; children: ReactNode }) {
  const tone = variant === "habit" ? "bg-success-bg text-primary border-primary/30" : variant === "parent" ? "bg-parent/15 text-parent border-parent/30" : variant === "important" || variant === "high" ? "bg-danger-bg text-danger border-danger/30" : "bg-warning-bg text-text-secondary border-warning/30";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${tone}`}>{children}</span>;
}
