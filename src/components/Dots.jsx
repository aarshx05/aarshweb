/** Renders text with every full stop in the accent colour — the site's one typographic signature. */
export default function Dots({ text = '' }) {
  const parts = String(text).split('.')
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && <span className="dot">.</span>}
    </span>
  ))
}
