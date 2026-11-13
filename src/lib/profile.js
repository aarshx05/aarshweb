/**
 * profile.js — one normalised view of content.json for everything that
 * describes Aarsh to a machine or a recruiter: <head> meta, schema.org JSON-LD,
 * the résumé page, resume.json, llms.txt.
 *
 * Pure functions, no DOM and no Node APIs, so the same code runs in the browser
 * (useDocumentMeta) and in the build (scripts/prerender.mjs). That is what keeps
 * the prerendered <head> and the one React writes at runtime identical.
 */
import { parseDescription, stripTags } from './content.js'

export const SITE = 'https://aarshc.me'

const arr = (v) => (Array.isArray(v) ? v : [])
const clean = (o) => {
  if (Array.isArray(o)) {
    const out = o.map(clean).filter((v) => v !== undefined)
    return out.length ? out : undefined
  }
  if (o && typeof o === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(o)) {
      const c = clean(v)
      if (c !== undefined) out[k] = c
    }
    return Object.keys(out).length ? out : undefined
  }
  return o === '' || o === null || o === undefined ? undefined : o
}

export const abs = (u = '') => (u && u.startsWith('/') ? SITE + u : u)
const realLink = (u) => (u && u !== '#' ? u : '')

// ------------------------------------------------------------------ dates
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** "Aug 2026" → "2026-08", "2024" → "2024", "Jun 16, 2025" → "2025-06-16". Anything else → "". */
export function isoDate(text = '') {
  const s = String(text).trim()
  let m = s.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})$/)
  if (m) {
    const i = MONTHS.indexOf(m[1].toLowerCase())
    if (i >= 0) return `${m[3]}-${String(i + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`
  }
  m = s.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/)
  if (m) {
    const i = MONTHS.indexOf(m[1].toLowerCase())
    if (i >= 0) return `${m[2]}-${String(i + 1).padStart(2, '0')}`
  }
  m = s.match(/^(\d{4})(-\d{2})?(-\d{2})?$/)
  return m ? s : ''
}

/** "Aug 2026 – Present" → { start: "2026-08", end: "", current: true }. */
export function parsePeriod(period = '') {
  const [a = '', b = ''] = String(period).split(/\s*[–—-]\s*|\s+to\s+/i)
  const current = /present|current|now|ongoing/i.test(b)
  return { start: isoDate(a), end: current ? '' : isoDate(b), current }
}

const IN_PROGRESS = /prepar|progress|pursuing|upcoming|planned/i

// ---------------------------------------------------------------- profile
/**
 * Everything downstream reads this, never content.json directly.
 * `updated` is an ISO date (yyyy-mm-dd) for "last updated" / dateModified.
 */
export function buildProfile(content = {}, { updated = '', resumePdf = '' } = {}) {
  const hero = content.hero || {}
  const about = content.about || {}
  const seo = content.seo || {}
  const p = content.profile || {}
  const open = p.openTo || {}
  const socials = arr(content.contact?.socials)

  const emailEntry = socials.find((s) => /email/i.test(s.name) || String(s.href).startsWith('mailto:'))
  const email = emailEntry?.handle || ''
  const links = socials
    .filter((s) => s !== emailEntry && realLink(s.href))
    .map((s) => ({ name: s.name, handle: s.handle, url: s.href }))

  const jobs = arr(content.experience).map((e) => {
    const { intro, bullets } = parseDescription(e.description)
    return {
      company: e.company,
      role: e.role,
      period: e.period,
      ...parsePeriod(e.period),
      intro,
      bullets,
      tags: arr(e.tags),
      url: realLink(e.url),
    }
  })

  const certsAll = arr(content.achievements?.certifications).map((c) => ({
    name: c.name,
    issuer: c.issuer,
    date: c.date,
    url: realLink(c.credentialUrl),
    inProgress: IN_PROGRESS.test(String(c.date)),
  }))

  const name = hero.name || ''
  const [givenName, ...rest] = name.split(/\s+/)
  const loc = p.location || {}
  const locationText = [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
  const github = links.find((l) => /github/i.test(l.name))

  return {
    site: SITE,
    updated,
    name,
    givenName,
    familyName: rest.join(' '),
    handle: github?.handle || '',
    headline: p.headline || '',
    eyebrow: hero.eyebrow || '',
    tagline: hero.tagline || '',
    title: seo.title || name,
    description: seo.description || '',
    summary: p.summary || seo.description || '',
    keywords: seo.keywords || '',
    image: abs(hero.image || about.image || ''),
    ogImage: abs(seo.ogImage || hero.image || ''),
    ogImageAlt: seo.ogImageAlt || `${name}${p.headline ? `, ${p.headline}` : ''}`,
    verification: seo.verification || {},
    email,
    links,
    location: { ...loc, text: locationText },
    languages: arr(p.languages),
    openTo: {
      active: open.status === 'open',
      roles: arr(open.roles),
      types: arr(open.types),
      from: open.from || '',
      workModes: arr(open.workModes),
      relocation: open.relocation || '',
      note: open.note || '',
    },
    education: arr(p.education),
    bio: arr(about.bio).map(stripTags),
    focusAreas: arr(content.contact?.focusAreas),
    jobs,
    current: jobs.find((j) => j.current) || jobs[0],
    projects: arr(content.projects).map((x) => ({
      name: x.name,
      desc: stripTags(x.desc),
      tags: arr(x.tags),
      url: realLink(x.link),
      repo: realLink(x.github),
      featured: !!x.featured,
    })),
    research: arr(content.research).map((r) => ({
      title: r.title,
      subtitle: r.subtitle,
      venue: r.publishedIn,
      date: r.date,
      desc: stripTags(r.desc),
      url: realLink(r.link),
      published: !!r.publishedIn && !IN_PROGRESS.test(String(r.publishedIn)),
    })),
    awards: arr(content.achievements?.achievements).map((a) => ({
      title: a.title,
      org: a.org,
      date: a.date,
      desc: stripTags(a.desc),
    })),
    certs: certsAll.filter((c) => !c.inProgress),
    certsInProgress: certsAll.filter((c) => c.inProgress),
    skills: arr(content.skills).map((g) => ({ label: g.label, items: arr(g.skills) })),
    // Newest first, whatever order the site shows them in.
    writing: arr(content.blogs)
      .map((b) => ({
        title: b.title,
        date: b.date,
        iso: isoDate(b.date),
        url: realLink(b.link),
        desc: stripTags(String(b.desc || '').split(/\n{2,}/)[0]),
      }))
      .sort((x, y) => (y.iso || '').localeCompare(x.iso || '')),
    resume: {
      html: `${SITE}/resume/`,
      pdf: resumePdf ? abs(resumePdf) : '',
      json: `${SITE}/resume.json`,
      markdown: `${SITE}/llms-full.txt`,
    },
  }
}

/** One line a recruiter can act on: "Open to full-time AI Security Engineer roles from Jul 2027". */
export function openToLine(profile) {
  const o = profile.openTo
  if (!o.active) return ''
  const types = o.types.length ? o.types.join(' / ').toLowerCase() + ' ' : ''
  const roles = o.roles.length ? o.roles.slice(0, 3).join(', ') + ' roles' : 'roles'
  return `Open to ${types}${roles}${o.from ? ` from ${o.from}` : ''}`
}

/** Where and how: "Bengaluru, India · Remote / Hybrid · Open to relocation". */
export function whereLine(profile) {
  const o = profile.openTo
  return [profile.location.text, o.workModes.join(' / '), o.relocation].filter(Boolean).join(' · ')
}

/** Both of the above as one sentence, or "" when not looking: "Open to … from Jul 2027. Bengaluru, India · Remote." */
export function openSentence(profile) {
  const line = openToLine(profile)
  if (!line) return ''
  const where = whereLine(profile)
  return `${line}.${where ? ` ${where}.` : ''}`
}

/** Label/value pairs for the "at a glance" strip. Empty values are dropped, so nothing unconfirmed shows. */
export function quickFacts(profile) {
  const o = profile.openTo
  const edu = profile.education[0]
  return [
    o.active && o.roles.length ? ['Looking for', o.roles.join(' · ')] : ['Role', profile.headline],
    ['Available', o.active ? [o.types.join(' / '), o.from && `from ${o.from}`].filter(Boolean).join(', ') : ''],
    ['Based in', profile.location.text],
    ['Work mode', o.active ? [o.workModes.join(' / '), o.relocation].filter(Boolean).join(' · ') : ''],
    ['Now', profile.current ? `${profile.current.role}, ${profile.current.company}` : ''],
    ['Education', edu ? [edu.degree, edu.institution, edu.end && `class of ${edu.end}`].filter(Boolean).join(', ') : ''],
  ].filter(([, v]) => v)
}

// ------------------------------------------------------------------- head
/** Every <meta>/<link> the page needs, as plain data. Rendered to strings at build, applied to the DOM at runtime. */
export function headTags(profile, { path = '/', title, description, type = 'profile' } = {}) {
  const url = profile.site + path
  const t = title || profile.title
  const d = description || profile.description
  const v = profile.verification
  const meta = [
    { name: 'description', content: d },
    { name: 'author', content: profile.name },
    { name: 'keywords', content: profile.keywords },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: profile.name },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:url', content: url },
    { property: 'og:title', content: t },
    { property: 'og:description', content: d },
    { property: 'og:image', content: profile.ogImage },
    { property: 'og:image:alt', content: profile.ogImageAlt },
    { property: 'profile:first_name', content: profile.givenName },
    { property: 'profile:last_name', content: profile.familyName },
    { property: 'profile:username', content: profile.handle },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: t },
    { name: 'twitter:description', content: d },
    { name: 'twitter:image', content: profile.ogImage },
    { name: 'twitter:image:alt', content: profile.ogImageAlt },
    { name: 'google-site-verification', content: v.google },
    { name: 'msvalidate.01', content: v.bing },
    { name: 'yandex-verification', content: v.yandex },
  ].filter((m) => m.content)

  const link = [
    { rel: 'canonical', href: url },
    // Machine-readable versions of the same profile, for agents that look for them.
    { rel: 'alternate', type: 'text/markdown', title: 'Profile (Markdown, for AI assistants)', href: `${profile.site}/llms-full.txt` },
    { rel: 'alternate', type: 'application/json', title: 'Résumé (JSON Resume)', href: profile.resume.json },
    // rel="me" ties this site to the same person's other profiles.
    ...profile.links.map((l) => ({ rel: 'me', href: l.url })),
  ]
  return { title: t, meta, link }
}

// ---------------------------------------------------------------- JSON-LD
/**
 * schema.org graph: WebSite → ProfilePage → Person, plus the works the person
 * authored. Google reads ProfilePage/Person; LLM pipelines read all of it.
 */
export function buildJsonLd(profile) {
  const id = (frag) => `${profile.site}/#${frag}`
  const person = { '@id': id('person') }
  const o = profile.openTo

  const roleNode = (j, prop) => ({
    '@type': prop === 'worksFor' ? 'EmployeeRole' : 'OrganizationRole',
    roleName: j.role,
    startDate: j.start,
    endDate: j.end,
    description: j.intro,
    [prop]: { '@type': 'Organization', name: j.company, url: j.url },
  })

  const edu = profile.education.map((e) => ({
    '@type': 'CollegeOrUniversity',
    name: e.institution,
    url: e.url,
  }))

  const credentials = [
    ...profile.education.map((e) => ({
      '@type': 'EducationalOccupationalCredential',
      name: e.degree,
      credentialCategory: 'degree',
      educationalLevel: e.level,
      recognizedBy: { '@type': 'CollegeOrUniversity', name: e.institution },
      description: [e.start && e.end && `${e.start}–${e.end}`, e.status, e.grade].filter(Boolean).join(' · '),
    })),
    // Only certifications actually held — anything "preparing" is left out on purpose.
    ...profile.certs.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      credentialCategory: 'certification',
      recognizedBy: { '@type': 'Organization', name: c.issuer },
      dateCreated: isoDate(c.date),
      url: c.url,
    })),
  ]

  const skills = [...new Set(profile.skills.flatMap((g) => g.items))]

  const graph = [
    {
      '@type': 'WebSite',
      '@id': id('website'),
      url: `${profile.site}/`,
      name: profile.name,
      description: profile.description,
      inLanguage: 'en',
      publisher: person,
    },
    {
      '@type': 'ProfilePage',
      '@id': id('profilepage'),
      url: `${profile.site}/`,
      name: profile.title,
      description: profile.description,
      inLanguage: 'en',
      isPartOf: { '@id': id('website') },
      about: person,
      mainEntity: person,
      dateModified: profile.updated,
      primaryImageOfPage: profile.ogImage,
      hasPart: [
        { '@type': 'WebPage', '@id': profile.resume.html, url: profile.resume.html, name: `${profile.name} — Résumé` },
      ],
    },
    {
      '@type': 'Person',
      '@id': id('person'),
      name: profile.name,
      givenName: profile.givenName,
      familyName: profile.familyName,
      alternateName: profile.handle,
      url: `${profile.site}/`,
      mainEntityOfPage: { '@id': id('profilepage') },
      image: profile.image,
      description: profile.summary,
      email: profile.email ? `mailto:${profile.email}` : undefined,
      jobTitle: profile.headline || profile.current?.role,
      worksFor: profile.jobs.filter((j) => j.current).map((j) => roleNode(j, 'worksFor')),
      alumniOf: [...edu, ...profile.jobs.filter((j) => !j.current).map((j) => roleNode(j, 'alumniOf'))],
      hasOccupation: {
        '@type': 'Occupation',
        name: profile.headline || profile.current?.role,
        occupationalCategory: '15-1212.00', // O*NET-SOC: Information Security Analysts
        occupationLocation: profile.location.country ? { '@type': 'Country', name: profile.location.country } : undefined,
        skills: skills.join(', '),
      },
      hasCredential: credentials,
      knowsAbout: skills,
      knowsLanguage: profile.languages,
      award: profile.awards.map((a) => [a.title, a.org, a.date].filter(Boolean).join(' — ')),
      address: profile.location.text
        ? {
            '@type': 'PostalAddress',
            addressLocality: profile.location.city,
            addressRegion: profile.location.region,
            addressCountry: profile.location.countryCode || profile.location.country,
          }
        : undefined,
      // schema.org's way of saying "is looking for": a Demand.
      seeks: o.active
        ? {
            '@type': 'Demand',
            name: openToLine(profile),
            description: [openSentence(profile), o.note].filter(Boolean).join(' '),
          }
        : undefined,
      contactPoint: profile.email
        ? { '@type': 'ContactPoint', contactType: 'recruiting and collaboration', email: profile.email, url: `${profile.site}/#contact` }
        : undefined,
      sameAs: profile.links.map((l) => l.url),
    },
    ...profile.projects.map((x) => ({
      '@type': x.repo ? 'SoftwareSourceCode' : 'CreativeWork',
      name: x.name,
      description: x.desc,
      keywords: x.tags.join(', '),
      url: x.url || x.repo,
      codeRepository: x.repo,
      author: person,
    })),
    ...profile.research.map((r) => ({
      '@type': 'ScholarlyArticle',
      headline: r.title,
      name: r.title,
      abstract: r.desc,
      url: r.url,
      datePublished: r.published ? isoDate(r.date) : undefined,
      creativeWorkStatus: r.published ? 'Published' : 'In preparation',
      author: person,
    })),
    ...profile.writing.map((b) => ({
      '@type': 'BlogPosting',
      headline: b.title,
      url: b.url,
      datePublished: b.iso,
      description: b.desc,
      author: person,
    })),
  ]

  return clean({ '@context': 'https://schema.org', '@graph': graph })
}
