/**
 * Company mark for the timeline and the hero strip.
 *
 * Real logos live in /public/logos. Several are dark artwork on a transparent
 * background, so those get `plate` — a light tile behind the mark — instead of
 * disappearing into the dark UI. Anything without a usable logo falls back to
 * a letter tile rather than a broken image.
 */
export default function LogoMark({ src, plate, letter, name, size = 'md' }) {
  const className = `logo-mark logo-${size}${plate ? ' has-plate' : ''}`

  if (!src) {
    return (
      <span className={`${className} is-letter`} aria-hidden="true">
        {letter || (name || '?').charAt(0)}
      </span>
    )
  }

  return (
    <span className={className}>
      <img src={src} alt="" loading="lazy" decoding="async" />
    </span>
  )
}
