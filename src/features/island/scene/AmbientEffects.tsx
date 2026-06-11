import type { ChildProfile } from "../../../lib/api/client";

export function AmbientEffects({ season, avatar }: { season: string; avatar?: ChildProfile }) {
  const seasonalColor = season === "Autumn" ? "#df985b" : season === "Winter" ? "#dff5f5" : season === "Spring" ? "#f4a9c3" : "#fff4ac";
  return (
    <g pointerEvents="none">
      <g className="cloud-drift" fill="#fff" opacity=".62">
        <ellipse cx="120" cy="100" rx="60" ry="18" /><circle cx="100" cy="85" r="25" /><circle cx="135" cy="82" r="31" />
        <ellipse cx="1020" cy="90" rx="54" ry="16" /><circle cx="1000" cy="78" r="22" /><circle cx="1031" cy="74" r="27" />
      </g>
      <g className="ambient-sparkles" fill="#fff4ac">
        <path d="M360 390l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" /><path d="M790 280l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
      </g>
      <g className="village-npcs" stroke="#604c3f" strokeWidth="3">
        <g transform="translate(450 500)"><circle cy="-11" r="8" fill="#f2c69b" /><path d="M-10 20V0h20v20" fill="#7aa8cc" /><path d="M-6 20v13m12-13v13" /></g>
        <g transform="translate(730 420)"><circle cy="-11" r="8" fill="#d8a77f" /><path d="M-10 20V0h20v20" fill="#dc9a72" /><path d="M-6 20v13m12-13v13" /></g>
      </g>
      <g className="child-avatar-scene" transform="translate(585 500)" stroke="#604c3f" strokeWidth="3">
        <circle cy="-18" r="13" fill={avatar?.avatar_color ?? "#75a876"} />
        <path d="M-15 24V-2h30v26" fill={avatar?.avatar_color ?? "#75a876"} />
        <path d="M-9 24v18m18-18v18" />
        <circle cy="-18" r="5" fill={seasonalColor} stroke="none" />
      </g>
    </g>
  );
}
