import type { IslandBuildingType } from "../types";

const outline = "#604c3f";
function House({ color, learning = false, hall = false }: { color: string; learning?: boolean; hall?: boolean }) {
  const width = hall ? 116 : 94;
  return <g><ellipse cy="39" rx={width * .62} ry="15" fill="#345b45" opacity=".22" /><rect x={-width/2} y="-7" width={width} height={hall ? 66 : 55} rx="10" fill="#f3d39b" stroke={outline} strokeWidth="5" /><path d={`M${-width/2-10}-6L0 ${hall ? -75 : -61} ${width/2+10}-6Z`} fill={color} stroke={outline} strokeWidth="6" strokeLinejoin="round" /><rect x="-13" y="20" width="26" height="39" rx="7" fill="#8b5d3e" stroke={outline} strokeWidth="4" /><rect x={-width/2+10} y="12" width="22" height="20" rx="5" fill="#8bd0d0" stroke={outline} strokeWidth="4" /><rect x={width/2-32} y="12" width="22" height="20" rx="5" fill="#8bd0d0" stroke={outline} strokeWidth="4" />{learning && <path d="M-26-17q26-18 52 0v18q-26-13-52 0Z" fill="#fff3c9" stroke={outline} strokeWidth="3" />}{hall && <><circle cy="-42" r="14" fill="#fff3c9" stroke={outline} strokeWidth="4" /><path d="M0-56v28M-14-42h28" stroke={color} strokeWidth="3" /></>}</g>;
}
function Garden() {
  return <g><ellipse cy="35" rx="68" ry="18" fill="#345b45" opacity=".2" />{[-40,0,40].map(x=><g key={x}><rect x={x-17} y="-25" width="34" height="72" rx="8" fill="#8b633e" stroke={outline} strokeWidth="4" /><path d={`M${x-10}-12h20M${x-10}5h20M${x-10}22h20`} stroke="#70b965" strokeWidth="9" strokeLinecap="round" /></g>)}<path d="M-62-30Q0-85 62-30v55h-124Z" fill="#c9f0df" fillOpacity=".6" stroke="#f4fff4" strokeWidth="5" /></g>;
}
function Workshop({ color }: { color: string }) {
  return <g><House color={color} /><g transform="translate(48 28)"><circle r="22" fill="#e8bc74" stroke={outline} strokeWidth="5" /><path d="M0-15v30M-15 0h30M-11-11l22 22M11-11l-22 22" stroke={outline} strokeWidth="3" /></g><path d="M-60 45h30m70 0h36" stroke="#9a6842" strokeWidth="8" strokeLinecap="round" /></g>;
}
function Market({ color }: { color: string }) {
  return <g><ellipse cy="42" rx="80" ry="20" fill="#345b45" opacity=".2" />{[-52,0,52].map((x,i)=><g key={x} transform={`translate(${x} 0)`}><rect x="-24" y="-4" width="48" height="48" rx="6" fill="#c68a4b" stroke={outline} strokeWidth="4" /><path d="M-31-6h62l-8-31h-46Z" fill={i===1 ? "#76a8cc" : color} stroke={outline} strokeWidth="4" /><path d="M-20-35v27M0-37v31M20-35v27" stroke="#fff0c8" strokeWidth="7" /></g>)}</g>;
}
function Lighthouse({ color }: { color: string }) {
  return <g><ellipse cy="43" rx="48" ry="15" fill="#345b45" opacity=".22" /><path d="M-31 48L-21-46h42l10 94Z" fill="#fff1cf" stroke={outline} strokeWidth="5" /><rect x="-31" y="-60" width="62" height="22" rx="8" fill={color} stroke={outline} strokeWidth="5" /><path d="M-39-61L0-92l39 31Z" fill={color} stroke={outline} strokeWidth="5" /><rect x="-10" y="14" width="20" height="34" rx="8" fill="#875b42" /><path d="M-17-31h34" stroke={color} strokeWidth="13" /></g>;
}
function Pathways() {
  return <g><path d="M-78 35Q0-45 78 35" fill="none" stroke="#795238" strokeWidth="24" /><path d="M-76 31Q0-35 76 31" fill="none" stroke="#d79b55" strokeDasharray="8 7" strokeWidth="16" /><path d="M-82 40v-50M82 40v-50M-82-5h164" stroke={outline} strokeWidth="5" /><path d="M0-18v-65M0-78h60l-13 18 13 18H0" fill="#f0b65e" stroke={outline} strokeWidth="5" /></g>;
}
export function IslandBuilding({ type, color }: { type: IslandBuildingType; color: string }) {
  if (type === "garden") return <Garden />;
  if (type === "workshop") return <Workshop color={color} />;
  if (type === "learning") return <House color={color} learning />;
  if (type === "townHall") return <House color={color} hall />;
  if (type === "market") return <Market color={color} />;
  if (type === "lighthouse") return <Lighthouse color={color} />;
  if (type === "pathways") return <Pathways />;
  return <House color={color} />;
}
