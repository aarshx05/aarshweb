import { useEffect } from 'react'

/**
 * Adds `.is-visible` to every `.reveal` element as it enters the viewport.
 *
 * Re-runs whenever `ready` flips so elements rendered after the content
 * fetch resolves are observed too. Elements are unobserved once revealed —
 * the animation is a one-shot, not a scroll-linked effect.
 */
export function useReveal(ready) {
  useEffect(() => {
    if (!ready) return undefined

    const targets = document.querySelectorAll('.reveal:not(.is-visible)')

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      targets.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ready])
}
