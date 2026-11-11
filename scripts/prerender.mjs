/**
 * prerender.mjs — runs after `vite build` (see package.json "build").
 *
 * The site is a client-rendered React app: dist/index.html ships an empty
 * <div id="root"> and the content arrives later from content.json. Crawlers that
 * don't run JavaScript (GPTBot, ClaudeBot, PerplexityBot, many SEO tools, link
 * previewers) would see nothing but the <title>.
 *
 * This script writes the SAME content from dist/content.json as plain semantic
 * HTML inside #root. Visitors with JavaScript get the normal React site (React
 * replaces #root on mount); crawlers get readable HTML. It also emits:
 *   - static Person JSON-LD in <head> (useDocumentMeta keeps updating it)
 *   - robots.txt (everyone allowed, including AI crawlers) + sitemap.xml
 *   - llms.txt (Markdown summary for AI assistants)
 *   - 404.html (GitHub Pages fallback for unknown paths)
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const SITE = 'https://aarshc.me'

const c = JSON.parse(readFileSync(join(DIST, 'content.json'), 'utf8'))
const arr = (v) => (Array.isArray(v) ? v : [])

// ---------------------------------------------------------------- helpers
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** Escape everything except <strong>, which the admin panel allows in bios. */
const inline = (s = '') => esc(s).replace(/&lt;(\/?)strong&gt;/g, '<$1strong>')
const plain = (s = '') => String(s).replace(/<\/?strong>/g, '')
const abs = (u = '') => (u.startsWith('/') ? SITE + u : u)
const realLink = (u) => u && u !== '#' ? u : ''
const BULLET = /^[•‣◦⁃\-*]\s*/

/** Experience descriptions are "intro\n\nheading\n\n• bullet\n\n• bullet". */
function descriptionHtml(text = '') {
  const blocks = String(text).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  const out = []
  let bullets = []
  const flush = () => {
    if (bullets.length) out.push(`<ul>${bullets.map((b) => `<li>${inline(b)}</li>`).join('')}</ul>`)
    bullets = []
  }
  for (const b of blocks) {
    if (BULLET.test(b)) bullets.push(b.replace(BULLET, ''))
    else { flush(); out.push(`<p>${inline(b)}</p>`) }
  }
  flush()
  return out.join('')
}
const tags = (t) => (arr(t).length ? `<p>${arr(t).map(esc).join(' · ')}</p>` : '')

// ------------------------------------------------------------ HTML content
const hero = c.hero || {}
const about = c.about || {}
const ach = c.achievements || {}
const socials = arr(c.contact?.socials)

const html = `
<div class="prerendered">
<header>
  <h1>${esc(hero.name)}</h1>
  ${hero.eyebrow ? `<p>${esc(hero.eyebrow)}</p>` : ''}
  ${hero.subtitle ? `<p>${inline(hero.subtitle)}</p>` : ''}
  ${arr(hero.stats).length ? `<ul>${arr(hero.stats).map((s) => `<li>${esc(s.num)} — ${esc(s.label)}</li>`).join('')}</ul>` : ''}
</header>
<main>
<section id="about">
  <h2>About</h2>
  ${about.heading ? `<h3>${esc(about.heading)}</h3>` : ''}
  ${arr(about.bio).map((p) => `<p>${inline(p)}</p>`).join('')}
  ${arr(about.highlights).length ? `<ul>${arr(about.highlights).map((h) => `<li><strong>${esc(h.label)}:</strong> ${esc(h.value)}</li>`).join('')}</ul>` : ''}
</section>
<section id="experience">
  <h2>Experience</h2>
  ${arr(c.experience).map((e) => `<article>
    <h3>${esc(e.role)} — ${esc(e.company)}</h3>
    <p>${esc(e.period)}</p>
    ${descriptionHtml(e.description)}
    ${tags(e.tags)}
  </article>`).join('')}
</section>
<section id="work">
  <h2>Projects</h2>
  ${arr(c.projects).map((p) => `<article>
    <h3>${esc(p.name)}</h3>
    <p>${inline(p.desc)}</p>
    ${tags(p.tags)}
    ${realLink(p.link) ? `<p><a href="${esc(p.link)}">${esc(p.link)}</a></p>` : ''}
    ${realLink(p.github) ? `<p><a href="${esc(p.github)}">Source code</a></p>` : ''}
  </article>`).join('')}
</section>
<section id="research">
  <h2>Research</h2>
  ${arr(c.research).map((r) => `<article>
    <h3>${realLink(r.link) ? `<a href="${esc(r.link)}">${esc(r.title)}</a>` : esc(r.title)}</h3>
    <p>${[r.subtitle, r.publishedIn, r.date].filter(Boolean).map(esc).join(' · ')}</p>
    <p>${inline(r.desc)}</p>
  </article>`).join('')}
</section>
<section id="skills">
  <h2>Skills</h2>
  ${arr(c.skills).map((g) => `<h3>${esc(g.label)}</h3><p>${arr(g.skills).map(esc).join(', ')}</p>`).join('')}
</section>
<section id="recognition">
  <h2>Achievements</h2>
  <ul>${arr(ach.achievements).map((a) => `<li><strong>${esc(a.title)}</strong> — ${esc([a.org, a.date].filter(Boolean).join(', '))}. ${inline(a.desc)}</li>`).join('')}</ul>
  ${arr(ach.certifications).length ? `<h3>Certifications</h3><ul>${arr(ach.certifications).map((x) => `<li>${esc(x.name)} — ${esc([x.issuer, x.date].filter(Boolean).join(', '))}</li>`).join('')}</ul>` : ''}
</section>
<section id="writing">
  <h2>Writing</h2>
  <ul>${arr(c.blogs).map((b) => `<li>${realLink(b.link) ? `<a href="${esc(b.link)}">${esc(b.title)}</a>` : esc(b.title)}${b.date ? ` (${esc(b.date)})` : ''}${b.desc ? ` — ${inline(b.desc)}` : ''}</li>`).join('')}</ul>
</section>
<section id="contact">
  <h2>Contact</h2>
  <ul>${socials.map((s) => `<li>${esc(s.name)}: ${realLink(s.href) ? `<a href="${esc(s.href)}">${esc(s.handle || s.href)}</a>` : esc(s.handle)}</li>`).join('')}</ul>
</section>
</main>
</div>`.replace(/\n\s*\n/g, '\n')

// ------------------------------------------------------------- JSON-LD
const jobs = arr(c.experience)
const email = socials.find((s) => /email/i.test(s.name))?.handle
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: hero.name,
  description: c.seo?.description,
  url: SITE + '/',
  image: hero.image ? abs(hero.image) : undefined,
  email: email ? `mailto:${email}` : undefined,
  jobTitle: jobs[0]?.role,
  worksFor: jobs[0]?.company ? { '@type': 'Organization', name: jobs[0].company } : undefined,
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'National Forensic Sciences University' },
  knowsAbout: arr(c.skills).flatMap((g) => arr(g.skills).slice(0, 5)),
  sameAs: socials.map((s) => s.href).filter((h) => h && !h.startsWith('mailto:')),
}
const jsonLdTag = `<script type="application/ld+json" id="person-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`

// ------------------------------------------------------- patch index.html
const indexPath = join(DIST, 'index.html')
let index = readFileSync(indexPath, 'utf8')
if (!index.includes('<div id="root"></div>')) throw new Error('prerender: <div id="root"></div> not found in dist/index.html')
index = index.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
const ogImage = c.seo?.ogImage ? abs(c.seo.ogImage) : ''
const extraHead = [
  jsonLdTag,
  c.seo?.keywords ? `<meta name="keywords" content="${esc(c.seo.keywords)}" />` : '',
  `<meta name="twitter:title" content="${esc(c.seo?.title || '')}" />`,
  `<meta name="twitter:description" content="${esc(c.seo?.description || '')}" />`,
].filter(Boolean).join('\n    ')
index = index.replace('</head>', `    ${extraHead}\n  </head>`)
// Social previews need absolute image URLs.
if (ogImage) index = index.replace(/(property="og:image" content=")\/[^"]*"/, `$1${ogImage}"`)
              .replace(/(property="twitter:image" content=")\/[^"]*"/, `$1${ogImage}"`)
writeFileSync(indexPath, index)
copyFileSync(indexPath, join(DIST, '404.html'))

// --------------------------------------------- robots / sitemap / llms.txt
writeFileSync(join(DIST, 'robots.txt'),
`# Everyone is welcome, including AI crawlers and assistants.
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`)

const today = new Date().toISOString().slice(0, 10)
writeFileSync(join(DIST, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod></url>
  <url><loc>${SITE}/llms.txt</loc><lastmod>${today}</lastmod></url>
</urlset>
`)

const md = []
md.push(`# ${plain(hero.name)}`, '', `> ${plain(c.seo?.description || hero.subtitle || '')}`, '')
if (arr(about.bio).length) md.push('## About', '', ...arr(about.bio).map((p) => plain(p) + '\n'))
if (arr(about.highlights).length) md.push(...arr(about.highlights).map((h) => `- **${h.label}:** ${h.value}`), '')
md.push('## Experience', '')
for (const e of jobs) md.push(`- **${e.role}**, ${e.company} (${e.period})`)
md.push('', '## Projects', '')
for (const p of arr(c.projects)) md.push(`- **${p.name}**: ${plain(p.desc)}${realLink(p.link) ? ` (${p.link})` : ''}`)
if (arr(c.research).length) {
  md.push('', '## Research', '')
  for (const r of arr(c.research)) md.push(`- **${r.title}** (${[r.publishedIn, r.date].filter(Boolean).join(', ')}): ${plain(r.desc)}`)
}
if (arr(ach.achievements).length) {
  md.push('', '## Achievements', '')
  for (const a of arr(ach.achievements)) md.push(`- **${a.title}** (${[a.org, a.date].filter(Boolean).join(', ')})`)
}
if (arr(c.skills).length) {
  md.push('', '## Skills', '')
  for (const g of arr(c.skills)) md.push(`- **${g.label}:** ${arr(g.skills).join(', ')}`)
}
if (arr(c.blogs).length) {
  md.push('', '## Writing', '')
  for (const b of arr(c.blogs)) md.push(`- [${b.title}](${realLink(b.link) || SITE})${b.date ? ` (${b.date})` : ''}`)
}
md.push('', '## Links', '', `- Website: ${SITE}/`)
for (const s of socials) md.push(`- ${s.name}: ${s.href?.startsWith('mailto:') ? s.handle : s.href}`)
writeFileSync(join(DIST, 'llms.txt'), md.join('\n') + '\n')

if (!existsSync(join(DIST, 'CNAME'))) console.warn('prerender: no dist/CNAME (custom domain) — is public/CNAME missing?')
console.log(`prerender: index.html (+${html.length} bytes of content), 404.html, robots.txt, sitemap.xml, llms.txt`)
