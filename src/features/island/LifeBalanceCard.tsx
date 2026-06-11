import { HeartPulse } from "lucide-react";
import { FloatingProgressCard } from "./FloatingProgressCard";

export function LifeBalanceCard({ value, onClick }: { value: number; onClick: () => void }) {
  return <FloatingProgressCard eyebrow="Life balance" title="Island harmony" value={value} icon={HeartPulse} color="#79a9c2" onClick={onClick} />;
}
