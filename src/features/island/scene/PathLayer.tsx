const paths = [
  "M570 430C470 380 370 330 285 245",
  "M570 430C570 340 575 270 580 205",
  "M570 430C700 425 785 450 875 500",
  "M570 430C520 500 520 560 555 625",
  "M570 430C410 455 315 490 250 545",
  "M875 500C930 410 950 315 955 220",
  "M875 500C880 580 870 640 850 690",
];
export function PathLayer() {
  return (
    <g fill="none" strokeLinecap="round">
      {paths.map((path) => <path key={path} d={path} stroke="#8d724a" strokeWidth="34" opacity=".25" />)}
      {paths.map((path) => <path key={`top-${path}`} d={path} stroke="#e5c98c" strokeDasharray="8 7" strokeWidth="26" />)}
    </g>
  );
}
