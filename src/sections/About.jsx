import SectionHead from '@/components/SectionHead'

export default function About({ data }) {
  if (!data) return null

  const bio = Array.isArray(data.bio) ? data.bio : []
  const highlights = Array.isArray(data.highlights) ? data.highlights : []
  const hasAside = highlights.length > 0 || data.quote

  // "Practitioner. Researcher. Founder." -> the last word carries the serif.
  const words = String(data.heading || 'About').trim().split(/\s+/)
  const accent = words.length > 1 ? words.pop() : null
  const title = words.join(' ')

  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHead index="01" eyebrow="About" title={title} accent={accent} />

        <div className={`about-grid${hasAside ? '' : ' is-single'}`}>
          <div className="prose reveal">
            {bio.map((paragraph, i) => (
              // Bios are authored in the admin panel and may contain <strong>.
              <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
          </div>

          {hasAside && (
            <aside className="about-aside reveal reveal-1">
              {highlights.length > 0 && (
                <dl className="facts">
                  {highlights.map((h) => (
                    <div className="fact" key={h.label}>
                      <dt>{h.label}</dt>
                      <dd dangerouslySetInnerHTML={{ __html: h.value }} />
                    </div>
                  ))}
                </dl>
              )}

              {data.quote && <blockquote className="quote">{data.quote}</blockquote>}
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
