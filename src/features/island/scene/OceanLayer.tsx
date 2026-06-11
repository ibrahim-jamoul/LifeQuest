export function OceanLayer() {
  return (
    <g>
      <rect width="1200" height="800" fill="url(#oceanGradient)" />
      <g className="ocean-waves" fill="none" stroke="#d8fbf5" strokeLinecap="round" opacity=".42">
        {[[80, 110], [250, 55], [480, 100], [790, 65], [1030, 115], [90, 690], [330, 745], [725, 720], [1060, 660]].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y}q18-12 36 0t36 0`} strokeWidth="4" />
        ))}
      </g>
      <g className="water-sparkles" fill="#fff7d3" opacity=".7">
        <circle cx="1080" cy="360" r="3" /><circle cx="102" cy="410" r="3" /><circle cx="715" cy="92" r="2.5" />
      </g>
    </g>
  );
}
