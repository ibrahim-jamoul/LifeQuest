function Bridge({ href, x, y, width, height, rotate = 0 }: { href: string; x: number; y: number; width: number; height: number; rotate?: number }) {
  return (
    <image
      href={href}
      x={-width / 2}
      y={-height / 2}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      transform={`translate(${x} ${y}) rotate(${rotate})`}
    />
  );
}

export function BridgeLayer() {
  return (
    <g>
      <Bridge href="/assets/island/structures/bridge-main.png" x={650} y={350} width={122} height={70} rotate={-20} />
    </g>
  );
}
