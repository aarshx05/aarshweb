import Section from '../components/Section'
import Dots from '../components/Dots'
import Motif from '../components/Motif'
import { ArrowUpRight } from '../components/Icons'

function Entry({ p, i }) {
  const href = p.link || p.github
  const Tag = href ? 'a' : 'div'
  const props = href
    ? { href, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${p.name} (opens in a new tab)` }
    : {}

  return (
    <li className="reveal">
      <Tag className={`entry${href ? ' is-link' : ''}`} {...props}>
        <span className="mono entry-n">{String(i + 1).padStart(2, '0')}</span>

        <span className="entry-main">
          <span className="entry-name">
            {p.name}
            {p.featured && <em className="tag-now">Featured</em>}
          </span>
          <span className="entry-desc">{p.desc}</span>
          <span className="mono entry-tags">{p.tags?.join(' / ')}</span>
        </span>

        <span className="entry-side" aria-hidden="true">
          <span className="entry-motif">
            <Motif index={i} />
          </span>
          <span className="entry-go">{href ? <ArrowUpRight width={20} height={20} /> : <span className="mono">Private</span>}</span>
        </span>
      </Tag>
    </li>
  )
}

export default function Projects({ data }) {
  const projects = Array.isArray(data) ? data : []
  // Featured work leads; order within each group is the order in content.json.
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)]

  return (
    <Section id="work" meta={`${projects.length} Projects`}>
      <h2 className="display reveal">
        <Dots text="Things I've Built To Find What Breaks." />
      </h2>

      <ul className="ledger">
        {ordered.map((p, i) => (
          <Entry key={p.id || p.name} p={p} i={i} />
        ))}
      </ul>
    </Section>
  )
}
