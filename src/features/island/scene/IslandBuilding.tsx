import type { IslandBuildingType } from "../types";

const buildingAssets: Record<IslandBuildingType, { href: string; width: number; height: number; y: number }> = {
  // Do not replace island scene assets; these values only normalize visual scale.
  home: { href: "/assets/island/buildings/home-area/home-area-lv1.png", width: 178, height: 178, y: -128 },
  garden: { href: "/assets/island/buildings/garden/garden-lv1.png", width: 200, height: 200, y: -143 },
  workshop: { href: "/assets/island/buildings/workshop/workshop-lv1.png", width: 178, height: 178, y: -128 },
  learning: { href: "/assets/island/buildings/learning-corner/learning-corner-lv1.png", width: 178, height: 178, y: -128 },
  townHall: { href: "/assets/island/buildings/town-hall/town-hall-lv1.png", width: 205, height: 154, y: -114 },
  market: { href: "/assets/island/buildings/market-square/market-square-lv1.png", width: 205, height: 205, y: -148 },
  lighthouse: { href: "/assets/island/buildings/lighthouse/lighthouse-lv1.png", width: 145, height: 218, y: -172 },
  pathways: { href: "/assets/island/buildings/pathways/pathways-lv1.png", width: 210, height: 118, y: -82 },
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
