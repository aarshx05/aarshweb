import Section from '../components/Section'
import Dots from '../components/Dots'
import { ArrowUpRight } from '../components/Icons'
import { findSocial } from '../lib/sections'

export default function Contact({ data }) {
  const email = findSocial(data, /email/i)
  const others = (data?.socials || []).filter((s) => s !== email)

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
                <a href={s.href} target="_blank" rel="noopener noreferrer">
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
