import Section from '../components/Section'
import Dots from '../components/Dots'

export default function Skills({ data }) {
  const groups = Array.isArray(data) ? data : []

  return (
    <Section id="skills" tone="band" meta={`${groups.length} Areas`}>
      <h2 className="display reveal">
        <Dots text="Skills & Technologies." />
      </h2>

      <div className="kit">
        {groups.map((g, i) => (
          <section key={g.label} className="card kit-card reveal" aria-label={g.label}>
            <h3 className="mono kit-h">
              <span>{String(i + 1).padStart(2, '0')}</span> {g.label}
            </h3>
            <ul className="chips">
              {g.skills?.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  )
}
