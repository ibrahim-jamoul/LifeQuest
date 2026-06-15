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
      <g className="balloon-float" transform="translate(1080 180)">
        <path d="M0 22v18m-10 0h20l-4 11h-12Z" fill="#9A6743" stroke="#6B4F3A" strokeWidth="2"/>
        <path d="M0-42c28 0 38 38 0 64-38-26-28-64 0-64Z" fill="#E98F67" stroke="#6B4F3A" strokeWidth="3"/>
        <path d="M0-40v60M-17-33q17 15 34 0M-24-15q24 15 48 0" fill="none" stroke="#FFF6E5" strokeWidth="4"/>
      </g>
      <g transform="translate(105 650)" stroke="#6B4F3A" strokeWidth="3">
        <path d="M-42 10h84q-13 25-42 25t-42-25Z" fill="#FFF6E5"/><path d="M0 10v-58l36 44H0Z" fill="#F4A261"/><path d="M0 10v-40l-29 34H0Z" fill="#B98AE8"/>
      </g>
      <g fill="none" stroke="#FFF6E5" strokeLinecap="round" strokeWidth="3"><path d="M155 155q8-8 16 0m0 0q8-8 16 0M915 115q8-8 16 0m0 0q8-8 16 0"/></g>
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
