import type { LucideIcon } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function CozyEmptyState(props: { icon: LucideIcon; title: string; description: string; action?: string }) {
  return <EmptyState {...props} />;
}
