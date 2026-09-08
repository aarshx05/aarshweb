import { useEffect } from 'react'

const SITE_URL = 'https://aarshc.me/'

function setMeta(name, value, attr = 'name') {
  if (!value) return
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/**
 * Keeps <title>, the social meta tags and Person structured data in sync with
 * content.json, so editing the site through /admin also updates what search
 * engines and link previews see.
 */
export function useDocumentMeta(content) {
  useEffect(() => {
    if (!content?.seo) return

    const { title, description, keywords, ogImage } = content.seo
    if (title) document.title = title

    setMeta('description', description)
    setMeta('keywords', keywords)
    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:image', ogImage, 'property')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', ogImage)

    const jobs = Array.isArray(content.experience) ? content.experience : []
    const socials = Array.isArray(content.contact?.socials) ? content.contact.socials : []
    const email = socials.find((s) => /email/i.test(s.name))?.handle

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: content.hero?.name,
      description,
      url: SITE_URL,
      image: content.hero?.image,
      email: email ? `mailto:${email}` : undefined,
      jobTitle: jobs[0]?.role,
      worksFor: jobs[0]?.company
        ? { '@type': 'Organization', name: jobs[0].company }
        : undefined,
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'National Forensic Sciences University',
      },
      knowsAbout: (Array.isArray(content.skills) ? content.skills : []).flatMap((c) =>
        Array.isArray(c.skills) ? c.skills.slice(0, 5) : []
      ),
      sameAs: socials.map((s) => s.href).filter((h) => h && !h.startsWith('mailto:')),
    }

    let script = document.getElementById('person-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.id = 'person-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
  }, [content])
}
