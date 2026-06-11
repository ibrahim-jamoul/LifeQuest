const trees = [[170, 250], [205, 205], [170, 575], [330, 155], [420, 170], [760, 155], [820, 190], [1010, 370], [1005, 540], [740, 650], [390, 670], [185, 450]];
const flowers = [[345, 290], [470, 225], [745, 350], [820, 600], [310, 620], [930, 390], [490, 510]];

function Tree({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><ellipse cy="19" rx="18" ry="8" fill="#47794e" opacity=".25" /><rect x="-5" y="-2" width="10" height="30" rx="4" fill="#875d3f" /><circle cy="-18" r="28" fill="#4b9459" /><circle cx="-16" cy="-11" r="17" fill="#69aa64" /><circle cx="15" cy="-8" r="18" fill="#5ca05f" /></g>;
}
export function VegetationLayer() {
  return (
    <g>
      {trees.map(([x, y]) => <Tree key={`${x}-${y}`} x={x} y={y} />)}
      {flowers.map(([x, y]) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><circle r="10" fill="#5b9d55" /><circle cx="-6" cy="-7" r="4" fill="#ffd98b" /><circle cx="6" cy="-6" r="4" fill="#e98f9e" /><circle cy="5" r="4" fill="#f8f0bd" /></g>)}
      <g fill="#75b66b" opacity=".85">{[[135,340],[1080,430],[1070,260],[495,130],[690,700]].map(([x,y])=><ellipse key={`${x}-${y}`} cx={x} cy={y} rx="28" ry="14" />)}</g>
    </g>
  );
}
