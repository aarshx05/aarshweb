/**
 * Company mark. Some logos are white artwork on transparency — fine on a dark
 * tile, invisible on a light one — so those ship a second file (`srcLight`) and
 * CSS swaps them with the theme. Others are dark artwork and use `plate`, a
 * light tile behind the mark. Anything without a logo falls back to a letter
 * tile rather than a broken image.
 */
export default function LogoMark({ src, srcLight, plate, letter, name }) {
  if (!src) {
    return (
      <span className="logo is-letter" aria-hidden="true">
        {letter || (name || '?').charAt(0)}
      </span>
    )
  }

  if (srcLight) {
    return (
      <span className="logo">
        <img className="logo-for-dark" src={src} alt="" loading="lazy" decoding="async" />
        <img className="logo-for-light" src={srcLight} alt="" loading="lazy" decoding="async" />
      </span>
    )
  }

  return (
    <span className={`logo${plate ? ' has-plate' : ''}`}>
      <img src={src} alt="" loading="lazy" decoding="async" />
    </span>
  )
}
