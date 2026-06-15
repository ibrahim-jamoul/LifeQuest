export function CozyLoader({ label = "Growing your village..." }: { label?: string }) {
  return <div className="flex items-center gap-3 rounded-[20px] border-2 border-[#e8d8b8] bg-[#fff6e5] p-4 text-sm font-extrabold text-[#7a6a58]"><span className="size-5 animate-spin rounded-full border-4 border-[#8fbf68] border-t-[#f4a261]" />{label}</div>;
}
