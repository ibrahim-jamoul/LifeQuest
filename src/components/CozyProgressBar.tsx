export function CozyProgressBar({ value, label }: { value: number; label?: string }) {
  return <div>{label ? <div className="mb-1 flex justify-between text-xs font-extrabold text-text-secondary"><span>{label}</span><span>{Math.round(value)}%</span></div> : null}<div className="h-3 overflow-hidden rounded-full bg-cream-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}
