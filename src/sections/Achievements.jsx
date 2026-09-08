import SectionHead from '@/components/SectionHead'

export default function Achievements({ data }) {
  if (!data) return null

  const awards = Array.isArray(data.achievements) ? data.achievements : []
  const certifications = Array.isArray(data.certifications) ? data.certifications : []

  if (!awards.length && !certifications.length) return null

  return (
    <section className="section" id="achievements">
      <div className="container">
        <SectionHead
          index="06"
          eyebrow="Recognition"
          title="Awards &"
          accent="recognition."
        />

        {awards.length > 0 && (
          <>
            <p className="subhead reveal">Awards</p>
            <div className="card-grid" style={{ marginBottom: 56 }}>
              {awards.map((award, i) => (
                <article className={`award reveal reveal-${i % 3}`} key={award.title} data-spotlight>
                  <p className="award-meta">
                    {award.org} · {award.date}
                  </p>
                  <h4>{award.title}</h4>
                  {award.desc && <p>{award.desc}</p>}
                </article>
              ))}
            </div>
          </>
        )}

        {certifications.length > 0 && (
          <>
            <p className="subhead reveal">Certifications</p>
            <div className="certs reveal">
              {certifications.map((cert) => (
                <div className="cert" key={cert.name}>
                  <span className="cert-name">{cert.name}</span>
                  <span className="cert-meta">
                    {cert.issuer} · {cert.date}
                  </span>
                  {cert.credentialUrl && (
                    <a
                      className="link"
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Verify ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
