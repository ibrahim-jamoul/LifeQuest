import { Compass, Leaf, Sparkles, Star } from "lucide-react";

const icons = { spark: Sparkles, leaf: Leaf, star: Star, compass: Compass } as const;

export function ChildAvatar({ icon = "spark", color = "#75a876", label = "Child avatar", size = "md" }: {
  icon?: keyof typeof icons;
  color?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = icons[icon] ?? Sparkles;
  const dimensions = size === "lg" ? "size-20" : size === "sm" ? "size-8" : "size-11";
  return <span aria-label={label} className={`inline-grid ${dimensions} shrink-0 place-items-center rounded-full border-2 border-white/80 text-white shadow-md`} style={{ backgroundColor: color }}><Icon className={size === "lg" ? "size-8" : "size-4"} /></span>;
}
