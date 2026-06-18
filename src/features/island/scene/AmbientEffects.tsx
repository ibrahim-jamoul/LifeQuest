import type { ChildProfile } from "../../../lib/api/client";

export function AmbientEffects({ season, avatar }: { season: string; avatar?: ChildProfile }) {
  const seasonalColor = season === "Autumn" ? "#df985b" : season === "Winter" ? "#dff5f5" : season === "Spring" ? "#f4a9c3" : "#fff4ac";

  return (
    <g pointerEvents="none">
      <image href="/assets/island/ambience/cloud-soft-01.png" x="25" y="38" width="140" height="87" opacity=".74" />
      <image href="/assets/island/ambience/cloud-soft-01.png" x="980" y="58" width="132" height="82" opacity=".42" />
      <image href="/assets/island/ambience/hot-air-balloon.png" x="1088" y="150" width="78" height="104" />
      <image href="/assets/island/ambience/sailboat.png" x="45" y="625" width="111" height="87" />
      <image href="/assets/island/ambience/bird-flight-01.png" x="850" y="98" width="52" height="52" opacity=".8" />

      <g className="villager-fox" transform="translate(380 280)"><image href="/assets/island/villagers/villager-fox-front.png" x="-24" y="-36" width="48" height="48" /></g>
      <g className="villager-rabbit" transform="translate(340 545)"><image href="/assets/island/villagers/villager-rabbit-front.png" x="-22" y="-34" width="45" height="45" /></g>
      <g className="villager-bear" transform="translate(985 530)"><image href="/assets/island/villagers/villager-bear-front.png" x="-24" y="-36" width="48" height="48" /></g>

      <g className="child-avatar-scene" transform="translate(585 500)" stroke="#604c3f" strokeWidth="3">
        <circle cy="-18" r="13" fill={avatar?.avatar_color ?? "#75a876"} />
        <path d="M-15 24V-2h30v26" fill={avatar?.avatar_color ?? "#75a876"} />
        <path d="M-9 24v18m18-18v18" />
        <circle cy="-18" r="5" fill={seasonalColor} stroke="none" />
      </g>
    </g>
  );
}
