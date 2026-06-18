import type { IslandBuildingType } from "../types";

const buildingAssets: Record<IslandBuildingType, { href: string; width: number; height: number; y: number }> = {
  // Do not replace island scene assets; these values only normalize visual scale.
  home: { href: "/assets/island/buildings/home-area/home-area-lv1.png", width: 116, height: 116, y: -84 },
  garden: { href: "/assets/island/buildings/garden/garden-lv1.png", width: 124, height: 124, y: -90 },
  workshop: { href: "/assets/island/buildings/workshop/workshop-lv1.png", width: 118, height: 118, y: -85 },
  learning: { href: "/assets/island/buildings/learning-corner/learning-corner-lv1.png", width: 118, height: 118, y: -85 },
  townHall: { href: "/assets/island/buildings/town-hall/town-hall-lv1.png", width: 126, height: 95, y: -70 },
  market: { href: "/assets/island/buildings/market-square/market-square-lv1.png", width: 124, height: 124, y: -90 },
  lighthouse: { href: "/assets/island/buildings/lighthouse/lighthouse-lv1.png", width: 92, height: 138, y: -108 },
  pathways: { href: "/assets/island/buildings/pathways/pathways-lv1.png", width: 156, height: 88, y: -61 },
};

export function IslandBuilding({ type }: { type: IslandBuildingType; color: string }) {
  const asset = buildingAssets[type];

  return (
    <>
      <rect
        className="building-hit-area"
        x={-asset.width * 0.42}
        y={asset.y + asset.height * 0.28}
        width={asset.width * 0.84}
        height={asset.height * 0.54}
        rx="34"
        fill="transparent"
      />
      <image
        className="building-image"
        href={asset.href}
        x={-asset.width / 2}
        y={asset.y}
        width={asset.width}
        height={asset.height}
        preserveAspectRatio="xMidYMid meet"
        pointerEvents="none"
      />
    </>
  );
}
