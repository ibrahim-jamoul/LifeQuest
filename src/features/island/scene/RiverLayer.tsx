export function RiverLayer() {
  return (
    <g>
      <path d="M700 115c-72 78-31 134-82 191-45 50-21 98 27 128 50 31 13 78-33 108-48 31-49 90 6 151" fill="none" stroke="#70c4cb" strokeWidth="74" strokeLinecap="round" />
      <path className="river-flow" d="M700 115c-72 78-31 134-82 191-45 50-21 98 27 128 50 31 13 78-33 108-48 31-49 90 6 151" fill="none" stroke="#b9ece6" strokeDasharray="12 22" strokeWidth="7" strokeLinecap="round" opacity=".6" />
      <ellipse cx="415" cy="465" rx="82" ry="50" fill="#6fc1c7" />
      <ellipse cx="415" cy="465" rx="59" ry="32" fill="#88d2d2" opacity=".65" />
    </g>
  );
}
