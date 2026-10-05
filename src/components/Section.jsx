import { sectionOf } from '../lib/sections'

/**
 * Every chapter: a sticky left rail ("[01] about") beside the body, rather than
 * a label strip above it. On narrow screens the rail collapses to one line.
 */
export default function Section({ id, meta, tone, children }) {
  const s = sectionOf(id)
  return (
    <section id={id} className={`section${tone ? ` tone-${tone}` : ''}`} aria-label={s.label}>
      <div className="wrap sec">
        <aside className="rail">
          <span className="mono rail-n">[{s.n}]</span>
          <span className="rail-t">{s.label}</span>
          {meta && <span className="mono rail-m">{meta}</span>}
        </aside>
        <div className="sec-body">{children}</div>
      </div>
    </section>
  )
}
