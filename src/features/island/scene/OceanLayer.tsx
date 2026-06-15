export function OceanLayer() {
  return (
    <g>
      <rect width="1200" height="800" fill="url(#oceanGradient)" />
      <rect className="water-texture" width="1200" height="800" fill="url(#waterTexture)" opacity=".38" />
      <image className="water-sparkles" href="/assets/island/ambience/water-sparkle-cluster.png" x="42" y="90" width="145" height="145" opacity=".72" />
      <image className="water-sparkles water-sparkles-delayed" href="/assets/island/ambience/water-sparkle-cluster.png" x="1010" y="360" width="125" height="125" opacity=".65" />
      <image className="water-sparkles" href="/assets/island/ambience/water-sparkle-cluster.png" x="170" y="635" width="110" height="110" opacity=".54" />
    </g>
  );
}
