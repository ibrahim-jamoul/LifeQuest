import type { IslandZoneData } from "../types";
import { IslandZoneLabel } from "./IslandZoneLabel";
import { IslandZoneMarker } from "./IslandZoneMarker";

export function BuildingLayer({ zones, activeZoneId, onZoneClick }: { zones: IslandZoneData[]; activeZoneId?: string; onZoneClick: (zone: IslandZoneData) => void }) {
  // Z-index follows isometric y-order inside the SVG render order.
  const orderedZones = [...zones].sort((a, b) => a.position.y - b.position.y);

  return (
    <g className="island-building-layer">
      <g className="island-zone-marker-layer">
        {orderedZones.map((zone) => <IslandZoneMarker key={zone.id} zone={zone} active={activeZoneId === zone.id} onClick={() => onZoneClick(zone)} />)}
      </g>
      <g className="island-zone-label-layer">
        {orderedZones.map((zone) => <IslandZoneLabel key={`label-${zone.id}`} zone={zone} onClick={() => onZoneClick(zone)} />)}
      </g>
    </g>
  );
}
