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
      <Bridge href="/assets/island/structures/bridge-main.png" x={628} y={350} width={130} height={74} rotate={-20} />
      <Bridge href="/assets/island/structures/bridge-secondary.png" x={620} y={575} width={108} height={64} rotate={22} />
      <Bridge href="/assets/island/structures/bridge-secondary.png" x={850} y={690} width={108} height={64} rotate={-8} />
    </g>
  );
}
