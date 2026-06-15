export function CozyLoader({ label = "Growing your village..." }: { label?: string }) {
  return <div className="flex items-center gap-3 rounded-cozy-md border-2 border-border bg-cream p-4 text-sm font-extrabold text-text-secondary"><span className="size-5 animate-spin rounded-full border-4 border-border border-t-[#f4a261]" />{label}</div>;
}
