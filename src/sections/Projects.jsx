import SectionHead from '@/components/SectionHead'

const IconCode = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const IconExternal = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

export default function Projects({ data }) {
  if (!data?.length) return null

  return (
    <section className="section" id="projects">
      <div className="container">
        <SectionHead
          index="03"
          eyebrow="Selected work"
          title="Things I've"
          accent="built."
          lede="Tools for threat modeling, agentic AI security, binary analysis and digital forensics."
        />

        <div className="card-grid">
          {data.map((project, i) => (
            <article className={`card reveal reveal-${i % 3}`} key={project.name} data-spotlight>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <h3 className="card-title" style={{ flex: 1 }}>
                  {project.name}
                </h3>
                {project.featured && <span className="chip chip-accent">Featured</span>}
              </div>

              <p className="card-desc">{project.desc}</p>

              <div className="chip-row" style={{ marginBottom: 4 }}>
                {(project.tags || []).map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              {(project.github || project.link) && (
                <div className="card-foot">
                  {project.github && (
                    <a className="link" href={project.github} target="_blank" rel="noopener noreferrer">
                      <IconCode />
                      Source
                    </a>
                  )}
                  {project.link && (
                    <a className="link" href={project.link} target="_blank" rel="noopener noreferrer">
                      <IconExternal />
                      Live
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
