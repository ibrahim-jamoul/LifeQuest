import type { IslandZoneData } from "./types";
import { ProgressResourceBar } from "./ProgressResourceBar";

export function IslandZoneCard({ zone }: { zone: IslandZoneData }) {
  const Icon = zone.icon;
  return (
    <div className="rounded-3xl bg-cream-secondary p-4 text-text-secondary">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl text-white" style={{ backgroundColor: zone.color }}><Icon className="size-5" /></span>
        <div><p className="m-0 text-xs font-bold uppercase tracking-wider opacity-60">{zone.category}</p><h3 className="m-0 text-lg font-black">{zone.name}</h3></div>
      </div>
      <div className="mt-4"><ProgressResourceBar value={zone.progress} color={zone.color} /></div>
      <div className="mt-2 flex justify-between text-xs font-bold"><span>{zone.progress}% restored</span><span>Level {zone.level}</span></div>
    </div>
  );
}
