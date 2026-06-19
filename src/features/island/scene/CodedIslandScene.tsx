import type { ChildProfile } from "../../../lib/api/client";
import type { IslandZoneData } from "../types";
import { AmbientEffects } from "./AmbientEffects";
import { BridgeLayer } from "./BridgeLayer";
import { BuildingLayer } from "./BuildingLayer";

export function CodedIslandScene({ zones, season, avatar, activeZoneId, onZoneClick }: { zones: IslandZoneData[]; season: string; avatar?: ChildProfile; activeZoneId?: string; onZoneClick: (zone: IslandZoneData) => void }) {
  return (
    <div className="island-viewport island-scene-viewport absolute inset-0">
      <div className="island-blur-bg" aria-hidden="true">
        <img src="/assets/island/terrain/island-terrain-base.png" alt="" />
      </div>
      <div className="ocean-harmonizer" aria-hidden="true" />

      <div className="island-stage">
        <img
          className="island-main"
          src="/assets/island/terrain/island-terrain-base.png"
          alt="LifeQuest Island"
          draggable={false}
        />
        <svg className="island-svg-scene" viewBox="0 0 1200 800" role="img" aria-label="Interactive coded LifeQuest village island">
          <defs>
            <filter id="terrainShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#175d64" floodOpacity=".32" /></filter>
            <filter id="labelShadow" x="-30%" y="-50%" width="160%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#345548" floodOpacity=".22" /></filter>
            <filter id="buildingGlow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#fff8c7" floodOpacity=".9" /></filter>
          </defs>
          <BridgeLayer />
          <BuildingLayer zones={zones} activeZoneId={activeZoneId} onZoneClick={onZoneClick} />
          <AmbientEffects season={season} avatar={avatar} />
        </svg>
      </div>
    </div>
  );
}
