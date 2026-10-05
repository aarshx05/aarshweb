/** Slow, thin band of one-line facts. Pauses on hover; the copy is aria-hidden. */
export default function Marquee({ items = [] }) {
  if (!items.length) return null

  const run = (hidden) => (
    <ul className="marquee-run" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <li key={`${it.type}-${i}`}>
          <b>{it.type}</b>
          <span>{it.text}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="marquee" aria-label="Highlights">
      <div className="marquee-track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  )
}
