export function RiverLayer() {
  return (
    <g>
      <path d="M700 115c-72 78-31 134-82 191-45 50-21 98 27 128 50 31 13 78-33 108-48 31-49 90 6 151" fill="none" stroke="#70c4cb" strokeWidth="74" strokeLinecap="round" />
      <path className="river-flow" d="M700 115c-72 78-31 134-82 191-45 50-21 98 27 128 50 31 13 78-33 108-48 31-49 90 6 151" fill="none" stroke="#b9ece6" strokeDasharray="12 22" strokeWidth="7" strokeLinecap="round" opacity=".6" />
      <ellipse cx="415" cy="465" rx="82" ry="50" fill="#6fc1c7" />
      <ellipse cx="415" cy="465" rx="59" ry="32" fill="#88d2d2" opacity=".65" />
      <g transform="translate(690 126)">
        <path d="M-40-23q40 18 80 0v40q-40 20-80 0Z" fill="#8B8B82" opacity=".65"/>
        <path d="M-29-20q29 16 58 0v44q-29 24-58 0Z" fill="#8FE6F2" opacity=".88"/>
        <path className="river-flow" d="M-20-14v37M0-10v40M20-14v37" stroke="#D8FBF5" strokeWidth="5" strokeLinecap="round"/>
      </g>
    </g>
  );
}
