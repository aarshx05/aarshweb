/**
 * Small generative line drawings for the project tiles — fine strokes in
 * currentColor so the ledger entry recolours them on hover. Picked by index, so a
 * new project in content.json always gets one.
 */
const range = (n) => Array.from({ length: n }, (_, i) => i)

const MOTIFS = [
  // concentric rings, drifting off-centre
  () =>
    range(11).map((i) => <circle key={i} cx={92 + i * 1.6} cy={108 - i * 1.2} r={10 + i * 7.6} />),
  // a fan of rotated squares
  () =>
    range(9).map((i) => (
      <rect key={i} x="52" y="52" width="96" height="96" transform={`rotate(${i * 10} 100 100)`} />
    )),
  // ruled arc — the Möbius rulings, flattened
  () =>
    range(30).map((i) => {
      const a = (i / 29) * Math.PI
      return (
        <line
          key={i}
          x1={100 - Math.cos(a) * 78}
          y1={140 - Math.sin(a) * 78}
          x2={100 + Math.cos(a + 0.5) * 50}
          y2={60 + Math.sin(a + 0.5) * 50}
        />
      )
    }),
  // staircase of squares
  () =>
    range(6).map((i) => (
      <rect key={i} x={30 + i * 22} y={130 - i * 20} width="38" height="38" transform={`rotate(${-8 + i * 3} ${49 + i * 22} ${149 - i * 20})`} />
    )),
  // overlapping circles, one filled
  () => (
    <>
      <circle cx="78" cy="88" r="46" />
      <circle cx="122" cy="88" r="46" />
      <circle cx="100" cy="124" r="46" />
      <circle cx="100" cy="100" r="7" fill="currentColor" />
    </>
  ),
]

export default function Motif({ index = 0 }) {
  const Draw = MOTIFS[index % MOTIFS.length]
  return (
    <svg
      className="motif"
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
      aria-hidden="true"
      focusable="false"
    >
      <Draw />
    </svg>
  )
}
