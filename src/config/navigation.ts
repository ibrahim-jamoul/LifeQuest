import { BriefcaseBusiness, CalendarCheck, ChartNoAxesCombined, Compass, Flag, HeartHandshake, Home, NotebookPen, Settings, ShieldCheck } from "lucide-react";
import type { UserRole } from "../lib/api/client";

export const navigation = [
  { label: "Village", path: "/", icon: Home, roles: ["child"] },
  { label: "Today", path: "/today", icon: CalendarCheck, roles: ["child"] },
  { label: "Progression", path: "/progression", icon: ChartNoAxesCombined, roles: ["child"] },
  { label: "Explorer", path: "/discovery", icon: Compass, roles: ["child"] },
  { label: "Journal", path: "/journal", icon: NotebookPen, roles: ["child"] },
  { label: "Family", path: "/family", icon: HeartHandshake, roles: ["child"] },
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
