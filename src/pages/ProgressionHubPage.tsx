import { Award, ChartNoAxesCombined, FolderKanban, HeartPulse, Landmark, Target } from "lucide-react";
import { HubGrid } from "../components/HubGrid";
import { PageHeader } from "../components/PageHeader";

export function ProgressionHubPage() {
  return <div className="cozy-page"><PageHeader eyebrow="Your growth map" title="Progression" description="Choose where you want to see or shape your progress." /><HubGrid items={[
    { title: "Goals", description: "Define outcomes and milestones.", path: "/goals", icon: Target },
    { title: "Projects", description: "Build meaningful work step by step.", path: "/projects", icon: FolderKanban },
    { title: "Marketplace", description: "See the rewards you have unlocked.", path: "/achievements", icon: Award },
    { title: "Insights", description: "Understand your recent activity.", path: "/insights", icon: ChartNoAxesCombined },
    { title: "Life areas", description: "Keep your growth balanced.", path: "/life-areas", icon: HeartPulse },
    { title: "School campaign", description: "Follow your long-term learning adventure.", path: "/campaign", icon: Landmark },
  ]} /></div>;
}
