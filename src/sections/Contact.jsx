import Section from '../components/Section'
import Dots from '../components/Dots'
import { ArrowDown, ArrowUpRight } from '../components/Icons'
import { findSocial } from '../lib/sections'
import { quickFacts } from '../lib/profile'

export default function Contact({ data, profile }) {
  const email = findSocial(data, /email/i)
  const others = (data?.socials || []).filter((s) => s !== email)
  // Role, availability, location, education: what a recruiter checks first.
  // Facts that are not filled in under "profile" in content.json do not show.
  const facts = profile ? quickFacts(profile) : []
  const pdf = profile?.resume?.pdf ? new URL(profile.resume.pdf).pathname : ''

  return (
    <Section id="contact" tone="accent" meta="Open To Good Problems">
      <h2 className="display display-xl reveal">
        <Dots text={data?.heading || "Let's Build Something Worth Securing."} />
      </h2>

      {email && (
        <a className="mega-mail reveal" href={email.href}>
          <span>{email.handle}</span>
          <ArrowUpRight width={34} height={34} />
        </a>
      )}

      {facts.length > 0 && (
        <div className="hire reveal">
          <p className="mono contact-k">{profile.openTo.active ? 'Hiring? The Short Version' : 'The Short Version'}</p>
          <dl className={`hire-facts${facts.length % 3 ? ' is-2' : ''}`}>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="hire-actions">
            <a className="btn btn-inv" href="/resume/">
              Résumé <ArrowUpRight />
            </a>
            {pdf && (
              <a className="btn" href={pdf} download>
                Download PDF <ArrowDown />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="contact-grid">
        <div className="reveal">
          <p className="mono contact-k">Currently Interested In</p>
          <ul className="focus">
            {data?.focusAreas?.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="reveal reveal-1">
          <p className="mono contact-k">Find Me</p>
          <ul className="socials">
            {others.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="me noopener noreferrer">
                  <span className="mono">{s.name}</span>
                  <span className="socials-h">{s.handle}</span>
                  <ArrowUpRight />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
