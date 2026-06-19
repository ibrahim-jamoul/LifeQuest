import type { CSSProperties, PointerEventHandler, WheelEventHandler } from "react";
import type { ChildProfile } from "../../../lib/api/client";
import type { IslandZoneData } from "../types";
import { AmbientEffects } from "./AmbientEffects";
import { BridgeLayer } from "./BridgeLayer";
import { BuildingLayer } from "./BuildingLayer";

const MAP_IMAGE = "/assets/island/terrain/island-terrain-wide.png";
const MAP_WIDTH = 1672;
const MAP_HEIGHT = 941;
const ORIGINAL_SCENE_WIDTH = 1200;
const ORIGINAL_TERRAIN_Y = 62.5;
const ORIGINAL_TERRAIN_HEIGHT = 675;
const REGISTERED_MAP_X = 357.6;
const REGISTERED_MAP_Y = 208.6;
const REGISTERED_MAP_SCALE = 0.565;

const sceneToSourceScaleX = MAP_WIDTH / ORIGINAL_SCENE_WIDTH;
const sceneToSourceScaleY = MAP_HEIGHT / ORIGINAL_TERRAIN_HEIGHT;
const assetTransform = `translate(${REGISTERED_MAP_X} ${REGISTERED_MAP_Y}) scale(${REGISTERED_MAP_SCALE}) scale(${sceneToSourceScaleX} ${sceneToSourceScaleY}) translate(0 ${-ORIGINAL_TERRAIN_Y})`;

type CodedIslandSceneProps = {
  zones: IslandZoneData[];
  season: string;
  avatar?: ChildProfile;
  activeZoneId?: string;
  cameraZoom?: number;
  cameraPan?: { x: number; y: number };
  isCameraDragging?: boolean;
  onCameraPointerDown?: PointerEventHandler<HTMLDivElement>;
  onCameraPointerMove?: PointerEventHandler<HTMLDivElement>;
  onCameraPointerUp?: PointerEventHandler<HTMLDivElement>;
  onCameraPointerCancel?: PointerEventHandler<HTMLDivElement>;
  onCameraWheel?: WheelEventHandler<HTMLDivElement>;
  onZoneClick: (zone: IslandZoneData) => void;
};

export function CodedIslandScene({
  zones,
  season,
  avatar,
  activeZoneId,
  cameraZoom = 1,
  cameraPan = { x: 0, y: 0 },
  isCameraDragging = false,
  onCameraPointerDown,
  onCameraPointerMove,
  onCameraPointerUp,
  onCameraPointerCancel,
  onCameraWheel,
  onZoneClick,
}: CodedIslandSceneProps) {
  const viewportStyle = {
    "--island-camera-zoom": String(cameraZoom),
    "--island-camera-pan-x": `${cameraPan.x}px`,
    "--island-camera-pan-y": `${cameraPan.y}px`,
  } as CSSProperties;
  const stageStyle = {
    transform: `translate(calc(-50% + ${cameraPan.x}px), calc(-50% + ${cameraPan.y}px)) scale(${cameraZoom})`,
  } as CSSProperties;

  return (
    <div
      className={`island-viewport island-scene-viewport absolute inset-0 ${isCameraDragging ? "is-camera-dragging" : ""}`}
      style={viewportStyle}
      onPointerDown={onCameraPointerDown}
      onPointerMove={onCameraPointerMove}
      onPointerUp={onCameraPointerUp}
      onPointerCancel={onCameraPointerCancel}
      onWheel={onCameraWheel}
    >
      <div className="island-stage" style={stageStyle}>
        <svg className="island-svg-scene" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Interactive coded LifeQuest village island">
          <defs>
            <filter id="terrainShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#175d64" floodOpacity=".32" /></filter>
            <filter id="labelShadow" x="-30%" y="-50%" width="160%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#345548" floodOpacity=".22" /></filter>
            <filter id="buildingGlow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#fff8c7" floodOpacity=".9" /></filter>
          </defs>
          <image className="island-main" href={MAP_IMAGE} x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} preserveAspectRatio="xMidYMid meet" />
          <g className="island-asset-layer" transform={assetTransform}>
            <BridgeLayer />
            <BuildingLayer zones={zones} activeZoneId={activeZoneId} onZoneClick={onZoneClick} />
            <AmbientEffects season={season} avatar={avatar} />
          </g>
        </svg>
      </div>
    </div>
  );
}
