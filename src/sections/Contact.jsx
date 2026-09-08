import SectionHead from '@/components/SectionHead'

const PATHS = {
  email: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  github: (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ),
  writing: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  link: (
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
  ),
}

function iconFor(name = '') {
  const n = name.toLowerCase()
  if (n.includes('email') || n.includes('mail')) return PATHS.email
  if (n.includes('linkedin')) return PATHS.linkedin
  if (n.includes('github')) return PATHS.github
  if (n.includes('medium') || n.includes('blog')) return PATHS.writing
  if (n.includes('hackme') || n.includes('try')) return PATHS.shield
  return PATHS.link
}

export default function Contact({ data }) {
  if (!data) return null

  const socials = Array.isArray(data.socials) ? data.socials : []
  const focusAreas = Array.isArray(data.focusAreas) ? data.focusAreas : []

  return (
    <section className="section" id="contact">
      <div className="container">
        <SectionHead
          index="08"
          eyebrow="Contact"
          title="Let's"
          accent="talk."
          lede="Open to research collaboration, security engineering work, and conversations about securing agentic AI."
        />

        <div className="contact-grid">
          <div className="channels reveal">
            {socials.map((social) => (
              <a
                className="channel"
                key={social.name}
                href={social.href}
                target={social.href?.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
              >
                <span className="channel-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {iconFor(social.name)}
                  </svg>
                </span>
                <span className="channel-text">
                  <span className="channel-name">{social.name}</span>
                  <span className="channel-handle">{social.handle}</span>
                </span>
                <svg className="channel-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            ))}
          </div>

          {focusAreas.length > 0 && (
            <div className="reveal reveal-1">
              <p className="subhead">Currently interested in</p>
              <ul className="focus-list">
                {focusAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
