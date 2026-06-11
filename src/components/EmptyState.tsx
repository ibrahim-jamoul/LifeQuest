import { Plus, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action = "Create first item",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl border-2 border-[#e0cfb0] bg-[#fff3da] text-[#6faf5c]">
        <Icon className="size-6" />
      </div>
      <h2 className="m-0 text-lg font-black text-[#5a4632]">{title}</h2>
      <p className="mb-6 mt-2 max-w-md text-sm leading-6 text-[#7a6652]">{description}</p>
      <button className="button-primary" onClick={() => document.querySelector<HTMLElement>("form input, form textarea, form select")?.focus()}><Plus className="size-4" />{action}</button>
    </div>
  );
}
