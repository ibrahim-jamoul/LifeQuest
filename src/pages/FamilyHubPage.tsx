import { HeartHandshake, ShieldCheck } from "lucide-react";
import { HubGrid } from "../components/HubGrid";
import { PageHeader } from "../components/PageHeader";

export function FamilyHubPage() {
  return <div className="cozy-page"><PageHeader eyebrow="Grow together" title="Family" description="Share missions and open the parent space when needed." /><HubGrid items={[
    { title: "Family missions", description: "Complete missions created with your parent.", path: "/missions", icon: HeartHandshake },
    { title: "Parent access", description: "Securely switch to the Parent Lodge.", path: "/parent-access", icon: ShieldCheck },
  ]} /></div>;
}
