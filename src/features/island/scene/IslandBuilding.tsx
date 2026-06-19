import type { IslandBuildingType } from "../types";

const buildingAssets: Record<IslandBuildingType, { href: string; width: number; height: number; y: number }> = {
  // Do not replace island scene assets; these values only normalize visual scale.
  home: { href: "/assets/island/buildings/home-area/home-area-lv1.png", width: 102, height: 102, y: -74 },
  garden: { href: "/assets/island/buildings/garden/garden-lv1.png", width: 124, height: 124, y: -90 },
  workshop: { href: "/assets/island/buildings/workshop/workshop-lv1.png", width: 94, height: 94, y: -68 },
  learning: { href: "/assets/island/buildings/learning-corner/learning-corner-lv1.png", width: 100, height: 100, y: -72 },
  townHall: { href: "/assets/island/buildings/town-hall/town-hall-lv1.png", width: 174, height: 130, y: -96 },
  market: { href: "/assets/island/buildings/market-square/market-square-lv1.png", width: 108, height: 108, y: -78 },
  lighthouse: { href: "/assets/island/buildings/lighthouse/lighthouse-lv1.png", width: 146, height: 218, y: -171 },
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
