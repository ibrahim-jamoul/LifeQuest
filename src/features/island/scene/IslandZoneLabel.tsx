import type { IslandZoneData } from "../types";

export function IslandZoneLabel({ zone, onClick }: { zone: IslandZoneData; onClick: () => void }) {
  const reviewClass = zone.reviewStatus ? `is-review-${zone.reviewStatus}` : "";
  const statusLabel = zone.reviewStatus === "pending"
    ? "Review pending"
    : zone.reviewStatus === "current"
      ? "Current review"
      : `${zone.progress}% complete`;

  return (
    <g
      className={`zone-sign ${reviewClass}`}
      role="button"
      aria-label={`Open ${zone.name} details`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
      transform={`translate(${zone.labelPosition.x} ${zone.labelPosition.y})`}
    >
      <path d="M-59-29v-12m118 12v-12" stroke="#8B633E" strokeWidth="5" strokeLinecap="round" />
      <rect x="-76" y="-29" width="152" height="62" rx="14" fill="#6B4F3A" stroke="#8B633E" strokeWidth="4" filter="url(#labelShadow)" />
      <text y="-9" textAnchor="middle" fill="#FFF6E5" fontFamily="Baloo 2" fontSize="14" fontWeight="700">{zone.name}</text>
      <text y="5" textAnchor="middle" fill="#F4A261" fontSize="9" fontWeight="800">{"★".repeat(Math.min(zone.level, 5))}{"☆".repeat(Math.max(0, 5 - zone.level))}</text>
      <rect x="-55" y="12" width="110" height="8" rx="4" fill="#4D3829" />
      <rect x="-55" y="12" width={zone.progress * 1.1} height="8" rx="4" fill="#6FAF5C" />
      <text y="29" textAnchor="middle" fill="#FFF6E5" fontSize="9" fontWeight="800">{statusLabel}</text>
    </g>
  );
}
