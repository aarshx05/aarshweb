import { ArrowUpRight } from './Icons'

export default function Footer({ content }) {
  const { hero, contact } = content
  const links = (contact?.socials || []).filter((s) => s.href && !s.href.startsWith('mailto:'))
  const tagline = (hero?.tagline || 'curious by default.').replace(/\.$/, '')

  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <p className="mono">
          © {new Date().getFullYear()} {hero?.name} — <span className="cap">{tagline}</span>
          <span className="dot">.</span>
        </p>
        <ul className="footer-links">
          {links.slice(0, 4).map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.name} <ArrowUpRight />
              </a>
            </li>
          ))}
          <li>
            <a href="#top">Top ↑</a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
