import type { ChildProfile } from "../../../lib/api/client";

export function AmbientEffects({ season, avatar }: { season: string; avatar?: ChildProfile }) {
  const seasonalColor = season === "Autumn" ? "#df985b" : season === "Winter" ? "#dff5f5" : season === "Spring" ? "#f4a9c3" : "#fff4ac";

  return (
    <g pointerEvents="none">
      <image className="cloud-drift" href="/assets/island/ambience/cloud-soft-01.png" x="25" y="38" width="190" height="118" opacity=".74" />
      <image className="cloud-drift cloud-drift-reverse" href="/assets/island/ambience/cloud-soft-02.png" x="950" y="48" width="180" height="112" opacity=".68" />
      <image className="balloon-float" href="/assets/island/ambience/hot-air-balloon.png" x="1050" y="142" width="105" height="140" />
      <image className="sailboat-rock" href="/assets/island/ambience/sailboat.png" x="45" y="610" width="150" height="118" />
      <image className="bird-flight" href="/assets/island/ambience/bird-flock.png" x="835" y="92" width="126" height="76" opacity=".8" />

      <g className="island-villager villager-fox" transform="translate(380 280)"><image href="/assets/island/villagers/villager-fox-idle.png" x="-32" y="-48" width="64" height="64" /></g>
      <g className="island-villager villager-rabbit" transform="translate(340 545)"><image href="/assets/island/villagers/villager-rabbit-idle.png" x="-30" y="-46" width="60" height="60" /></g>
      <g className="island-villager villager-bear" transform="translate(985 530)"><image href="/assets/island/villagers/villager-bear-idle.png" x="-32" y="-48" width="64" height="64" /></g>

      <g className="child-avatar-scene" transform="translate(585 500)" stroke="#604c3f" strokeWidth="3">
        <circle cy="-18" r="13" fill={avatar?.avatar_color ?? "#75a876"} />
        <path d="M-15 24V-2h30v26" fill={avatar?.avatar_color ?? "#75a876"} />
        <path d="M-9 24v18m18-18v18" />
        <circle cy="-18" r="5" fill={seasonalColor} stroke="none" />
      </g>
    </g>
  );
}
