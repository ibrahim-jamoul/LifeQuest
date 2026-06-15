import { Check } from "lucide-react";

export function CozyCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange?: () => void }) {
  return <button aria-label={label} aria-pressed={checked} type="button" onClick={onChange} className={`grid size-7 place-items-center rounded-xl border-2 transition ${checked ? "border-[#6faf5c] bg-[#6faf5c] text-[#fff6e5]" : "border-[#d8d1c3] bg-[#fff6e5] text-transparent hover:border-[#6faf5c]"}`}><Check className="size-4" strokeWidth={3} /></button>;
}
