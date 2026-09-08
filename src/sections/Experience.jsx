import { useState } from 'react'
import SectionHead from '@/components/SectionHead'
import LogoMark from '@/components/LogoMark'
import { parseDescription, isCurrent } from '@/lib/content'

const VISIBLE_BULLETS = 3

function Role({ job }) {
  const [expanded, setExpanded] = useState(false)
  const { intro, bullets } = parseDescription(job.description)
  const current = isCurrent(job.period)
  const tags = Array.isArray(job.tags) ? job.tags : []

  const shown = expanded ? bullets : bullets.slice(0, VISIBLE_BULLETS)
  const hidden = bullets.length - shown.length

  return (
    <article className="tl-item reveal">
      <div className="tl-aside">
        <p className="tl-period">{job.period}</p>
        {current && (
          <p className="tl-active">
            <span className="status-dot" aria-hidden="true" />
            CURRENT
          </p>
        )}
      </div>

      <div>
        <div className="tl-head">
          <LogoMark
            src={job.image}
            plate={job.logoPlate}
            letter={job.icon}
            name={job.company}
          />
          <div>
            <h3 className="tl-company">{job.company}</h3>
            <p className="tl-role">{job.role}</p>
          </div>
        </div>

        {intro && <p className="tl-intro">{intro}</p>}

        {shown.length > 0 && (
          <ul className="tl-bullets">
            {shown.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        )}

        {bullets.length > VISIBLE_BULLETS && (
          <button type="button" className="tl-more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? '— show less' : `+ ${hidden} more`}
          </button>
        )}

        {tags.length > 0 && (
          <div className="chip-row tl-tags">
            {tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default function Experience({ data }) {
  if (!data?.length) return null

  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead
          index="02"
          eyebrow="Experience"
          title="Where I've"
          accent="worked."
          lede="Security engineering across enterprise AI infrastructure, product security, applied research, and founding a venture."
        />

        <div className="timeline">
          {data.map((job, i) => (
            <Role key={job.id || `${job.company}-${i}`} job={job} />
          ))}
        </div>
      </div>
    </section>
  )
}
