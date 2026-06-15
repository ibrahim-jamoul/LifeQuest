import { Check } from "lucide-react";

export function CozyCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange?: () => void }) {
  return <button aria-label={label} aria-pressed={checked} type="button" onClick={onChange} className={`grid size-7 place-items-center rounded-xl border-2 transition ${checked ? "border-primary bg-primary text-text-secondary" : "border-border bg-cream text-transparent hover:border-primary"}`}><Check className="size-4" strokeWidth={3} /></button>;
}
