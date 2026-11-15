/**
 * prerender.mjs — runs after `vite build` (see package.json "build").
 *
 * The site is a client-rendered React app. On its own, dist/index.html would be
 * an empty <div id="root">, and anything that does not run JavaScript (GPTBot,
 * ClaudeBot, PerplexityBot, most recruiter-sourcing scrapers, link previewers)
 * would see only the <title>. This script turns content.json into what a
 * machine needs:
 *
 *   index.html       head (meta, Open Graph, schema.org JSON-LD) + the full
 *                    profile as semantic HTML inside #root (React replaces it)
 *   llms.txt         short Markdown brief + links, for AI assistants
 *   llms-full.txt    the complete profile in Markdown
 *   robots.txt, sitemap.xml, 404.html
 *
 * All of it derives from src/lib/profile.js, which the React app uses too.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  SITE,
  buildProfile,
  buildJsonLd,
  headTags,
  openSentence,
  quickFacts,
} from '../src/lib/profile.js'

const DIST = 'dist'
const content = JSON.parse(readFileSync(join(DIST, 'content.json'), 'utf8'))

// ---------------------------------------------------------------- helpers
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** For JSON embedded in a <script>: never let the payload close the tag. */
const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c')
const pretty = (u = '') => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
const a = (href, text) => `<a href="${esc(href)}">${esc(text ?? pretty(href))}</a>`
const time = (iso, text) => (iso ? `<time datetime="${esc(iso)}">${esc(text)}</time>` : esc(text))
const period = (j) => {
  const [from = '', to = ''] = String(j.period).split(/\s*[–—]\s*/)
  return `${time(j.start, from)}${to ? ` – ${time(j.end, to)}` : ''}`
}
const list = (items, cls = '') => (items.length ? `<ul${cls ? ` class="${cls}"` : ''}>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '')
const squeeze = (html) => html.replace(/\n\s*\n/g, '\n')

/** When the profile data last changed: the last commit that touched content.json, else today. */
function lastUpdated() {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', 'public/content.json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  } catch {}
  return new Date().toISOString().slice(0, 10)
}
const updated = lastUpdated()
const updatedLong = new Date(`${updated}T00:00:00Z`).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

// ============================================================ renderers
function renderHead(profile, opts) {
  const { title, meta, link } = headTags(profile, opts)
  return [
    `<title>${esc(title)}</title>`,
    ...meta.map((m) => `<meta ${m.name ? `name="${m.name}"` : `property="${m.property}"`} content="${esc(m.content)}" />`),
    ...link.map((l) => `<link rel="${l.rel}"${l.type ? ` type="${l.type}"` : ''}${l.title ? ` title="${esc(l.title)}"` : ''} href="${esc(l.href)}" />`),
  ].join('\n    ')
}

const factsHtml = (profile) =>
  `<dl class="facts">${quickFacts(profile).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`

// ------------------------------------------------- home: body inside #root
function renderHomeBody(profile) {
  const hero = content.hero || {}
  return squeeze(`
<div class="prerendered">
<header>
  <h1>${esc(profile.name)}</h1>
  <p><strong>${esc(profile.headline || profile.eyebrow)}</strong>${profile.headline && profile.eyebrow ? ` — ${esc(profile.eyebrow)}` : ''}</p>
  <p>${esc(profile.summary)}</p>
  ${openSentence(profile) ? `<p><strong>${esc(openSentence(profile))}</strong></p>` : ''}
  ${factsHtml(profile)}
  <p>Contact: ${profile.email ? a(`mailto:${profile.email}`, profile.email) : ''} · ${a('/llms.txt', 'Profile for AI assistants (llms.txt)')}</p>
  ${String(hero.subtitle || '').split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('')}
</header>
<main>
<section id="about">
  <h2>About</h2>
  ${profile.bio.map((p) => `<p>${esc(p)}</p>`).join('')}
</section>
<section id="experience">
  <h2>Experience</h2>
  ${profile.jobs.map((j) => `<article>
    <h3>${esc(j.role)} — ${esc(j.company)}</h3>
    <p>${period(j)}</p>
    ${j.intro ? `<p>${esc(j.intro)}</p>` : ''}
    ${list(j.bullets.map(esc))}
    ${j.tags.length ? `<p>${j.tags.map(esc).join(' · ')}</p>` : ''}
  </article>`).join('')}
</section>
<section id="work">
  <h2>Projects</h2>
  ${profile.projects.map((p) => `<article>
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.desc)}</p>
    ${p.tags.length ? `<p>${p.tags.map(esc).join(' · ')}</p>` : ''}
    ${p.url ? `<p>${a(p.url)}</p>` : ''}
    ${p.repo ? `<p>${a(p.repo, 'Source code')}</p>` : ''}
  </article>`).join('')}
</section>
<section id="research">
  <h2>Research</h2>
  ${profile.research.map((r) => `<article>
    <h3>${r.url ? a(r.url, r.title) : esc(r.title)}</h3>
    <p>${[r.subtitle, r.venue, r.date].filter(Boolean).map(esc).join(' · ')}</p>
    <p>${esc(r.desc)}</p>
  </article>`).join('')}
</section>
<section id="skills">
  <h2>Skills</h2>
  ${profile.skills.map((g) => `<h3>${esc(g.label)}</h3><p>${g.items.map(esc).join(', ')}</p>`).join('')}
</section>
<section id="recognition">
  <h2>Achievements</h2>
  ${list(profile.awards.map((x) => `<strong>${esc(x.title)}</strong> — ${esc([x.org, x.date].filter(Boolean).join(', '))}. ${esc(x.desc)}`))}
  ${profile.certs.length ? `<h3>Certifications</h3>${list(profile.certs.map((x) => `${esc(x.name)} — ${esc([x.issuer, x.date].filter(Boolean).join(', '))}`))}` : ''}
  ${profile.certsInProgress.length ? `<p>In progress: ${profile.certsInProgress.map((x) => `${esc(x.name)} (${esc(x.issuer)})`).join(', ')}</p>` : ''}
</section>
<section id="writing">
  <h2>Writing</h2>
  ${list(profile.writing.map((b) => `${b.url ? a(b.url, b.title) : esc(b.title)}${b.date ? ` (${time(b.iso, b.date)})` : ''}${b.desc ? ` — ${esc(b.desc)}` : ''}`))}
</section>
<section id="contact">
  <h2>Contact</h2>
  <address>
  ${list([
    profile.email && `Email: ${a(`mailto:${profile.email}`, profile.email)}`,
    ...profile.links.map((l) => `${esc(l.name)}: <a rel="me" href="${esc(l.url)}">${esc(pretty(l.url))}</a>`),
  ].filter(Boolean))}
  </address>
  <p>Last updated ${time(updated, updatedLong)}.</p>
</section>
</main>
</div>`)
}

// ------------------------------------------------------------ Markdown
function mdFacts(profile) {
  return [
    ...quickFacts(profile).map(([k, v]) => `- **${k}:** ${v}`),
    profile.email && `- **Email:** ${profile.email}`,
    ...profile.links.filter((l) => /linkedin|github/i.test(l.name)).map((l) => `- **${l.name}:** ${l.url}`),
    `- **Last updated:** ${updated}`,
  ].filter(Boolean)
}

function renderLlms(profile) {
  const md = [`# ${profile.name}`, '', `> ${profile.summary}`, '']
  if (openSentence(profile)) md.push(openSentence(profile), '')
  md.push(
    `This file is a short brief about ${profile.name} for AI assistants, agents and recruiters. Everything here is also on ${SITE}/ and is kept in sync with it.`,
    '',
    '## Quick facts',
    '',
    ...mdFacts(profile),
    '',
    '## Full profile',
    '',
    `- [Complete profile (Markdown)](${SITE}/llms-full.txt): every role with its contributions, plus projects, research, awards, certifications and skills`,
    `- [Website](${SITE}/)`,
    '',
    '## Experience',
    '',
    ...profile.jobs.map((j) => `- **${j.role}, ${j.company}** (${j.period}): ${j.intro}`),
    '',
    '## Selected projects',
    '',
    ...profile.projects.map((p) => `- **${p.name}**: ${p.desc}${p.url || p.repo ? ` (${p.url || p.repo})` : ''}`),
    '',
    '## Recognition',
    '',
    ...profile.awards.map((x) => `- **${x.title}** (${[x.org, x.date].filter(Boolean).join(', ')})`)
  )
  if (profile.writing.length) md.push('', '## Writing', '', ...profile.writing.map((b) => `- [${b.title}](${b.url || SITE})${b.date ? ` (${b.date})` : ''}`))
  md.push('', '## Contact and profiles', '')
  if (profile.email) md.push(`- Email: ${profile.email}`)
  md.push(...profile.links.map((l) => `- ${l.name}: ${l.url}`))
  return md.join('\n') + '\n'
}

function renderLlmsFull(profile) {
  const md = [`# ${profile.name}${profile.headline ? ` — ${profile.headline}` : ''}`, '', `> ${profile.summary}`, '']
  if (openSentence(profile)) md.push(openSentence(profile), '')
  md.push(...mdFacts(profile), '')
  if (profile.bio.length) md.push('## About', '', ...profile.bio.flatMap((p) => [p, '']))
  if (profile.focusAreas.length) md.push('## Current focus', '', ...profile.focusAreas.map((f) => `- ${f}`), '')
  md.push('## Experience', '')
  for (const j of profile.jobs) {
    md.push(`### ${j.role} — ${j.company}`, '', `${j.period}`, '')
    if (j.intro) md.push(j.intro, '')
    if (j.bullets.length) md.push(...j.bullets.map((b) => `- ${b}`), '')
    if (j.tags.length) md.push(`Areas: ${j.tags.join(', ')}`, '')
  }
  if (profile.education.length) {
    md.push('## Education', '')
    for (const e of profile.education) md.push(`- **${e.degree}**, ${e.institution} (${[e.start, e.end].filter(Boolean).join('–')})${[e.status, e.grade].filter(Boolean).length ? ` — ${[e.status, e.grade].filter(Boolean).join(', ')}` : ''}`)
    md.push('')
  }
  md.push('## Projects', '')
  for (const p of profile.projects) md.push(`### ${p.name}`, '', p.desc, '', ...(p.tags.length ? [`Areas: ${p.tags.join(', ')}`, ''] : []), ...(p.url || p.repo ? [`Link: ${p.url || p.repo}`, ''] : []))
  if (profile.research.length) {
    md.push('## Research', '')
    for (const r of profile.research) md.push(`- **${r.title}** (${[r.venue, r.date].filter(Boolean).join(', ')}): ${r.desc}${r.url ? ` ${r.url}` : ''}`)
    md.push('')
  }
  md.push('## Awards', '', ...profile.awards.map((x) => `- **${x.title}** (${[x.org, x.date].filter(Boolean).join(', ')}): ${x.desc}`), '')
  if (profile.certs.length || profile.certsInProgress.length) {
    md.push('## Certifications', '', ...profile.certs.map((x) => `- ${x.name} — ${[x.issuer, x.date].filter(Boolean).join(', ')}`))
    md.push(...profile.certsInProgress.map((x) => `- ${x.name} — ${x.issuer} (in progress, not yet held)`), '')
  }
  md.push('## Skills', '', ...profile.skills.map((g) => `- **${g.label}:** ${g.items.join(', ')}`), '')
  if (profile.writing.length) md.push('## Writing', '', ...profile.writing.map((b) => `- [${b.title}](${b.url || SITE})${b.date ? ` (${b.date})` : ''}${b.desc ? `: ${b.desc}` : ''}`), '')
  md.push('## Contact and profiles', '', `- Website: ${SITE}/`)
  if (profile.email) md.push(`- Email: ${profile.email}`)
  md.push(...profile.links.map((l) => `- ${l.name}: ${l.url}`))
  return md.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}

// ================================================================ write
const indexPath = join(DIST, 'index.html')
const shell = readFileSync(indexPath, 'utf8')
for (const needle of ['<div id="root"></div>', '<!-- seo:start -->', '<!-- seo:end -->']) {
  if (!shell.includes(needle)) throw new Error(`prerender: ${needle} not found in dist/index.html`)
}

const profile = buildProfile(content, { updated })

// ---- index.html
const head = [
  renderHead(profile),
  `<script type="application/ld+json" id="person-jsonld">${safeJson(buildJsonLd(profile))}</script>`,
].join('\n    ')
const index = shell
  .replace(/<!-- seo:start -->[\s\S]*<!-- seo:end -->/, () => head)
  .replace('<html lang="en"', () => `<html lang="en" data-updated="${updated}"`)
  .replace(
    '<div id="root"></div>',
    // The inline copy of content.json lets React render on the first tick instead of after a second request.
    () => `<div id="root">${renderHomeBody(profile)}</div>\n    <script type="application/json" id="site-content">${safeJson(content)}</script>`
  )
writeFileSync(indexPath, index)
// GitHub Pages serves 404.html for unknown paths; keep it out of the index.
writeFileSync(join(DIST, '404.html'), index.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex" />'))

// ---- for AI assistants
writeFileSync(join(DIST, 'llms.txt'), renderLlms(profile))
writeFileSync(join(DIST, 'llms-full.txt'), renderLlmsFull(profile))

// ---- crawlers
writeFileSync(
  join(DIST, 'robots.txt'),
  `# ${SITE.replace('https://', '')} — personal site of ${profile.name}.
# Everyone is welcome here: search engines, AI search, AI assistants and AI training crawlers.
# (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended,
#  Applebot-Extended, CCBot and the rest all fall under the rule below.)
#
# Machine-readable profile:  ${SITE}/llms.txt  ·  ${SITE}/llms-full.txt

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: ${SITE}/sitemap.xml
`
)
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${updated}</lastmod></url>
</urlset>
`
)

if (!existsSync(join(DIST, 'CNAME'))) console.warn('prerender: no dist/CNAME (custom domain) — is public/CNAME missing?')
console.log(`prerender: index.html, 404.html, llms.txt, llms-full.txt, robots.txt, sitemap.xml — profile last updated ${updated}`)
