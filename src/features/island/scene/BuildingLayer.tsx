import type { IslandZoneData } from "../types";
import { IslandZoneLabel } from "./IslandZoneLabel";
import { IslandZoneMarker } from "./IslandZoneMarker";

export function BuildingLayer({ zones, activeZoneId, onZoneClick }: { zones: IslandZoneData[]; activeZoneId?: string; onZoneClick: (zone: IslandZoneData) => void }) {
  return (
    <g>
      {zones.map((zone) => <IslandZoneMarker key={zone.id} zone={zone} active={activeZoneId === zone.id} onClick={() => onZoneClick(zone)} />)}
      {zones.map((zone) => <IslandZoneLabel key={`label-${zone.id}`} zone={zone} onClick={() => onZoneClick(zone)} />)}
    </g>
  );
}
