import { useEffect } from 'react'

/**
 * Writes the cursor position into `--mx` / `--my` on any `[data-spotlight]`
 * element the pointer is over, so CSS can paint a soft highlight that tracks
 * the mouse.
 *
 * One delegated pointermove on the document handles every card, and updates
 * are coalesced into an animation frame — no per-card listeners, no layout
 * reads during the move.
 */
export function useSpotlight(ready) {
  useEffect(() => {
    if (!ready) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    if (!window.matchMedia?.('(hover: hover)').matches) return undefined

    let frame = 0
    let pending = null

    const paint = () => {
      frame = 0
      if (!pending) return
      const { el, x, y } = pending
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
      pending = null
    }

    const onMove = (e) => {
      const el = e.target instanceof Element ? e.target.closest('[data-spotlight]') : null
      if (!el) return
      const rect = el.getBoundingClientRect()
      pending = { el, x: e.clientX - rect.left, y: e.clientY - rect.top }
      if (!frame) frame = requestAnimationFrame(paint)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ready])
}
