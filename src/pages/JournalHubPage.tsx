import { CalendarRange, Flag, NotebookPen } from "lucide-react";
import { HubGrid } from "../components/HubGrid";
import { PageHeader } from "../components/PageHeader";

export function JournalHubPage() {
  return <div className="cozy-page"><PageHeader eyebrow="Pause and choose" title="Journal" description="Review what happened and decide what matters next." /><HubGrid items={[
    { title: "Weekly review", description: "Reflect on wins, blockers and next week.", path: "/reviews/weekly", icon: NotebookPen },
    { title: "Monthly review", description: "See your bigger patterns and progression.", path: "/reviews/monthly", icon: CalendarRange },
    { title: "Weekly focus", description: "Protect one main priority and two secondary ones.", path: "/focus", icon: Flag },
  ]} /></div>;
}
