/**
 * Ambient page background.
 *
 * Five layers, all alive:
 *   - three aurora fields that drift AND breathe on mismatched cycles
 *   - a grid that creeps by exactly one tile (so the loop is seamless)
 *   - a slow light sweep travelling down the page
 *   - a field of rising "signal" nodes
 *   - static grain on top to stop the dark fields from banding
 *
 * Everything animates with `transform` and `opacity` only, so the whole thing
 * stays on the compositor and never triggers layout or paint. It freezes
 * under prefers-reduced-motion.
 */

// [leftVw, size(px), driftX(vw), duration(s), delay(s), peakOpacity]
// Hand-picked rather than random so the field is stable across renders and
// the timings stay deliberately non-harmonic.
const NODES = [
  [4, 2, 3, 26, 0, 0.5],
  [11, 3, -2, 34, 6, 0.35],
  [18, 2, 4, 29, 13, 0.45],
  [24, 4, -3, 41, 3, 0.28],
  [31, 2, 2, 31, 19, 0.5],
  [38, 3, -4, 37, 9, 0.32],
  [45, 2, 3, 24, 22, 0.55],
  [52, 3, -2, 39, 15, 0.3],
  [58, 2, 5, 33, 2, 0.42],
  [65, 4, -3, 44, 26, 0.25],
  [71, 2, 2, 28, 11, 0.5],
  [78, 3, -5, 36, 20, 0.34],
  [84, 2, 3, 30, 5, 0.46],
  [90, 3, -2, 42, 30, 0.28],
  [96, 2, -4, 27, 17, 0.5],
]

export default function PageBackground() {
  return (
    <div className="page-bg" aria-hidden="true">
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      <div className="aurora aurora-3" />

      <div className="page-grid" />
      <div className="page-sweep" />

      <div className="node-field">
        {NODES.map(([left, size, dx, dur, delay, opacity], i) => (
          <span
            className="node"
            key={i}
            style={{
              left: `${left}vw`,
              '--size': `${size}px`,
              '--dx': `${dx}vw`,
              '--dur': `${dur}s`,
              '--delay': `-${delay}s`,
              '--peak': opacity,
            }}
          />
        ))}
      </div>

      <div className="page-grain" />
    </div>
  )
}
