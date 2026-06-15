import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions, meta }: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return <header className="page-hero flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="mt-1">{title}</h1>
      {description ? <p className="cozy-subtitle mt-2">{description}</p> : null}
      {meta ? <div className="mt-3 flex flex-wrap gap-2">{meta}</div> : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
  </header>;
}
