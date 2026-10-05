import { useEffect, useRef } from 'react'
import { SECTIONS } from '../lib/sections'
import ThemeToggle from './ThemeToggle'
import { ArrowUpRight } from './Icons'

/** Wordmark, a mail shortcut, and a reading-progress hairline. Nothing else up here. */
export function TopBar({ name, email }) {
  const barRef = useRef(null)

  // Writes a transform straight to the node so scrolling never re-renders React.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const first = (name || 'Aarsh').split(' ')[0]

  return (
    <header className="topbar">
      <a href="#top" className="wordmark" aria-label={`${name} — back to top`}>
        {first}
        <span className="dot">.</span>
      </a>
      {email && (
        <a className="pill" href={`mailto:${email}`}>
          Say Hello <ArrowUpRight />
        </a>
      )}
      <div className="progress" aria-hidden="true">
        <span ref={barRef} />
      </div>
    </header>
  )
}

/** Floating bottom dock: section links and the theme switch in one pill. */
export function Dock({ activeId, theme, onToggleTheme }) {
  return (
    <nav className="dock" aria-label="Primary">
      <div className="dock-links">
        {SECTIONS.filter((s) => s.nav).map((s) => (
          <a key={s.id} href={`#${s.id}`} className={activeId === s.id ? 'is-active' : ''}>
            {s.label}
          </a>
        ))}
      </div>
      <span className="dock-sep" aria-hidden="true" />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </nav>
  )
}
