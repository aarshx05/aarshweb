import { ArrowUpRight } from './Icons'

const longDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function Footer({ content, profile }) {
  const { hero, contact } = content
  const links = (contact?.socials || []).filter((s) => s.href && !s.href.startsWith('mailto:'))
  const tagline = (hero?.tagline || 'curious by default.').replace(/\.$/, '')

  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <p className="mono">
          © {new Date().getFullYear()} {hero?.name} — <span className="cap">{tagline}</span>
          <span className="dot">.</span>
          {profile?.updated && (
            <>
              {' '}
              Updated <time dateTime={profile.updated}>{longDate(profile.updated)}</time>
            </>
          )}
        </p>
        <ul className="footer-links">
          {links.slice(0, 4).map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="me noopener noreferrer">
                {s.name} <ArrowUpRight />
              </a>
            </li>
          ))}
          <li>
            <a href="/resume/">Résumé</a>
          </li>
          <li>
            <a href="/llms.txt" title="A plain-text brief of this profile for AI assistants">
              llms.txt
            </a>
          </li>
          <li>
            <a href="#top">Top ↑</a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
