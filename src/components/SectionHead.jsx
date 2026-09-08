/**
 * Shared section header.
 *
 * `accent` renders in the display serif — one italic phrase per section keeps
 * the page from reading as an undifferentiated wall of Inter.
 */
export default function SectionHead({ index, eyebrow, title, accent, lede }) {
  return (
    <header className="section-head reveal">
      <p className="eyebrow">
        {index && <span className="eyebrow-num">{index}</span>}
        {eyebrow}
      </p>

      <h2 className="section-title">
        {title}
        {accent && (
          <>
            {' '}
            <em className="display">{accent}</em>
          </>
        )}
      </h2>

      {lede && <p className="section-lede">{lede}</p>}
    </header>
  )
}
