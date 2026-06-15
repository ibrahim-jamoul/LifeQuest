import type { ReactNode } from "react";

export function FormField({ label, htmlFor, hint, error, required, children }: { label: string; htmlFor?: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return <label className="block text-sm font-bold text-text-primary" htmlFor={htmlFor}>
    {label}{required ? <span className="ml-1 text-danger">*</span> : null}
    <span className="mt-2 block">{children}</span>
    {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-text-muted">{hint}</span> : null}
  </label>;
}
