export function ProgressResourceBar({ value, color = "#6faa72" }: { value: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-black/10">
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}
