import Section from '../components/Section'
import Dots from '../components/Dots'
import { safeInline } from '../lib/sections'

export default function About({ data, heroImage, name }) {
  const image = data.image || heroImage
  return (
    <Section id="about" meta="Security · AI · Founder">
      <h2 className="display reveal">
        <Dots text={data.heading} />
      </h2>

      <div className="bento">
        <div className="bento-bio reveal">
          {data.bio?.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: safeInline(p) }} />
          ))}
        </div>

        {image && (
          <figure className="portrait reveal reveal-1">
            <img src={image} alt={`Portrait of ${name}`} loading="lazy" decoding="async" />
          </figure>
        )}

        {data.highlights?.length > 0 && (
          <dl className={`bento-facts${data.highlights.length % 3 === 0 ? ' is-3' : ''}`}>
            {data.highlights.map((h) => {
              // A trailing "· CGPA …" is kept, but as a quiet footnote rather than part of the headline fact.
              const m = String(h.value).match(/^(.*?)\s*·\s*(CGPA.*)$/i)
              return (
                <div key={h.label} className="card reveal">
                  <dt className="mono">{h.label}</dt>
                  <dd>
                    {m ? m[1] : h.value}
                    {m && <span className="fact-note mono">{m[2]}</span>}
                  </dd>
                </div>
              )
            })}
          </dl>
        )}

        {data.quote && (
          <blockquote className="quote-card reveal">
            <span className="mono">// My Default Answer</span>
            <p>{data.quote}</p>
          </blockquote>
        )}

        {data.tags?.length > 0 && (
          <ul className="chips bento-tags reveal">
            {data.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}
