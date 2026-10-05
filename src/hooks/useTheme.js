import { useCallback, useState } from 'react'

const KEY = 'aarsh-theme-v2'
const META = { light: '#f3f0ea', dark: '#0e0f0e' }

const current = () =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'

/**
 * Theme lives on <html data-theme>. index.html sets it before first paint, so
 * this hook only has to mirror it into React and handle toggling. Storage is
 * wrapped in try/catch — private windows and blocked storage must not break it.
 */
export function useTheme() {
  const [theme, setTheme] = useState(current)

  const apply = useCallback((next) => {
    document.documentElement.setAttribute('data-theme', next)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[next])
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage unavailable — the choice just won't persist */
    }
    setTheme(next)
  }, [])

  const toggle = useCallback(() => apply(current() === 'dark' ? 'light' : 'dark'), [apply])

  return { theme, toggle }
}
