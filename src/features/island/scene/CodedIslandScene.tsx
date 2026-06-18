import type { ChildProfile } from "../../../lib/api/client";
import type { IslandZoneData } from "../types";
import { AmbientEffects } from "./AmbientEffects";
import { BridgeLayer } from "./BridgeLayer";
import { BuildingLayer } from "./BuildingLayer";
import { IslandTerrain } from "./IslandTerrain";
import { OceanLayer } from "./OceanLayer";

export function CodedIslandScene({ zones, season, avatar, activeZoneId, onZoneClick }: { zones: IslandZoneData[]; season: string; avatar?: ChildProfile; activeZoneId?: string; onZoneClick: (zone: IslandZoneData) => void }) {
  return (
    <div className="island-scene-viewport absolute inset-0 overflow-auto">
      <svg className="island-svg-scene relative left-1/2 top-1/2 z-[2] h-full min-h-[700px] min-w-[1050px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1200 800" role="img" aria-label="Interactive illustrated LifeQuest village island">
        <defs>
          <linearGradient id="oceanGradient" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#56bed0" /><stop offset="1" stopColor="#309caf" /></linearGradient>
          <linearGradient id="grassGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a9d982" /><stop offset="1" stopColor="#7dbe69" /></linearGradient>
          <filter id="terrainShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#175d64" floodOpacity=".32" /></filter>
          <filter id="labelShadow" x="-30%" y="-50%" width="160%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#345548" floodOpacity=".22" /></filter>
          <filter id="buildingGlow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#fff8c7" floodOpacity=".9" /></filter>
        </defs>
        <OceanLayer />
        <IslandTerrain />
        <BridgeLayer />
        <BuildingLayer zones={zones} activeZoneId={activeZoneId} onZoneClick={onZoneClick} />
        <AmbientEffects season={season} avatar={avatar} />
      </svg>
    </div>
  );
}
