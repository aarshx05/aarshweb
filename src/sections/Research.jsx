import Section from '../components/Section'
import Dots from '../components/Dots'
import { ArrowUpRight } from '../components/Icons'

export default function Research({ data }) {
  const papers = Array.isArray(data) ? data : []

  return (
    <Section id="research" meta="Papers & Ongoing Work">
      <h2 className="display reveal">
        <Dots text="Research & Publications." />
      </h2>

      <ul className="papers">
        {papers.map((r) => {
          const live = r.link && r.link !== '#'
          const Tag = live ? 'a' : 'div'
          const props = live ? { href: r.link, target: '_blank', rel: 'noopener noreferrer' } : {}
          return (
            <li key={r.title} className="reveal">
              <Tag className={`paper card${live ? ' is-link' : ''}`} {...props}>
                <span className="mono paper-k">
                  {r.date} · {r.publishedIn}
                </span>
                <span className="paper-title">{r.title}</span>
                <span className="paper-sub">{r.subtitle}</span>
                <span className="paper-desc">{r.desc}</span>
                {live && <ArrowUpRight className="paper-go" width={18} height={18} />}
              </Tag>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
