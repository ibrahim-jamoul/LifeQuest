type Decoration = { href: string; x: number; y: number; width: number; height: number; className?: string };

const trees: Decoration[] = [
  { href: "/assets/island/nature/trees/tree-leafy-01.png", x: 128, y: 202, width: 112, height: 112 },
  { href: "/assets/island/nature/trees/tree-blossom-01.png", x: 178, y: 155, width: 102, height: 102 },
  { href: "/assets/island/nature/trees/tree-pine-01.png", x: 330, y: 110, width: 105, height: 105 },
  { href: "/assets/island/nature/trees/tree-pine-02.png", x: 744, y: 112, width: 108, height: 108 },
  { href: "/assets/island/nature/trees/tree-leafy-01.png", x: 1000, y: 320, width: 112, height: 112 },
  { href: "/assets/island/nature/trees/tree-pine-02.png", x: 1010, y: 490, width: 106, height: 106 },
  { href: "/assets/island/nature/trees/tree-blossom-01.png", x: 700, y: 665, width: 92, height: 92 },
  { href: "/assets/island/nature/trees/tree-leafy-01.png", x: 385, y: 665, width: 96, height: 96 },
  { href: "/assets/island/nature/trees/tree-pine-01.png", x: 132, y: 505, width: 104, height: 104 },
];

const decorations: Decoration[] = [
  { href: "/assets/island/nature/flowers/flower-cluster-mixed.png", x: 332, y: 276, width: 54, height: 54 },
  { href: "/assets/island/nature/flowers/flower-cluster-pink.png", x: 450, y: 206, width: 48, height: 48 },
  { href: "/assets/island/nature/flowers/flower-cluster-yellow.png", x: 764, y: 335, width: 48, height: 48 },
  { href: "/assets/island/nature/flowers/flower-cluster-mixed.png", x: 1060, y: 555, width: 46, height: 46 },
  { href: "/assets/island/nature/flowers/flower-cluster-pink.png", x: 285, y: 605, width: 45, height: 45 },
  { href: "/assets/island/nature/bushes/bush-flowering-01.png", x: 92, y: 320, width: 88, height: 60 },
  { href: "/assets/island/nature/bushes/bush-plain-01.png", x: 1040, y: 410, width: 92, height: 62 },
  { href: "/assets/island/nature/bushes/bush-flowering-01.png", x: 730, y: 690, width: 72, height: 50 },
  { href: "/assets/island/nature/rocks/rock-cluster-01.png", x: 1080, y: 370, width: 58, height: 45 },
  { href: "/assets/island/nature/rocks/rock-cluster-02.png", x: 430, y: 705, width: 58, height: 42 },
  { href: "/assets/island/nature/rocks/rock-cluster-01.png", x: 170, y: 405, width: 62, height: 48 },
];

function DecorationImage({ decoration }: { decoration: Decoration }) {
  return <image className={decoration.className} href={decoration.href} x={decoration.x} y={decoration.y} width={decoration.width} height={decoration.height} preserveAspectRatio="xMidYMid meet" />;
}

export function VegetationLayer() {
  // Decorations stay behind buildings so entrances and labels remain readable.
  const orderedDecorations = [...decorations].sort((a, b) => a.y - b.y);
  const orderedTrees = [...trees].sort((a, b) => a.y - b.y);

  return (
    <g pointerEvents="none">
      {orderedDecorations.map((decoration) => <DecorationImage key={`${decoration.href}-${decoration.x}-${decoration.y}`} decoration={decoration} />)}
      {orderedTrees.map((decoration) => <DecorationImage key={`${decoration.href}-${decoration.x}-${decoration.y}`} decoration={{ ...decoration, className: "tree-sway" }} />)}
    </g>
  );
}
