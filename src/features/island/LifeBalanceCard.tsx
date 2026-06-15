import { HeartPulse } from "lucide-react";

export function LifeBalanceCard({ value, areaCount, onClick }: { value: number; areaCount: number; onClick: () => void }) {
  const radius = Math.max(12, 34 * value / 100);
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 3 * index - Math.PI / 2;
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
  }).join(" ");
  return <button onClick={onClick} className="island-card flex w-full items-center gap-3 text-left"><svg className="size-20 shrink-0" viewBox="0 0 100 100" aria-label={`Life balance ${value}%`}><polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="#F5E9D0" stroke="#E8D8B8" strokeWidth="3"/><polygon points={points} fill="#8FBF68" fillOpacity=".5" stroke="#6FAF5C" strokeWidth="3"/><circle cx="50" cy="50" r="4" fill="#F4A261"/></svg><span><span className="island-eyebrow">Life balance</span><strong className="mt-1 flex items-center gap-1 text-sm"><HeartPulse className="size-4 text-[#e98f67]"/>{value}% balanced</strong><small className="mt-1 block font-bold text-[#7a6a58]">{areaCount || "No"} life areas</small></span></button>;
}
