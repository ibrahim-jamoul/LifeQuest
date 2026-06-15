import type { IslandBuildingType } from "../types";

const buildingAssets: Record<IslandBuildingType, { href: string; width: number; height: number; y: number }> = {
  home: { href: "/assets/island/buildings/home-area/home-area-lv1.png", width: 190, height: 190, y: -140 },
  garden: { href: "/assets/island/buildings/garden/garden-lv1.png", width: 205, height: 205, y: -148 },
  workshop: { href: "/assets/island/buildings/workshop/workshop-lv1.png", width: 190, height: 190, y: -140 },
  learning: { href: "/assets/island/buildings/learning-corner/learning-corner-lv1.png", width: 190, height: 190, y: -140 },
  townHall: { href: "/assets/island/buildings/town-hall/town-hall-lv1.png", width: 220, height: 165, y: -125 },
  market: { href: "/assets/island/buildings/market-square/market-square-lv1.png", width: 220, height: 220, y: -160 },
  lighthouse: { href: "/assets/island/buildings/lighthouse/lighthouse-lv1.png", width: 155, height: 232, y: -185 },
  pathways: { href: "/assets/island/buildings/pathways/pathways-lv1.png", width: 230, height: 130, y: -92 },
};

export function IslandBuilding({ type }: { type: IslandBuildingType; color: string }) {
  const asset = buildingAssets[type];

  return (
    <>
      <rect
        className="building-hit-area"
        x={-asset.width * 0.35}
        y={asset.y + asset.height * 0.2}
        width={asset.width * 0.7}
        height={asset.height * 0.62}
        rx="28"
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
