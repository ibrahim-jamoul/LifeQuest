function Bridge({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-45" y="-16" width="90" height="32" rx="12" fill="#805838" opacity=".28" />
      <rect x="-45" y="-21" width="90" height="32" rx="12" fill="#c98c4e" stroke="#704a31" strokeWidth="4" />
      {[-30, -10, 10, 30].map((line) => <path key={line} d={`M${line} -19v28`} stroke="#f0bd72" strokeWidth="5" />)}
      <path d="M-43-27v-12M43-27v-12M-43-34h86" stroke="#704a31" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}
export function BridgeLayer() {
  return <g><Bridge x={628} y={350} rotate={-20} /><Bridge x={620} y={575} rotate={22} /><Bridge x={850} y={690} rotate={-8} /></g>;
}
