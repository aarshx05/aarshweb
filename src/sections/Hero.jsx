import { stripTags } from '@/lib/content'
import { useSiteContent } from '@/context/ContentContext'
import LogoMark from '@/components/LogoMark'

export default function Hero({ data }) {
  const content = useSiteContent()
  if (!data) return null

  const [first, ...rest] = String(data.name || '').split(' ')
  const badges = Array.isArray(data.cardBadges) ? data.cardBadges : []
  const stats = Array.isArray(data.stats) ? data.stats : []
  const current = badges[0]

  // Credibility strip, drawn from the roles that actually have a mark.
  const marks = (Array.isArray(content?.experience) ? content.experience : [])
    .filter((job) => job.image)
    .slice(0, 6)

  return (
    <section className="section hero" id="home">
      <div className="container">
        <div className="hero-grid">
          <div>
            {current && (
              <p className="status reveal">
                <span className="status-dot" aria-hidden="true" />
                {current.title}
              </p>
            )}

            <h1 className="hero-title reveal reveal-1">
              {first}
              <br />
              <span className="hero-title-last">{rest.join(' ')}</span>
            </h1>

            {data.eyebrow && <p className="hero-role reveal reveal-1">{data.eyebrow}</p>}

            <p className="hero-lede reveal reveal-2">{stripTags(data.subtitle || '')}</p>

            <div className="hero-actions reveal reveal-2">
              <a href="#experience" className="btn btn-primary">
                View experience
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#projects" className="btn">
                Projects
              </a>
            </div>
          </div>

          <div className="hero-aside reveal reveal-2">
            <figure className="hero-portrait">
              <img src={data.image || '/aarsh.jpg'} alt={data.name} width="290" height="362" />
            </figure>

            {badges.length > 0 && (
              <ul className="hero-badges">
                {badges.map((badge, i) => (
                  <li className="hero-badge" key={i}>
                    <span
                      className="hero-badge-dot"
                      style={{ background: badge.dot || 'var(--accent)' }}
                      aria-hidden="true"
                    />
                    <span className="hero-badge-text">
                      {badge.title}
                      {badge.sub && <span className="hero-badge-sub">{badge.sub}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <dl className="hero-stats reveal reveal-3">
            {stats.map((stat, i) => (
              <div className="stat" key={i}>
                <dt className="stat-num">{stat.num}</dt>
                <dd className="stat-label">{stat.label}</dd>
              </div>
            ))}
          </dl>
        )}

        {marks.length > 0 && (
          <div className="logo-strip reveal reveal-3">
            <span className="logo-strip-label">Worked with</span>
            <ul>
              {marks.map((job) => (
                <li key={job.id} title={job.company}>
                  <LogoMark
                    src={job.image}
                    plate={job.logoPlate}
                    letter={job.icon}
                    name={job.company}
                    size="sm"
                  />
                  <span className="sr-only">{job.company}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
