import type { ButtonHTMLAttributes, ReactNode } from "react";

export function CozyButton({ children, variant = "primary", loading = false, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary"; loading?: boolean }) {
  return <button className={`${variant === "primary" ? "button-primary" : "button-secondary"} ${className}`} disabled={loading || props.disabled} {...props}>{loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : children}</button>;
}
