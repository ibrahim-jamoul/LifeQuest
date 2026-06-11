import type { IslandZoneData } from "../types";
import { IslandBuilding } from "./IslandBuilding";

export function IslandZoneMarker({ zone, active, onClick }: { zone: IslandZoneData; active: boolean; onClick: () => void }) {
  return (
    <g className={`island-building level-${Math.min(zone.level, 5)} ${active ? "is-active" : ""} ${zone.unlocked === false ? "is-locked" : ""}`} role="button" aria-label={zone.unlocked === false ? `${zone.name} locked` : `Open ${zone.name}, level ${zone.level}`} aria-disabled={zone.unlocked === false} tabIndex={0} onClick={() => { if (zone.unlocked !== false) onClick(); }} onKeyDown={(event) => { if (event.key === " ") event.preventDefault(); if (zone.unlocked !== false && (event.key === "Enter" || event.key === " ")) onClick(); }} transform={`translate(${zone.position.x} ${zone.position.y})`}>
      <circle className="zone-ring" r="82" fill="none" stroke={zone.color} strokeWidth="7" opacity={active ? .8 : 0} />
      <g className="building-body"><IslandBuilding type={zone.buildingType} color={zone.color} /></g>
      {zone.level >= 2 ? <g className="zone-reward"><circle cx="-58" cy="-55" r="7" fill="#fff1a8" /><circle cx="62" cy="-42" r="5" fill="#fff1a8" />{zone.level >= 3 ? <path d="M-76 15l8-22 8 22-8 8Z" fill="#ffe27a" /> : null}{zone.level >= 4 ? <path d="M55 30l8-18 8 18-8 7Z" fill="#f4a9c3" /> : null}{zone.level >= 5 ? <path d="M0-100l6 13 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2Z" fill="#fff1a8" /> : null}</g> : null}
    </g>
  );
}
