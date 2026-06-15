import type { HTMLAttributes } from "react";

export function Card({ className = "", variant = "default", ...props }: HTMLAttributes<HTMLElement> & { variant?: "default" | "highlighted" | "muted" }) {
  const tone = variant === "highlighted" ? "border-primary" : variant === "muted" ? "bg-cream-secondary" : "bg-cream";
  return <section className={`rounded-cozy-lg border-2 border-border p-5 shadow-cozy-sm ${tone} ${className}`} {...props} />;
}
