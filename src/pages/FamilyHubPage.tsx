import { HeartHandshake, ShieldCheck } from "lucide-react";
import { HubGrid } from "../components/HubGrid";
import { PageHeader } from "../components/PageHeader";

export function FamilyHubPage() {
  return <div className="cozy-page"><PageHeader eyebrow="Grow together" title="Family" description="Shared missions, parent support, and small check-ins that help progress feel safe." /><HubGrid items={[
    { title: "Family missions", description: "Do one mission together and mark it when it is real.", path: "/missions", icon: HeartHandshake },
    { title: "Parent access", description: "Open the Parent Lodge when a parent needs to validate or help.", path: "/parent-access", icon: ShieldCheck },
  ]} /></div>;
}
