import {
  Award, BriefcaseBusiness, CalendarCheck, ChartNoAxesCombined, CheckSquare,
  CircleGauge, Compass, Flag, FolderKanban, HeartHandshake, HeartPulse, Landmark, NotebookPen, Settings, ShieldCheck, Target,
} from "lucide-react";
import type { UserRole } from "../lib/api/client";

export const navigation = [
  { label: "Dashboard", path: "/", icon: CircleGauge, roles: ["child"] },
  { label: "Goals", path: "/goals", icon: Target, roles: ["child"] },
  { label: "Tasks", path: "/quests", icon: CheckSquare, roles: ["child"] },
  { label: "Habits", path: "/habits", icon: CalendarCheck, roles: ["child"] },
  { label: "Projects", path: "/projects", icon: FolderKanban, roles: ["child"] },
  { label: "Discovery", path: "/discovery", icon: Compass, roles: ["child"] },
  { label: "Weekly focus", path: "/focus", icon: Flag, roles: ["child"] },
  { label: "Life areas", path: "/life-areas", icon: HeartPulse, roles: ["child"] },
  { label: "School campaign", path: "/campaign", icon: Landmark, roles: ["child"] },
  { label: "Insights", path: "/insights", icon: ChartNoAxesCombined, roles: ["child"] },
  { label: "Weekly review", path: "/reviews/weekly", icon: NotebookPen, roles: ["child"] },
  { label: "Monthly review", path: "/reviews/monthly", icon: ChartNoAxesCombined, roles: ["child"] },
  { label: "Achievements", path: "/achievements", icon: Award, roles: ["child"] },
  { label: "Parent missions", path: "/missions", icon: HeartHandshake, roles: ["child"] },
  { label: "Parent access", path: "/parent-access", icon: ShieldCheck, roles: ["child"] },
  { label: "Parent lodge", path: "/parent", icon: ShieldCheck, roles: ["parent"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["child"] },
] as const;

export function navigationForRole(role: UserRole | undefined) {
  if (!role) return [];
  return navigation.filter((item) => (item.roles as readonly UserRole[]).includes(role));
}

export const categories = [
  "Scolaire", "Lecture", "Sport", "Arts", "Decouverte", "Habitudes", "Projet personnel", "Famille",
] as const;

export const lifeAreas = [
  "Learning", "Creativity", "Health", "Family", "Confidence", "Discipline",
] as const;

export const projectIcon = BriefcaseBusiness;
export const focusIcon = Flag;
