import Mobius from '../components/Mobius'
import { ArrowDown, ArrowUpRight } from '../components/Icons'
import { findSocial } from '../lib/sections'

/** "curious by default." → ["curious by", "default"] — the final stop is drawn separately. */
function titleLines(tagline) {
  const words = tagline.replace(/\.\s*$/, '').trim().split(/\s+/)
  if (words.length < 2) return [words.join(' ')]
  const last = words.pop()
  return [words.join(' '), last]
}

export default function Hero({ data, contact }) {
  const lines = titleLines(data.tagline || 'curious by default.')
  const email = findSocial(contact, /email/i)?.handle
  const badges = data.cardBadges || []

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="wrap hero-stage">
        <div className="hero-art">
          <Mobius />
        </div>

        <div className="hero-copy">
          <p className="mono hero-hi">
            <i className="pulse" aria-hidden="true" />
            Hi, I’m {data.name}
          </p>

          <h1 id="hero-title" className="hero-title">
            <span className="sr-only">{data.name} — </span>
            {lines.map((l, i) => (
              <span className="line" key={l} aria-hidden="true">
                <span style={{ '--i': i }}>
                  {l}
                  {i === lines.length - 1 && <span className="dot">.</span>}
                </span>
              </span>
            ))}
          </h1>

          <p className="mono hero-role">{data.eyebrow}</p>
          <div className="hero-sub">
            {String(data.subtitle || '')
              .split(/\n{2,}/)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>

          <div className="hero-actions">
            {email && (
              <a className="btn btn-solid" href={`mailto:${email}`}>
                Say Hello <ArrowUpRight />
              </a>
            )}
            <a className="btn" href="#work">
              See The Work <ArrowDown />
            </a>
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="wrap">
          <ul className="hero-now">
            {badges.map((b) => (
              <li key={b.title} className="card">
                <span className="mono hero-now-k">
                  <i className="dot-c" style={{ background: b.dot }} aria-hidden="true" />
                  {b.tag ? 'Now' : 'Also'}
                </span>
                <span className="hero-now-t">{b.title}</span>
                <span className="mono hero-now-s">{b.sub}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
