import { Plus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action = "Create first item",
  onAction,
  mascot,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  mascot?: ReactNode;
}) {
  return (
    <div className="panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
      {mascot}
      <div className="mb-5 grid size-14 place-items-center rounded-cozy-md border-2 border-border-strong bg-warning-soft text-success">
        <Icon className="size-6" />
      </div>
      <h2 className="m-0 text-lg font-black text-text-primary">{title}</h2>
      <p className="mb-6 mt-2 max-w-md text-sm leading-6 text-text-secondary">{description}</p>
      <button className="button-primary" onClick={onAction ?? (() => document.querySelector<HTMLElement>("form input, form textarea, form select")?.focus())}><Plus className="size-4" />{action}</button>
    </div>
  );
}
