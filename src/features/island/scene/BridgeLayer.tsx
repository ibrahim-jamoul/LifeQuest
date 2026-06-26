type BridgeAsset = {
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
};

const bridges: BridgeAsset[] = [
  { href: "/assets/island/structures/bridge-main.png", x: 650, y: 350, width: 90, height: 52, rotate: -20 },
];

function Bridge({ href, x, y, width, height, rotate = 0 }: BridgeAsset) {
  return (
    <image
      href={href}
      x={-width / 2}
      y={-height / 2}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      pointerEvents="none"
      transform={`translate(${x} ${y}) rotate(${rotate})`}
    />
  );
}

export function BridgeLayer() {
  return (
    <g className="island-bridge-layer">
      {bridges.map((bridge) => <Bridge key={`${bridge.href}-${bridge.x}-${bridge.y}`} {...bridge} />)}
    </g>
  );
}
