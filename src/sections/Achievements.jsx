import Section from '../components/Section'
import Dots from '../components/Dots'
import { ArrowUpRight } from '../components/Icons'

export default function Achievements({ data }) {
  const awards = data?.achievements || []
  const certs = data?.certifications || []

  return (
    <Section id="recognition" meta={`${awards.length} Highlights`}>
      <h2 className="display reveal">
        <Dots text="Awards & Certifications." />
      </h2>

      <ul className="awards">
        {awards.map((a) => (
          <li key={a.title} className="card award reveal">
            <span className="mono award-k">
              {a.date} · {a.org}
            </span>
            <h3 className="award-t">{a.title}</h3>
            <p>{a.desc}</p>
          </li>
        ))}
      </ul>

      {certs.length > 0 && (
        <div className="certs reveal">
          <p className="mono certs-h">Certifications</p>
          <ul>
            {certs.map((c) => {
              const Tag = c.credentialUrl ? 'a' : 'span'
              const props = c.credentialUrl
                ? { href: c.credentialUrl, target: '_blank', rel: 'noopener noreferrer' }
                : {}
              return (
                <li key={c.name}>
                  <Tag className="cert" {...props}>
                    <b>{c.name}</b>
                    <span className="mono">
                      {c.issuer} · {c.date}
                    </span>
                    {c.credentialUrl && <ArrowUpRight />}
                  </Tag>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Section>
  )
}
