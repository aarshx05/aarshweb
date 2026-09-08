import SectionHead from '@/components/SectionHead'

const isUpcoming = (venue = '') => /upcoming|in review|submitted/i.test(venue)

export default function Research({ data }) {
  if (!data?.length) return null

  return (
    <section className="section" id="research">
      <div className="container">
        <SectionHead
          index="05"
          eyebrow="Research"
          title="Published &"
          accent="in progress."
          lede="Applied security research spanning mobile forensics, behavioural biometrics and next-generation networks."
        />

        <div className="card-grid">
          {data.map((paper, i) => (
            <article className={`card reveal reveal-${i % 3}`} key={paper.title} data-spotlight>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span className={`chip${isUpcoming(paper.publishedIn) ? '' : ' chip-accent'}`}>
                  {isUpcoming(paper.publishedIn) ? 'Upcoming' : 'Published'}
                </span>
                <span className="mono" style={{ marginLeft: 'auto' }}>
                  {paper.date}
                </span>
              </div>

              <h3 className="card-title">{paper.title}</h3>

              {paper.subtitle && (
                <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginBottom: 14 }}>
                  {paper.subtitle}
                </p>
              )}

              <p className="card-desc">{paper.desc}</p>

              <div className="card-foot">
                <span className="mono">{paper.publishedIn}</span>
                {paper.link && paper.link !== '#' && (
                  <a
                    className="link"
                    style={{ marginLeft: 'auto' }}
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
