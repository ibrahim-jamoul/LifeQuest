import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ variant = "primary", size = "md", loading = false, icon, children, className = "", disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg"; loading?: boolean; icon?: ReactNode }) {
  const style = variant === "primary" ? "button-primary" : variant === "danger" ? "button-secondary border-danger text-danger" : variant === "ghost" ? "inline-flex items-center gap-2 rounded-cozy-md px-3 py-2 font-bold text-text-secondary hover:bg-cream-secondary" : "button-secondary";
  const dimensions = size === "sm" ? "min-h-9 px-3 py-1.5 text-xs" : size === "lg" ? "min-h-12 px-6 py-3 text-base" : "";
  return <button className={`${style} ${dimensions} ${className}`} disabled={disabled || loading} {...props}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : icon}{loading ? "Loading..." : children}</button>;
}
