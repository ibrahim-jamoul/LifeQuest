import { HeartPulse } from "lucide-react";
import { FloatingProgressCard } from "./FloatingProgressCard";

export function LifeBalanceCard({ value, areaCount, onClick }: { value: number; areaCount: number; onClick: () => void }) {
  return <FloatingProgressCard eyebrow="Life balance" title={areaCount ? `${areaCount} life areas` : "Add life areas"} value={value} icon={HeartPulse} color="#79a9c2" onClick={onClick} />;
}
