import { useEffect, useState } from "react";
import type { ChildProfile } from "../../../lib/api/client";

type AmbientImageSpec = {
  className?: string;
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
};

type VillagerImage = {
  className: string;
  href: string;
  x: number;
  y: number;
  imageX: number;
  imageY: number;
  width: number;
  height: number;
};

type PathNode = {
  x: number;
  y: number;
};

type PathPose = {
  x: number;
  y: number;
  angle: number;
  dx: number;
  dy: number;
};

type FoamInstance = {
  x: number;
  y: number;
  rotation?: number;
  maxOpacity?: number;
  delayMs?: number;
  cycleDurationMs?: number;
  frameOffset?: number;
  driftX?: number;
  driftY?: number;
};

const birdFrames = [
  "/assets/island/ambience/bird-flight-01.png",
  "/assets/island/ambience/bird-flight-02.png",
  "/assets/island/ambience/bird-flight-03.png",
];

const shoreFoamFrames = [
  "/assets/island/ambience/foam/shore-foam-05-clean.png",
  "/assets/island/ambience/foam/shore-foam-06-clean.png",
  "/assets/island/ambience/foam/shore-foam-03-clean.png",
  "/assets/island/ambience/foam/shore-foam-02-clean.png",
  "/assets/island/ambience/foam/shore-foam-01-clean.png",
  "/assets/island/ambience/foam/shore-foam-04-clean.png",
];

const clouds: AmbientImageSpec[] = [
  { href: "/assets/island/ambience/cloud-soft-01.png", x: 25, y: 38, width: 140, height: 87, opacity: 0.74 },
  { href: "/assets/island/ambience/cloud-soft-01.png", x: 980, y: 58, width: 132, height: 82, opacity: 0.42 },
];

const birdPathNodes: PathNode[] = [
  { x: 165, y: 88 },
  { x: 395, y: 70 },
  { x: 625, y: 76 },
  { x: 860, y: 94 },
  { x: 1015, y: 126 },
  { x: 880, y: 144 },
  { x: 520, y: 136 },
  { x: 115, y: 122 },
];

const boatPathNodes: PathNode[] = [
  { x: -36, y: 654 },
  { x: 150, y: 728 },
  { x: 472, y: 752 },
  { x: 846, y: 738 },
  { x: 1152, y: 652 },
  { x: 1308, y: 510 },
  { x: 1326, y: 268 },
  { x: 1196, y: 78 },
  { x: 932, y: -24 },
  { x: 578, y: -42 },
  { x: 224, y: 18 },
  { x: -4, y: 196 },
  { x: -48, y: 466 },
];

const frontVillagers: VillagerImage[] = [
  { className: "villager-fox", href: "/assets/island/villagers/villager-fox-front.png", x: 380, y: 280, imageX: -24, imageY: -36, width: 48, height: 48 },
  { className: "villager-rabbit", href: "/assets/island/villagers/villager-rabbit-front.png", x: 340, y: 545, imageX: -22, imageY: -34, width: 45, height: 45 },
  { className: "villager-bear", href: "/assets/island/villagers/villager-bear-front.png", x: 985, y: 530, imageX: -24, imageY: -36, width: 48, height: 48 },
];

function AmbientImage({ className, href, x, y, width, height, opacity }: AmbientImageSpec) {
  return <image className={className} href={href} x={x} y={y} width={width} height={height} opacity={opacity} />;
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const FOAM_CONFIG = {
  totalInstances: 47,
  groupCount: 6,
  instancesPerGroup: 6,
  minDistanceBetween: 118,
  sizeMultiplier: 1,
  delayRange: [0, 14000],
  cycleDurationRange: [2200, 9800],
  maxOpacityRange: [0.52, 0.9],
  baseSize: 52,
} as const;

const offshoreZones = [
  { xMin: 18, xMax: 180, yMin: 18, yMax: 112 },
  { xMin: 430, xMax: 810, yMin: 12, yMax: 92 },
  { xMin: 1075, xMax: 1236, yMin: 18, yMax: 124 },
  { xMin: 1140, xMax: 1238, yMin: 210, yMax: 310 },
  { xMin: 1110, xMax: 1242, yMin: 592, yMax: 724 },
  { xMin: 470, xMax: 824, yMin: 680, yMax: 742 },
  { xMin: 22, xMax: 208, yMin: 618, yMax: 730 },
  { xMin: 8, xMax: 104, yMin: 238, yMax: 332 },
] as const;

function randomBetween(random: () => number, min: number, max: number) {
  return min + random() * (max - min);
}

function isInNearIslandWater(x: number, y: number) {
  const centerX = 612;
  const centerY = 376;
  const radiusX = 455;
  const radiusY = 282;
  const normalized =
    ((x - centerX) ** 2) / (radiusX ** 2) +
    ((y - centerY) ** 2) / (radiusY ** 2);

  return normalized < 1;
}

function isFarEnough(x: number, y: number, points: Array<{ x: number; y: number }>, minDistance: number) {
  return points.every((point) => Math.hypot(point.x - x, point.y - y) >= minDistance);
}

function createGroupCenters(random: () => number) {
  const centers: Array<{ x: number; y: number }> = [];
  let attempts = 0;

  while (centers.length < FOAM_CONFIG.groupCount && attempts < 500) {
    const zone = offshoreZones[Math.floor(random() * offshoreZones.length)];
    const candidate = {
      x: Math.round(randomBetween(random, zone.xMin, zone.xMax)),
      y: Math.round(randomBetween(random, zone.yMin, zone.yMax)),
    };

    if (isFarEnough(candidate.x, candidate.y, centers, FOAM_CONFIG.minDistanceBetween * 1.55)) {
      centers.push(candidate);
    }

    attempts += 1;
  }

  return centers;
}

function createFoamInstances(count: number): FoamInstance[] {
  const random = createSeededRandom(20260620);
  const instances: FoamInstance[] = [];
  const occupiedPoints: Array<{ x: number; y: number }> = [];
  const centers = createGroupCenters(random);

  for (const center of centers) {
    let created = 0;
    let attempts = 0;

    while (created < FOAM_CONFIG.instancesPerGroup && instances.length < count && attempts < 260) {
      const angle = random() * Math.PI * 2;
      const radius = randomBetween(random, 34, 126);
      const x = Math.round(center.x + Math.cos(angle) * radius);
      const y = Math.round(center.y + Math.sin(angle) * radius * randomBetween(random, 0.72, 1.2));

      const inZone = offshoreZones.some((zone) => x >= zone.xMin && x <= zone.xMax && y >= zone.yMin && y <= zone.yMax);
      if (!inZone || isInNearIslandWater(x, y) || !isFarEnough(x, y, occupiedPoints, FOAM_CONFIG.minDistanceBetween)) {
        attempts += 1;
        continue;
      }

      occupiedPoints.push({ x, y });
      instances.push({
        x,
        y,
        rotation: 0,
        maxOpacity: Number(randomBetween(random, FOAM_CONFIG.maxOpacityRange[0], FOAM_CONFIG.maxOpacityRange[1]).toFixed(2)),
        delayMs: Math.round(randomBetween(random, FOAM_CONFIG.delayRange[0], FOAM_CONFIG.delayRange[1])),
        cycleDurationMs: Math.round(randomBetween(random, FOAM_CONFIG.cycleDurationRange[0], FOAM_CONFIG.cycleDurationRange[1])),
        frameOffset: Math.floor(random() * shoreFoamFrames.length),
        driftX: Number((((random() - 0.5) * 12)).toFixed(2)),
        driftY: Number((((random() - 0.5) * 2.4)).toFixed(2)),
      });

      created += 1;
      attempts += 1;
    }
  }

  let fallbackAttempts = 0;
  while (instances.length < count && fallbackAttempts < 500) {
    const zone = offshoreZones[Math.floor(random() * offshoreZones.length)];
    const x = Math.round(randomBetween(random, zone.xMin, zone.xMax));
    const y = Math.round(randomBetween(random, zone.yMin, zone.yMax));

    if (!isInNearIslandWater(x, y) && isFarEnough(x, y, occupiedPoints, FOAM_CONFIG.minDistanceBetween)) {
      occupiedPoints.push({ x, y });
      instances.push({
        x,
        y,
        rotation: 0,
        maxOpacity: Number(randomBetween(random, FOAM_CONFIG.maxOpacityRange[0], FOAM_CONFIG.maxOpacityRange[1]).toFixed(2)),
        delayMs: Math.round(randomBetween(random, FOAM_CONFIG.delayRange[0], FOAM_CONFIG.delayRange[1])),
        cycleDurationMs: Math.round(randomBetween(random, FOAM_CONFIG.cycleDurationRange[0], FOAM_CONFIG.cycleDurationRange[1])),
        frameOffset: Math.floor(random() * shoreFoamFrames.length),
        driftX: Number((((random() - 0.5) * 12)).toFixed(2)),
        driftY: Number((((random() - 0.5) * 2.4)).toFixed(2)),
      });
    }

    fallbackAttempts += 1;
  }

  return instances;
}

const shoreFoamInstances = createFoamInstances(FOAM_CONFIG.totalInstances);

function distanceBetween(start: PathNode, end: PathNode) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function sampleClosedPath(nodes: PathNode[], progress: number): PathPose {
  if (nodes.length === 0) return { x: 0, y: 0, angle: 0, dx: 1, dy: 0 };
  if (nodes.length === 1) return { x: nodes[0].x, y: nodes[0].y, angle: 0, dx: 1, dy: 0 };

  const looped = [...nodes, nodes[0]];
  const segmentLengths = looped.slice(0, -1).map((node, index) => distanceBetween(node, looped[index + 1]));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  let remainingDistance = ((progress % 1) + 1) % 1 * totalLength;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    if (remainingDistance <= segmentLength) {
      const start = looped[index];
      const end = looped[index + 1];
      const ratio = segmentLength === 0 ? 0 : remainingDistance / segmentLength;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
        angle: Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI),
        dx: end.x - start.x,
        dy: end.y - start.y,
      };
    }
    remainingDistance -= segmentLength;
  }

  const tailStart = looped[looped.length - 2];
  const tailEnd = looped[looped.length - 1];
  return {
    x: tailStart.x,
    y: tailStart.y,
    angle: Math.atan2(tailEnd.y - tailStart.y, tailEnd.x - tailStart.x) * (180 / Math.PI),
    dx: tailEnd.x - tailStart.x,
    dy: tailEnd.y - tailStart.y,
  };
}

function sampleBalloonInfinity(progress: number): { x: number; y: number } {
  const centerX = 1010;
  const centerY = 358;
  const horizontalRadius = 84;
  const loopHeight = 36;
  const bobbingHeight = 10;
  const angle = progress * Math.PI * 2;

  return {
    x: centerX + Math.sin(angle) * horizontalRadius,
    y: centerY + Math.sin(angle) * Math.cos(angle) * loopHeight + Math.sin(angle * 2) * bobbingHeight,
  };
}

function useAmbientClock() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTime(0);
      return undefined;
    }

    let frameId = 0;
    const tick = (nextTime: number) => {
      setTime(nextTime);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return time;
}

function FrontVillager({ className, href, x, y, imageX, imageY, width, height }: VillagerImage) {
  return (
    <g className={className} transform={`translate(${x} ${y})`}>
      <image href={href} x={imageX} y={imageY} width={width} height={height} />
    </g>
  );
}

export function AmbientBackgroundEffects() {
  const time = useAmbientClock();
  const birdProgress = (time % 36000) / 36000;
  const boatProgress = (time % 112000) / 112000;
  const birdPose = sampleClosedPath(birdPathNodes, birdProgress);
  const boatPose = sampleClosedPath(boatPathNodes, boatProgress);
  const birdFrame = birdFrames[Math.floor(time / 180) % birdFrames.length];
  const birdFacing = birdPose.dx >= 0 ? 1 : -1;
  const birdPitch = Math.atan2(birdPose.dy, Math.max(Math.abs(birdPose.dx), 1)) * (180 / Math.PI);
  const boatFacing = boatPose.dx >= 0 ? 1 : -1;
  const boatPitch = Math.atan2(boatPose.dy, Math.max(Math.abs(boatPose.dx), 1)) * (180 / Math.PI) * 0.62;

  return (
    <g className="island-ambient-background-layer" pointerEvents="none">
      <g className="island-cloud-layer">
        {clouds.map((cloud) => <AmbientImage key={`${cloud.href}-${cloud.x}-${cloud.y}`} {...cloud} />)}
      </g>
      <g className="island-shore-foam-layer">
        {shoreFoamInstances.map((foam) => {
          const cycleDuration = foam.cycleDurationMs ?? 5200;
          const delayedTime = Math.max(0, time - (foam.delayMs ?? 0));
          const localFrameDuration = Math.max(
            140,
            cycleDuration / shoreFoamFrames.length * (0.72 + (((foam.x * 17 + foam.y * 11) % 23) / 100)),
          );
          const frameIndex = (Math.floor(delayedTime / localFrameDuration) + (foam.frameOffset ?? 0)) % shoreFoamFrames.length;
          const phase = ((delayedTime % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;
          const phaseBias = ((foam.x * 31 + foam.y * 19) % 100) / 100;
          const shapedPhase = (phase + phaseBias) % 1;
          const visibilityWindow = Math.max(
            0,
            0.58 * Math.sin(shapedPhase * Math.PI) +
            0.32 * Math.sin(shapedPhase * Math.PI * 2.3 + phaseBias * Math.PI * 2) +
            0.18 * Math.cos(shapedPhase * Math.PI * 3.1 + phaseBias * Math.PI),
          );
          const opacityPulse = Math.min(1, Math.max(0.18, visibilityWindow + 0.24));
          const frame = shoreFoamFrames[frameIndex];
          const driftPhase = delayedTime / (4100 + phaseBias * 2600);
          const driftedX = foam.x + Math.sin(driftPhase) * (foam.driftX ?? 0);
          const driftedY = foam.y + Math.cos(driftPhase * (0.58 + phaseBias * 0.34)) * (foam.driftY ?? 0);
          const foamSize = Math.round(FOAM_CONFIG.baseSize * FOAM_CONFIG.sizeMultiplier);
          const foamHalf = foamSize / 2;
          return (
            <image
              key={`${foam.x}-${foam.y}-${foam.rotation ?? 0}`}
              href={frame}
              x={driftedX - foamHalf}
              y={driftedY - foamHalf}
              width={foamSize}
              height={foamSize}
              opacity={Number(((foam.maxOpacity ?? 0.5) * opacityPulse).toFixed(2))}
              preserveAspectRatio="xMidYMid meet"
            />
          );
        })}
      </g>
      <g className="island-bird-flight-layer" transform={`translate(${birdPose.x} ${birdPose.y})`}>
        <g transform={`scale(${birdFacing} 1) rotate(${birdPitch})`}>
          <image href={birdFrame} x={-26} y={-26} width={52} height={52} opacity={0.9} />
        </g>
      </g>
      <g className="island-boat-flight-layer" transform={`translate(${boatPose.x} ${boatPose.y})`}>
        <g transform={`scale(${boatFacing} 1)`}>
          <g transform={`rotate(${boatPitch})`}>
            <image href="/assets/island/ambience/sailboat.png" x={-55.5} y={-43.5} width={111} height={87} />
          </g>
        </g>
      </g>
    </g>
  );
}

export function AmbientForegroundEffects() {
  const time = useAmbientClock();
  const balloonProgress = (time % 32000) / 32000;
  const balloonPose = sampleBalloonInfinity(balloonProgress);

  return (
    <g className="island-ambient-foreground-layer" pointerEvents="none">
      <g className="island-balloon-flight-layer" transform={`translate(${balloonPose.x} ${balloonPose.y})`}>
        <image href="/assets/island/ambience/hot-air-balloon.png" x={-52} y={-69} width={104} height={138} />
      </g>
    </g>
  );
}

export function AmbientEffects({ season, avatar }: { season: string; avatar?: ChildProfile }) {
  const seasonalColor = season === "Autumn" ? "#df985b" : season === "Winter" ? "#dff5f5" : season === "Spring" ? "#f4a9c3" : "#fff4ac";

  return (
    <g className="island-ambient-layer" pointerEvents="none">
      <g className="island-villager-layer">
        {frontVillagers.map((villager) => <FrontVillager key={villager.href} {...villager} />)}
      </g>
      <g className="island-player-avatar-layer">
        <g className="child-avatar-scene" transform="translate(585 500)" stroke="#604c3f" strokeWidth="3">
          <circle cy="-18" r="13" fill={avatar?.avatar_color ?? "#75a876"} />
          <path d="M-15 24V-2h30v26" fill={avatar?.avatar_color ?? "#75a876"} />
          <path d="M-9 24v18m18-18v18" />
          <circle cy="-18" r="5" fill={seasonalColor} stroke="none" />
        </g>
      </g>
    </g>
  );
}
