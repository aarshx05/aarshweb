const COLORS = {
  primary: '#6d7cff',
  accent: '#4ab3d8',
  green: '#3ecf8e',
  warning: '#e0a138',
  danger: '#f87171',
}

export default function ActivityTicker({ items = [] }) {
  if (!items?.length) return null

  // Duplicated once so the -50% keyframe loops seamlessly.
  const track = [...items, ...items]

  return (
    <div className="ticker" aria-label="Highlights">
      <div className="ticker-track">
        {track.map((item, i) => (
          <span className="ticker-item" key={i} aria-hidden={i >= items.length}>
            <span
              className="ticker-dot"
              style={{ background: COLORS[item.color] || COLORS.primary }}
            />
            <span className="ticker-type">{item.type}</span>
            <span>{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
