import SectionHead from '@/components/SectionHead'

export default function Blogs({ data }) {
  if (!data?.length) return null

  return (
    <section className="section" id="writing">
      <div className="container">
        <SectionHead
          index="07"
          eyebrow="Writing"
          title="Notes &"
          accent="articles."
          lede="Technical writing on applied cryptography, AI security and the practice of DevSecOps."
        />

        <div className="card-grid">
          {data.map((post, i) => (
            <article className={`card reveal reveal-${i % 3}`} key={post.title} data-spotlight>
              <p className="mono" style={{ marginBottom: 12 }}>
                {post.date}
              </p>

              <h3 className="card-title">
                {post.link ? (
                  <a href={post.link} target="_blank" rel="noopener noreferrer">
                    {post.title}
                  </a>
                ) : (
                  post.title
                )}
              </h3>

              <p className="card-desc" style={{ whiteSpace: 'pre-line' }}>
                {post.desc}
              </p>

              {post.link && (
                <div className="card-foot">
                  <a className="link" href={post.link} target="_blank" rel="noopener noreferrer">
                    Read article
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
