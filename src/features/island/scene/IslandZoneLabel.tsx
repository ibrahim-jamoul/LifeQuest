import type { IslandZoneData } from "../types";

export function IslandZoneLabel({ zone, onClick }: { zone: IslandZoneData; onClick: () => void }) {
  return (
    <g className={`zone-sign ${zone.unlocked === false ? "is-locked" : ""}`} role="button" aria-label={zone.unlocked === false ? `${zone.name} locked until village level 2` : `Open ${zone.name} details`} aria-disabled={zone.unlocked === false} tabIndex={0} onClick={() => { if (zone.unlocked !== false) onClick(); }} onKeyDown={(event) => { if (zone.unlocked !== false && (event.key === "Enter" || event.key === " ")) onClick(); }} transform={`translate(${zone.labelPosition.x} ${zone.labelPosition.y})`}>
      <path d="M-59-29v-12m118 12v-12" stroke="#8B633E" strokeWidth="5" strokeLinecap="round"/>
      <rect x="-76" y="-29" width="152" height="62" rx="14" fill="#6B4F3A" stroke="#8B633E" strokeWidth="4" filter="url(#labelShadow)" />
      <text y="-9" textAnchor="middle" fill="#FFF6E5" fontFamily="Baloo 2" fontSize="14" fontWeight="700">{zone.name}</text>
      <text y="5" textAnchor="middle" fill="#F4A261" fontSize="9" fontWeight="800">{"★".repeat(Math.min(zone.level, 5))}{"☆".repeat(Math.max(0, 5-zone.level))}</text>
      <rect x="-55" y="12" width="110" height="8" rx="4" fill="#4D3829" />
      <rect x="-55" y="12" width={zone.progress * 1.1} height="8" rx="4" fill="#6FAF5C" />
      <text y="29" textAnchor="middle" fill="#FFF6E5" fontSize="9" fontWeight="800">{zone.unlocked === false ? "Locked · LV 2" : `${zone.progress}% complete`}</text>
    </g>
  );
}
