import { useRef, useState } from 'react'
import Section from '../components/Section'
import Dots from '../components/Dots'
import LogoMark from '../components/LogoMark'
import { ArrowUpRight } from '../components/Icons'
import { isCurrent, parseDescription } from '../lib/content'

/**
 * Master–detail: the company list stays put while the right-hand panel swaps.
 * Built as a proper tablist, so arrow keys move through the roles.
 *
 * Every role's panel is in the DOM and the inactive ones are `hidden`, rather
 * than only the selected one being rendered. Search engines index the rendered
 * page, so a panel that is not in the DOM is a role they never see.
 */
export default function Experience({ data }) {
  const rows = Array.isArray(data) ? data : []
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])

  if (!rows.length) return null

  const panels = rows.map((r) => parseDescription(r.description))

  const onKeyDown = (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    if (!(e.key in keys) && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    let next = active
    if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = rows.length - 1
    else next = (active + keys[e.key] + rows.length) % rows.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <Section id="experience" tone="band" meta={`${rows.length} Roles`}>
      <h2 className="display reveal">
        <Dots text="Where I've Worked. Built. Led." />
      </h2>

      <div className="xp reveal">
        <div className="xp-list" role="tablist" aria-orientation="vertical" aria-label="Roles" onKeyDown={onKeyDown}>
          {rows.map((r, i) => (
            <button
              key={r.id || `${r.company}-${i}`}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`xp-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`xp-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              className={`xp-tab${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <LogoMark src={r.image} srcLight={r.imageLight} plate={r.logoPlate} letter={r.icon} name={r.company} />
              <span className="xp-tab-t">
                <span className="xp-tab-co">{r.company}</span>
                <span className="mono xp-tab-when">{r.period}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="xp-panels">
          {rows.map((job, i) => {
            const { intro, heading, bullets } = panels[i]
            return (
              <article
                key={job.id || `${job.company}-${i}`}
                id={`xp-panel-${i}`}
                className="xp-panel card"
                role="tabpanel"
                aria-labelledby={`xp-tab-${i}`}
                tabIndex={0}
                hidden={i !== active}
              >
                <p className="mono xp-panel-when">
                  {job.period}
                  {isCurrent(job.period) && <em className="tag-now">Now</em>}
                </p>
                <h3 className="xp-role">{job.role}</h3>
                <p className="xp-at">@ {job.company}</p>

                {intro && <p className="xp-intro">{intro}</p>}

                {bullets.length > 0 && (
                  <>
                    {heading && <p className="mono xp-sub">{heading}</p>}
                    <ul className="xp-bullets">
                      {bullets.map((b, k) => (
                        <li key={k}>{b}</li>
                      ))}
                    </ul>
                  </>
                )}

                {job.tags?.length > 0 && (
                  <ul className="chips">
                    {job.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      </div>

      <a className="more-link reveal" href="/resume/">
        Every Role On One Page <ArrowUpRight />
      </a>
    </Section>
  )
}
