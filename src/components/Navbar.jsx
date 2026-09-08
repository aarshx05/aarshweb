import { useEffect, useRef, useState } from 'react'

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#research', label: 'Research' },
  { href: '#achievements', label: 'Awards' },
  { href: '#writing', label: 'Writing' },
]

export default function Navbar({ content }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const progressRef = useRef(null)
  const drawerRef = useRef(null)

  const socials = Array.isArray(content?.contact?.socials) ? content.contact.socials : []
  const contactHref = socials.find((s) => /email/i.test(s.name))?.href || '#contact'
  const name = content?.hero?.name || 'Aarsh Chaurasia'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 1)
    .join('')

  useEffect(() => {
    let frame = 0

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 24)

        // Reading progress across the whole document.
        const max = document.documentElement.scrollHeight - window.innerHeight
        if (progressRef.current) {
          const ratio = max > 0 ? Math.min(y / max, 1) : 0
          progressRef.current.style.transform = `scaleX(${ratio})`
        }

        // Active link: the last section whose top has passed the fold line.
        let current = ''
        for (const link of LINKS) {
          const el = document.querySelector(link.href)
          if (el && y >= el.offsetTop - 140) current = link.href
        }
        setActive(current)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Lock the page behind the mobile drawer, and let Escape close it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''

    // A closed drawer is only translated off-screen, so without this its
    // links stay reachable by Tab.
    const drawer = drawerRef.current
    if (drawer) {
      if (open) drawer.removeAttribute('inert')
      else drawer.setAttribute('inert', '')
    }

    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <nav className="nav-inner" aria-label="Primary">
          <a href="#main" className="nav-logo">
            <span className="nav-mark" aria-hidden="true">
              {initials}
            </span>
            {name}
          </a>

          <ul className="nav-links">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`nav-link${active === link.href ? ' is-active' : ''}`}
                  aria-current={active === link.href ? 'true' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href={contactHref} className="btn btn-primary nav-cta">
                Get in touch
              </a>
            </li>
          </ul>

          <button
            type="button"
            className={`nav-toggle${open ? ' is-open' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </nav>

        <div className="nav-progress" ref={progressRef} style={{ transform: 'scaleX(0)' }} />
      </header>

      {open && <div className="nav-scrim" onClick={() => setOpen(false)} />}

      <div ref={drawerRef} className={`nav-drawer${open ? ' is-open' : ''}`}>
        <ul>
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={active === link.href ? 'is-active' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={contactHref} className="btn btn-primary" onClick={() => setOpen(false)}>
          Get in touch
        </a>
      </div>
    </>
  )
}
