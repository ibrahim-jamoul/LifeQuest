import type { HTMLAttributes } from "react";

export function CozyCard({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`panel ${className}`} {...props} />;
}
