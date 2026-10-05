import { useEffect, useState } from 'react'

/** Id of the section currently crossing the middle of the viewport. */
export function useActiveSection(ids, ready) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (!ready || typeof IntersectionObserver === 'undefined') return undefined

    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => observer.observe(el))

    // Back above the first section (the hero) nothing is active.
    const onScroll = () => {
      const first = els[0]
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.5) setActive('')
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [ids, ready])

  return active
}
