import Section from '../components/Section'
import Dots from '../components/Dots'
import { ArrowUpRight } from '../components/Icons'

export default function Blogs({ data, mediumHref }) {
  const posts = Array.isArray(data) ? data : []

  return (
    <Section id="writing" tone="band" meta="Medium · we45">
      <h2 className="display reveal">
        <Dots text="Articles & Blog Posts." />
      </h2>

      <ul className="posts">
        {posts.map((b) => (
          <li key={b.link || b.title} className="reveal">
            <a className="post" href={b.link} target="_blank" rel="noopener noreferrer">
              <span className="mono post-date">{b.date}</span>
              <span className="post-main">
                <span className="post-title">{b.title}</span>
                <span className="post-desc">{String(b.desc || '').split(/\n{2,}/)[0]}</span>
              </span>
              <ArrowUpRight className="post-go" width={20} height={20} />
            </a>
          </li>
        ))}
      </ul>

      {mediumHref && (
        <a className="more-link reveal" href={mediumHref} target="_blank" rel="noopener noreferrer">
          All Writing <ArrowUpRight />
        </a>
      )}
    </Section>
  )
}
