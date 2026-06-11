import type { IslandZoneData } from "../types";

export function IslandZoneLabel({ zone, onClick }: { zone: IslandZoneData; onClick: () => void }) {
  return (
    <g className={`zone-sign ${zone.unlocked === false ? "is-locked" : ""}`} role="button" aria-label={zone.unlocked === false ? `${zone.name} locked until village level 2` : `Open ${zone.name} details`} aria-disabled={zone.unlocked === false} tabIndex={0} onClick={() => { if (zone.unlocked !== false) onClick(); }} onKeyDown={(event) => { if (zone.unlocked !== false && (event.key === "Enter" || event.key === " ")) onClick(); }} transform={`translate(${zone.labelPosition.x} ${zone.labelPosition.y})`}>
      <rect x="-67" y="-27" width="134" height="54" rx="18" fill="#fff8e8" stroke="#fff" strokeWidth="3" filter="url(#labelShadow)" />
      <text y="-7" textAnchor="middle" fill="#405448" fontSize="13" fontWeight="800">{zone.name}</text>
      <rect x="-50" y="4" width="100" height="7" rx="4" fill="#e9e1ce" />
      <rect x="-50" y="4" width={zone.progress} height="7" rx="4" fill={zone.color} />
      <text y="22" textAnchor="middle" fill="#76837a" fontSize="8" fontWeight="800">{zone.unlocked === false ? "Unlocks at village LV 2" : `${zone.progress}% · LV ${zone.level}`}</text>
    </g>
  );
}
