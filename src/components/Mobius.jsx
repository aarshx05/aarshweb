import { useEffect, useRef } from 'react'

/**
 * The mark from the LinkedIn banner, alive: a Möbius strip drawn as a ruled
 * surface — one hairline per step along the loop — with its single edge traced
 * on top and one stretch of that edge picked out in the accent colour.
 *
 *   P(u, v) = ( (1 + v·cos(u/2)) cos u,  (1 + v·cos(u/2)) sin u,  v·sin(u/2) )
 *
 * Colours come from CSS variables (--mobius-rgb / --accent-rgb) and are
 * re-read when the theme flips. The loop pauses off-screen and in hidden
 * tabs, and reduced-motion gets a single still frame.
 */
const RULINGS = 190
const EDGE_STEPS = 360
const HALF_WIDTH = 0.52
const TAU = Math.PI * 2

function project(u, v, rx, ry, cx, cy, scale) {
  const r = 1 + v * HALF_WIDTH * Math.cos(u / 2)
  let x = r * Math.cos(u)
  let y = r * Math.sin(u)
  let z = v * HALF_WIDTH * Math.sin(u / 2)

  // spin about the vertical axis, then tilt toward the viewer
  const cY = Math.cos(ry), sY = Math.sin(ry)
  const x1 = x * cY + z * sY
  const z1 = -x * sY + z * cY
  const cX = Math.cos(rx), sX = Math.sin(rx)
  const y2 = y * cX - z1 * sX
  const z2 = y * sX + z1 * cX
  x = x1
  y = y2
  z = z2

  const persp = 4.2 / (4.2 - z)
  return { x: cx + x * scale * persp, y: cy + y * scale * persp, z }
}

export default function Mobius({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1
    let raf = 0
    let onScreen = true
    let ink = '28,40,36'
    let accent = '196,86,43'

    // pointer parallax, eased
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    let spin = 0.5

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement)
      ink = cs.getPropertyValue('--mobius-rgb').trim() || ink
      accent = cs.getPropertyValue('--accent-rgb').trim() || accent
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      // fit the widest perspective-stretched extent inside the canvas
      const scale = Math.min(w / 3.4, h / 3.25)
      const cx = w / 2
      const cy = h / 2
      // sway rather than spin, so the loop always stays open to the viewer
      const ry = Math.sin(spin) * 0.42 + eased.x * 0.17
      const rx = -0.86 + eased.y * 0.11

      // rulings — the hairlines that make the surface read as a surface
      ctx.lineWidth = 0.6
      for (let i = 0; i < RULINGS; i++) {
        const u = (i / RULINGS) * TAU
        const a = project(u, -1, rx, ry, cx, cy, scale)
        const b = project(u, 1, rx, ry, cx, cy, scale)
        const depth = (a.z + b.z) / 2 // nearer strips sit a little darker
        const alpha = 0.16 + 0.26 * (0.5 + depth * 0.45)
        ctx.strokeStyle = `rgba(${ink}, ${Math.max(0.08, Math.min(0.5, alpha))})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // the single edge: two laps of u, so it closes on itself
      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(${ink}, 0.62)`
      ctx.beginPath()
      for (let i = 0; i <= EDGE_STEPS; i++) {
        const p = project((i / EDGE_STEPS) * TAU * 2, 1, rx, ry, cx, cy, scale)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()

      // the accent stretch
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.strokeStyle = `rgba(${accent}, 0.95)`
      ctx.beginPath()
      const from = Math.round(EDGE_STEPS * 0.14)
      const to = Math.round(EDGE_STEPS * 0.3)
      for (let i = from; i <= to; i++) {
        const p = project((i / EDGE_STEPS) * TAU * 2, 1, rx, ry, cx, cy, scale)
        if (i === from) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
      ctx.lineCap = 'butt'
    }

    let last = 0
    const frame = (t) => {
      raf = requestAnimationFrame(frame)
      if (!onScreen) return
      const dt = Math.min(48, t - last || 16)
      last = t
      spin += dt * 0.00032
      eased.x += (target.x - eased.x) * 0.06
      eased.y += (target.y - eased.y) * 0.06
      draw()
    }

    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    readColors()
    resize()
    draw()
    start()

    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
    })
    io.observe(canvas)

    const themeObserver = new MutationObserver(() => {
      readColors()
      draw()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`mobius ${className}`}
      role="img"
      aria-label="A slowly rotating Möbius strip drawn in fine lines"
    />
  )
}
