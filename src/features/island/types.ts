import type { LucideIcon } from "lucide-react";

export type IslandZoneState = "quiet" | "growing" | "thriving";
export type IslandBuildingType = "home" | "garden" | "workshop" | "learning" | "townHall" | "market" | "lighthouse" | "pathways";
export type IslandZoneReviewStatus = "completed" | "current" | "pending";

export interface IslandZoneData {
  id: string;
  name: string;
  category: string;
  progress: number;
  level: number;
  state: IslandZoneState;
  description: string;
  nextAction: string;
  linkedGoals: number;
  linkedTasks: number;
  xpEarned: number;
  route: string;
  position: { x: number; y: number };
  labelPosition: { x: number; y: number };
  buildingType: IslandBuildingType;
  color: string;
  icon: LucideIcon;
  unlocked?: boolean;
  reviewStatus?: IslandZoneReviewStatus;
}

export interface IslandSummary {
  currentDay: string;
  season: string;
  journeyProgress: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  streak: number;
  todayFocusItems: number;
  weeklyProgress: number;
  lifeBalance: number;
  zones: IslandZoneData[];
}

export type IslandPanel =
  | { kind: "zone"; zone: IslandZoneData }
  | { kind: "today" }
  | { kind: "weekly" }
  | { kind: "balance" }
  | { kind: "progression" }
  | null;
