import type { IslandBuildingType } from "../types";

const outline = "#6B4F3A";
const cream = "#FFF6E5";
const glow = "#FFD98B";

function Window({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><rect x="-12" y="-10" width="24" height="22" rx="5" fill={glow} stroke={outline} strokeWidth="3"/><path d="M0-9v20M-11 1h22" stroke="#FFF1B8" strokeWidth="2"/><path d="M-17-8v18M17-8v18" stroke="#8FBF68" strokeWidth="4"/></g>;
}
function FlowerBox({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><rect x="-14" y="-2" width="28" height="7" rx="3" fill="#9A6743"/>{[-8,0,8].map((v,i)=><circle key={v} cx={v} cy="-5" r="4" fill={["#F4A261","#E98FA0","#F5D36F"][i]}/>)}</g>;
}
function Animal({ x, y, color = "#D98A55", ears = "pointy" }: { x: number; y: number; color?: string; ears?: "pointy" | "round" }) {
  return <g transform={`translate(${x} ${y})`} stroke={outline} strokeWidth="2"><ellipse cy="13" rx="11" ry="13" fill={color}/><circle cy="-2" r="10" fill={color}/>{ears === "pointy" ? <><path d="M-8-8-11-20-2-11M8-8 11-20 2-11" fill={color}/></> : <><circle cx="-8" cy="-10" r="5" fill={color}/><circle cx="8" cy="-10" r="5" fill={color}/></>}<circle cx="-4" cy="-3" r="1.5" fill="#3F3528" stroke="none"/><circle cx="4" cy="-3" r="1.5" fill="#3F3528" stroke="none"/><path d="M-3 3q3 3 6 0" fill="none"/></g>;
}
function Home() {
  return <g><ellipse cy="48" rx="72" ry="18" fill="#3F6F4B" opacity=".22"/><rect x="-54" y="-14" width="108" height="67" rx="12" fill="#F0D59D" stroke={outline} strokeWidth="5"/><path d="M-66-12 0-72 66-12Z" fill="#E98255" stroke={outline} strokeWidth="6" strokeLinejoin="round"/><path d="M-45-22h90" stroke="#F4A261" strokeWidth="6"/><Window x={-31} y={14}/><Window x={31} y={14}/><FlowerBox x={-31} y={29}/><FlowerBox x={31} y={29}/><rect x="-11" y="18" width="22" height="35" rx="7" fill="#9A6743" stroke={outline} strokeWidth="3"/><path d="M-75 48q15-12 30 0M-88 57h28m75 0h42" fill="none" stroke={cream} strokeWidth="6" strokeLinecap="round"/><path d="M-78 20v35m-18-20h36" stroke={cream} strokeWidth="4"/><g transform="translate(72 35)"><rect x="-3" y="-24" width="6" height="29" fill="#7C573B"/><rect x="-13" y="-28" width="27" height="17" rx="4" fill="#D95E4F" stroke={outline} strokeWidth="3"/></g><Animal x={-68} y={39}/></g>;
}
function Garden() {
  return <g><ellipse cy="46" rx="82" ry="18" fill="#3F6F4B" opacity=".2"/>{[-48,-12,24].map((x,i)=><g key={x}><rect x={x-14} y="-5" width="28" height="54" rx="7" fill="#95653F" stroke={outline} strokeWidth="3"/>{[-1,15,31].map(y=><path key={y} d={`M${x-9} ${y}q9-10 18 0`} fill="none" stroke={["#8FCB68","#F2B84B","#6FAF5C"][i]} strokeWidth="7" strokeLinecap="round"/>)}</g>)}<path d="M35 42V-25Q66-62 88-25v67Z" fill="#C9F0DF" fillOpacity=".62" stroke={cream} strokeWidth="4"/><path d="M35-25h53M61-47v89" stroke="#8B633E" strokeWidth="3"/><path d="M-80 50v-52m0 22h25m143 30v-45m0 18h-20" stroke="#9A6743" strokeWidth="4"/><g transform="translate(-73 -18)"><circle cy="-9" r="17" fill="#8FBF68"/><circle cx="-10" cy="-2" r="12" fill="#6FAF5C"/><circle cx="11" cy="-2" r="12" fill="#8CCB68"/><rect x="-3" y="7" width="6" height="20" fill="#8B633E"/><circle cx="-8" cy="-11" r="4" fill="#F4A261"/></g><path d="M72 53q12-14 24 0M75 53v-14h18v14" fill="#6FAF5C" stroke={outline} strokeWidth="3"/></g>;
}
function Workshop() {
  return <g><ellipse cy="48" rx="72" ry="17" fill="#3F6F4B" opacity=".2"/><rect x="-56" y="-12" width="112" height="65" rx="10" fill="#C28B58" stroke={outline} strokeWidth="5"/><path d="M-67-10 0-66 67-10Z" fill="#6596C5" stroke={outline} strokeWidth="6"/><rect x="31" y="-58" width="15" height="38" rx="3" fill="#9A6743" stroke={outline} strokeWidth="3"/><g className="chimney-smoke" fill="#FFF6E5" opacity=".65"><circle cx="39" cy="-72" r="8"/><circle cx="45" cy="-88" r="11"/></g><Window x={-28} y={13}/><rect x="14" y="10" width="26" height="43" rx="5" fill="#765039"/><path d="M-72 54h42m42 0h60" stroke="#A76C42" strokeWidth="8" strokeLinecap="round"/><path d="M68-4v36m-10-21h20M64 5l8 8m-8 0 8-8" stroke="#F2B84B" strokeWidth="4" strokeLinecap="round"/><path d="M-80 34l8-5m2 13 9-4m-15 16 8-4" stroke="#E8C982" strokeWidth="3"/></g>;
}
function Learning() {
  return <g><ellipse cy="48" rx="72" ry="18" fill="#3F6F4B" opacity=".2"/><rect x="-56" y="-14" width="112" height="67" rx="12" fill="#E7D3A4" stroke={outline} strokeWidth="5"/><path d="M-67-12 0-70 67-12Z" fill="#A982C6" stroke={outline} strokeWidth="6"/><Window x={-30} y={14}/><rect x="12" y="2" width="31" height="51" rx="5" fill="#8B633E" stroke={outline} strokeWidth="3"/>{[-7,3,13,23,33].map((y,i)=><rect key={y} x="17" y={y} width={20} height="6" rx="2" fill={["#E98F67","#6FAF5C","#6596C5","#F2B84B","#B98AE8"][i]}/>) }<path d="M-55 42q-13-17-3-35t-2-30" fill="none" stroke="#6FAF5C" strokeWidth="5"/><g transform="translate(72 31)"><rect x="-22" y="-19" width="44" height="35" rx="4" fill="#486B53" stroke={outline} strokeWidth="4"/><path d="M-14-8h28M-14 0h18" stroke={cream} strokeWidth="2"/><path d="M-15 18v18m30-18v18" stroke={outline} strokeWidth="4"/></g><path d="M-75 53h50" stroke="#8B633E" strokeWidth="6" strokeLinecap="round"/></g>;
}
function TownHall() {
  return <g><ellipse cy="57" rx="91" ry="20" fill="#3F6F4B" opacity=".2"/><rect x="-69" y="-19" width="138" height="78" rx="10" fill="#EFD69E" stroke={outline} strokeWidth="5"/><path d="M-80-17 0-82 80-17Z" fill="#56845A" stroke={outline} strokeWidth="6"/><circle cy="-44" r="17" fill={cream} stroke={outline} strokeWidth="4"/><path d="M0-55v12l9 6" fill="none" stroke="#6B4F3A" strokeWidth="3"/><path d="M0-82v-27m0 2 32 10-32 10" fill="#F4A261" stroke={outline} strokeWidth="3"/>{[-46,46].map(x=><g key={x}><rect x={x-8} y="-5" width="16" height="55" rx="6" fill={cream} stroke={outline} strokeWidth="3"/><circle cx={x} cy="-9" r="9" fill={cream} stroke={outline} strokeWidth="3"/></g>)}<rect x="-15" y="15" width="30" height="44" rx="5" fill="#8B633E"/><path d="M-35 59h70m-46 8h22" stroke="#C8A86B" strokeWidth="7" strokeLinecap="round"/><g transform="translate(87 46)"><ellipse cy="7" rx="28" ry="10" fill="#C8A86B"/><path d="M-19 3q19-25 38 0Z" fill="#4FC3D9"/><path d="M0 2v-22" stroke="#4FC3D9" strokeWidth="4"/></g></g>;
}
function Market() {
  return <g><ellipse cy="49" rx="91" ry="21" fill="#3F6F4B" opacity=".2"/>{[-52,20].map((x,i)=><g key={x} transform={`translate(${x} 3)`}><rect x="-29" y="-5" width="58" height="49" rx="5" fill="#C88A50" stroke={outline} strokeWidth="4"/><path d="M-36-5h72l-9-34h-54Z" fill={i ? "#E98255" : "#6596C5"} stroke={outline} strokeWidth="4"/><path d="M-24-37v30M0-39v34M24-37v30" stroke={cream} strokeWidth="8"/><circle cx="-12" cy="22" r="8" fill="#F2B84B"/><circle cx="8" cy="22" r="8" fill="#8CCB68"/></g>)}<path d="M-86-55q86 23 172 0" fill="none" stroke="#7C573B" strokeWidth="3"/>{[-72,-48,-24,0,24,48,72].map((x,i)=><path key={x} d={`M${x}-59l8 13 8-13Z`} fill={i%2 ? "#F2B84B" : "#B98AE8"}/>) }<g transform="translate(82 35)"><ellipse cy="9" rx="22" ry="8" fill="#C8A86B"/><circle cy="-3" r="14" fill="#4FC3D9"/><path d="M0-2v-18" stroke="#4FC3D9" strokeWidth="3"/></g><Animal x={-89} y={32} color="#C98A52" ears="round"/></g>;
}
function Lighthouse() {
  return <g><ellipse cy="50" rx="59" ry="18" fill="#3F6F4B" opacity=".22"/><path d="M-34 51-23-48h46l11 99Z" fill={cream} stroke={outline} strokeWidth="5"/><path d="M-28-12h56M-31 18h62" stroke="#E98255" strokeWidth="11"/><rect x="-34" y="-65" width="68" height="23" rx="8" fill="#FFD98B" stroke={outline} strokeWidth="5"/><path d="M-42-65 0-98 42-65Z" fill="#D95E4F" stroke={outline} strokeWidth="5"/><g className="lighthouse-beam"><path d="M0-53 130-83 130-23Z" fill="#FFF1A8" opacity=".32"/></g><rect x="-10" y="17" width="20" height="34" rx="7" fill="#8B633E"/>{[[-52,45],[49,50],[68,35]].map(([x,y])=><path key={x} d={`M${x-12} ${y}q12-18 24 0q-12-8-24 0`} fill="#8B8B82" stroke={outline} strokeWidth="2"/>) }<path d="M-68-48q8-9 16 0m12-8q8-9 16 0" fill="none" stroke={cream} strokeWidth="3"/></g>;
}
function Pathways() {
  return <g><path d="M-82 39Q0-48 82 39" fill="none" stroke="#6B4F3A" strokeWidth="30"/><path d="M-79 34Q0-36 79 34" fill="none" stroke="#C98C4E" strokeDasharray="10 7" strokeWidth="20"/><path d="M-84 43v-55M84 43v-55M-84-5h168" stroke={outline} strokeWidth="5"/><path d="M-66-14q-10-15-20 0m152 0q10-15 20 0" fill="none" stroke="#E98FA0" strokeWidth="5"/><g transform="translate(0 -51)"><path d="M0 0v-50M0-45h64l-15 16 15 16H0" fill="#8B633E" stroke={outline} strokeWidth="4"/><path d="M14-32h30" stroke={cream} strokeWidth="4"/></g><Animal x={-70} y={35} color="#D7C6B2"/></g>;
}

export function IslandBuilding({ type }: { type: IslandBuildingType; color: string }) {
  if (type === "garden") return <Garden />;
  if (type === "workshop") return <Workshop />;
  if (type === "learning") return <Learning />;
  if (type === "townHall") return <TownHall />;
  if (type === "market") return <Market />;
  if (type === "lighthouse") return <Lighthouse />;
  if (type === "pathways") return <Pathways />;
  return <Home />;
}
