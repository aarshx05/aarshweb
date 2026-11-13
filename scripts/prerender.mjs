/**
 * prerender.mjs — runs after `vite build` (see package.json "build").
 *
 * The site is a client-rendered React app. On its own, dist/index.html would be
 * an empty <div id="root">, and anything that does not run JavaScript (GPTBot,
 * ClaudeBot, PerplexityBot, most recruiter-sourcing scrapers, link previewers)
 * would see only the <title>. This script turns content.json into everything a
 * machine or a recruiter might ask for:
 *
 *   index.html           head (meta, Open Graph, schema.org JSON-LD) + the full
 *                        profile as semantic HTML inside #root (React replaces it)
 *   resume/index.html    a static, printable résumé — every role on one page
 *   <Name>-Resume.pdf    that page printed by headless Chrome (when available)
 *   resume.json          the same data in the JSON Resume schema
 *   llms.txt             short Markdown brief + links, for AI assistants
 *   llms-full.txt        the complete profile in Markdown
 *   robots.txt, sitemap.xml, 404.html
 *
 * All of it derives from src/lib/profile.js, which the React app uses too.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, statSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  SITE,
  buildProfile,
  buildJsonLd,
  headTags,
  isoDate,
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
/** First sentence stays; the rest is wrapped as detail that the print stylesheet leaves out. */
const lead = (text = '') => {
  const m = String(text).match(/^(.*?[.!?])\s+(\S.*)$/s)
  return m ? `${esc(m[1])}<span class="more"> ${esc(m[2])}</span>` : esc(text)
}

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

const name = content.hero?.name || 'Resume'
const PDF_NAME = `${name.trim().replace(/\s+/g, '-')}-Resume.pdf`
const PDF_PATH = join(DIST, PDF_NAME)
/** A PDF dropped into public/ wins over the generated one. */
const pdfSupplied = existsSync(join('public', PDF_NAME))

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

const resumeLinks = (profile) =>
  [
    a('/resume/', 'Résumé (web page)'),
    profile.resume.pdf && a(`/${PDF_NAME}`, 'Résumé (PDF)'),
    a('/resume.json', 'Résumé (JSON)'),
    a('/llms.txt', 'Profile for AI assistants (llms.txt)'),
  ].filter(Boolean)

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
  <p>Contact: ${profile.email ? a(`mailto:${profile.email}`, profile.email) : ''} · ${resumeLinks(profile).join(' · ')}</p>
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

// --------------------------------------------------------- résumé page
/** Roles after this many are shown in full on screen but condensed to one line in the PDF. */
const FULL_ROLES_IN_PRINT = content.profile?.resumeFullRoles ?? 4

const RESUME_CSS = `
:root{color-scheme:light;--bg:#f4f1ea;--paper:#fbf9f4;--ink:#1d2220;--ink-2:rgba(29,34,32,.74);--ink-3:rgba(29,34,32,.54);--line:rgba(29,34,32,.14);--accent:#c65a2e;--accent-ink:#b04a22}
:root[data-theme=dark]{color-scheme:dark;--bg:#0e0f0e;--paper:#141615;--ink:#ebe7dd;--ink-2:rgba(235,231,221,.74);--ink-3:rgba(235,231,221,.52);--line:rgba(235,231,221,.14);--accent:#e2834f;--accent-ink:#e98d5b}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--ink);font:16px/1.58 'Geist','Helvetica Neue',Helvetica,Arial,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
a:hover{color:var(--accent-ink);text-decoration-color:currentColor}
:focus-visible{outline:2px solid var(--accent-ink);outline-offset:3px;border-radius:4px}
ul{list-style:none}
.mono,h2,.when,.facts dt,.tags{font-family:'Geist Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;letter-spacing:0}
.bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;max-width:908px;margin:0 auto;padding:22px 24px}
.bar a{text-decoration:none}
.home{font-size:22px;font-weight:500;letter-spacing:-.04em}
.dot{color:var(--accent)}
.actions{display:flex;flex-wrap:wrap;gap:8px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border:1px solid var(--line);border-radius:99px;background:var(--bg);color:var(--ink);font:500 13.5px/1.4 inherit;font-family:inherit;cursor:pointer;transition:background-color .18s,color .18s,border-color .18s}
.btn:hover{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn-solid{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn-solid:hover{background:var(--accent);border-color:var(--accent);color:#fff}
.sheet{max-width:860px;margin:6px auto 72px;padding:clamp(26px,6vw,68px);background:var(--paper);border:1px solid var(--line);border-radius:20px}
h1{font-size:clamp(38px,7vw,64px);font-weight:400;line-height:1;letter-spacing:-.052em}
.headline{margin-top:14px;color:var(--accent-ink)}
.contact{display:flex;flex-wrap:wrap;gap:4px 20px;margin-top:16px;font-size:14.5px;color:var(--ink-2)}
.lede{margin-top:26px;font-size:clamp(17px,2vw,19.5px);line-height:1.5;letter-spacing:-.015em}
.open{margin-top:14px;color:var(--ink-2)}
.open strong{color:var(--ink);font-weight:600}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0 28px;margin-top:26px}
.facts div{padding:12px 0;border-top:1px solid var(--line)}
.facts dt{color:var(--ink-3)}
.facts dd{margin-top:2px;font-size:15px;line-height:1.4}
section{margin-top:clamp(34px,5vw,52px)}
h2{padding-bottom:10px;border-bottom:1px solid var(--line);font-weight:500;color:var(--ink-3)}
.item{padding-top:20px;break-inside:avoid}
.item-h{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:2px 20px}
h3{font-size:18.5px;font-weight:500;letter-spacing:-.02em;line-height:1.3}
h3 span{font-weight:400;color:var(--accent-ink)}
.when{color:var(--ink-3);white-space:nowrap}
.item p{margin-top:6px;color:var(--ink-2);font-size:15.5px}
.bullets{display:grid;gap:6px;margin-top:10px}
.bullets li{position:relative;padding-left:20px;font-size:15px;line-height:1.58;color:var(--ink-2)}
.bullets li::before{content:'';position:absolute;left:0;top:.74em;width:10px;height:1.5px;background:var(--accent)}
.item .tags{margin-top:10px;color:var(--ink-3)}
.skills{display:grid;gap:10px;padding-top:18px}
.skills div{display:grid;grid-template-columns:220px minmax(0,1fr);gap:4px 20px}
.skills dt{font-weight:500;font-size:15px}
.skills dd{color:var(--ink-2);font-size:15px}
.plain{display:grid;gap:8px;padding-top:18px}
.plain li{font-size:15px;color:var(--ink-2)}
.plain b{font-weight:500;color:var(--ink)}
.foot{margin-top:clamp(34px,5vw,52px);padding-top:16px;border-top:1px solid var(--line);color:var(--ink-3)}
.print-only{display:none}
@media (max-width:640px){.skills div{grid-template-columns:minmax(0,1fr)}.when{white-space:normal}}
@page{size:A4;margin:9mm 12.5mm}
@media print{
  :root,:root[data-theme=dark]{color-scheme:light;--bg:#fff;--paper:#fff;--ink:#111;--ink-2:#222;--ink-3:#555;--line:#c9c9c9;--accent:#b04a22;--accent-ink:#9a3f1b}
  body{font:9pt/1.34 Arial,Helvetica,'Liberation Sans',sans-serif}
  .mono,h2,.when,.facts dt,.tags{font-family:inherit;font-size:8.6pt}
  .no-print{display:none!important}
  .print-only{display:revert}
  .sheet{max-width:none;margin:0;padding:0;border:0;border-radius:0}
  a{text-decoration:none}
  h1{font-size:23pt;letter-spacing:-.02em}
  .headline{margin-top:3pt;font-size:10.5pt;font-weight:600}
  .contact{margin-top:4pt;gap:0 12pt;font-size:9pt}
  .lede{margin-top:7pt;font-size:9.2pt;line-height:1.38;letter-spacing:0}
  .open{margin-top:3pt}
  .facts{display:none}
  section{margin-top:7.5pt}
  h2{break-after:avoid;padding-bottom:2pt;font-size:9.4pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#111;border-color:#111}
  .item{padding-top:4.5pt}
  h3{font-size:10pt;font-weight:700;letter-spacing:0}
  h3 span{font-weight:400}
  .item p{margin-top:1pt;font-size:9pt}
  .bullets{gap:1.5pt;margin-top:2.5pt}
  .bullets li{position:static;padding-left:9pt;text-indent:-9pt;font-size:9pt;line-height:1.34}
  .bullets li::before{content:'•';position:static;display:inline-block;width:9pt;height:auto;background:none;text-indent:0}
  .tags,.more,.brief .bullets,.brief>p{display:none}
  .brief{padding-top:2.5pt}
  .cols{display:block;columns:2;column-gap:20pt}
  .cols li{break-inside:avoid;margin-bottom:1.5pt}
  .skills{gap:1.5pt;padding-top:5pt}
  .skills div{display:block}
  .skills dt,.skills dd{display:inline;font-size:9pt}
  .skills dt{font-weight:700}
  .skills dt::after{content:': '}
  .plain{gap:1.5pt;padding-top:5pt}
  .plain li{font-size:9pt}
  .plain b{font-weight:700}
  .foot{margin-top:7pt;padding-top:3pt;font-size:8pt}
}`

function renderResume(profile) {
  const title = `${profile.name} — Résumé${profile.headline ? ` — ${profile.headline}` : ''}`
  const description = `Résumé of ${profile.name}${profile.headline ? `, ${profile.headline}` : ''}: experience, projects, education, skills and contact details on one page.`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': profile.resume.html,
    url: profile.resume.html,
    name: title,
    description,
    inLanguage: 'en',
    dateModified: updated,
    isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: { '@id': `${SITE}/#person`, '@type': 'Person', name: profile.name, url: `${SITE}/`, jobTitle: profile.headline, sameAs: profile.links.map((l) => l.url) },
  }
  const contact = [
    profile.location.text && esc(profile.location.text),
    profile.email && a(`mailto:${profile.email}`, profile.email),
    a(`${SITE}/`),
    ...profile.links.filter((l) => /linkedin|github/i.test(l.name)).map((l) => `<a rel="me" href="${esc(l.url)}">${esc(pretty(l.url))}</a>`),
  ].filter(Boolean)

  const body = `
<header class="bar no-print">
  <a class="home" href="/" aria-label="${esc(profile.name)} — home">${esc(profile.givenName)}<span class="dot">.</span></a>
  <nav class="actions" aria-label="Résumé actions">
    ${profile.resume.pdf ? `<a class="btn btn-solid" href="/${PDF_NAME}" download>Download PDF</a>` : ''}
    <button class="btn" type="button" onclick="window.print()">Print</button>
    ${profile.email ? `<a class="btn" href="mailto:${esc(profile.email)}">Email</a>` : ''}
    <a class="btn" href="/">Full site</a>
  </nav>
</header>
<main class="sheet">
  <header>
    <h1>${esc(profile.name)}</h1>
    <p class="mono headline">${esc(profile.headline || profile.eyebrow)}</p>
    <address class="contact" style="font-style:normal">${contact.map((c) => `<span>${c}</span>`).join('')}</address>
    <p class="lede">${esc(profile.summary)}</p>
    ${openSentence(profile) ? `<p class="open"><strong>${esc(openSentence(profile))}</strong></p>` : ''}
    ${factsHtml(profile)}
  </header>

  <section aria-labelledby="r-exp">
    <h2 id="r-exp">Experience</h2>
    ${profile.jobs.map((j, i) => `<article class="item${i >= FULL_ROLES_IN_PRINT ? ' brief' : ''}">
      <div class="item-h"><h3>${esc(j.role)} <span>· ${esc(j.company)}</span></h3><p class="when">${period(j)}</p></div>
      ${j.intro ? `<p>${esc(j.intro)}</p>` : ''}
      ${list(j.bullets.map(esc), 'bullets')}
      ${j.tags.length ? `<p class="tags">${j.tags.map(esc).join(' · ')}</p>` : ''}
    </article>`).join('')}
  </section>

  ${profile.education.length ? `<section aria-labelledby="r-edu">
    <h2 id="r-edu">Education</h2>
    ${profile.education.map((e) => `<article class="item">
      <div class="item-h"><h3>${esc(e.degree)} <span>· ${esc(e.institution)}</span></h3><p class="when">${esc([e.start, e.end].filter(Boolean).join(' – '))}</p></div>
      ${[e.status, e.grade].filter(Boolean).length ? `<p>${esc([e.status, e.grade].filter(Boolean).join(' · '))}</p>` : ''}
    </article>`).join('')}
  </section>` : ''}

  <section aria-labelledby="r-proj">
    <h2 id="r-proj">Projects</h2>
    ${profile.projects.map((p) => `<article class="item">
      <div class="item-h"><h3>${esc(p.name)}</h3>${p.url || p.repo ? `<p class="when">${a(p.url || p.repo)}</p>` : ''}</div>
      <p>${lead(p.desc)}</p>
      ${p.tags.length ? `<p class="tags">${p.tags.map(esc).join(' · ')}</p>` : ''}
    </article>`).join('')}
  </section>

  <section aria-labelledby="r-skills">
    <h2 id="r-skills">Skills</h2>
    <dl class="skills">${profile.skills.map((g) => `<div><dt>${esc(g.label)}</dt><dd>${g.items.map(esc).join(', ')}</dd></div>`).join('')}</dl>
  </section>

  <section aria-labelledby="r-awards">
    <h2 id="r-awards">Awards</h2>
    ${list(profile.awards.map((x) => `<b>${esc(x.title)}</b> — ${esc([x.org, x.date].filter(Boolean).join(', '))}. ${esc(x.desc)}`), 'plain')}
  </section>

  ${profile.certs.length ? `<section aria-labelledby="r-certs">
    <h2 id="r-certs">Certifications</h2>
    ${list([
      ...profile.certs.map((x) => `<b>${x.url ? a(x.url, x.name) : esc(x.name)}</b> — ${esc([x.issuer, x.date].filter(Boolean).join(', '))}`),
      ...profile.certsInProgress.map((x) => `${esc(x.name)} — ${esc(x.issuer)} (in progress)`),
    ], 'plain cols')}
  </section>` : ''}

  ${profile.research.length ? `<section aria-labelledby="r-research">
    <h2 id="r-research">Research</h2>
    ${list(profile.research.map((r) => `<b>${r.url ? a(r.url, r.title) : esc(r.title)}</b> — ${esc([r.venue, r.date].filter(Boolean).join(', '))}<span class="more">. ${esc(r.desc)}</span>`), 'plain')}
  </section>` : ''}

  ${profile.writing.length ? `<section aria-labelledby="r-writing">
    <h2 id="r-writing">Writing</h2>
    ${list(profile.writing.map((b) => `<b>${b.url ? a(b.url, b.title) : esc(b.title)}</b>${b.date ? ` — ${time(b.iso, b.date)}` : ''}`), 'plain')}
  </section>` : ''}

  <p class="mono foot">Last updated ${time(updated, updatedLong)} · <span class="print-only">${esc(pretty(profile.resume.html))}</span><span class="no-print">Also available as ${[profile.resume.pdf && a(`/${PDF_NAME}`, 'PDF'), a('/resume.json', 'JSON Resume'), a('/llms-full.txt', 'Markdown')].filter(Boolean).join(', ')}</span></p>
</main>`

  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${renderHead(profile, { path: '/resume/', title, description })}
    <meta name="theme-color" content="#f4f1ea" />
    <meta name="color-scheme" content="light dark" />
    <script>
      (function () {
        try {
          var s = localStorage.getItem('aarsh-theme-v2');
          if (s === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        } catch (e) {}
      })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" media="screen" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <script type="application/ld+json">${safeJson(jsonLd)}</script>
    <style>${RESUME_CSS}
    </style>
  </head>
  <body>${squeeze(body)}
  </body>
</html>
`
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
  const full = [
    `- [Complete profile (Markdown)](${profile.resume.markdown}): every role with its contributions, plus projects, research, awards, certifications and skills`,
    `- [Résumé (web page)](${profile.resume.html}): the same on one printable page`,
    profile.resume.pdf && `- [Résumé (PDF)](${profile.resume.pdf})`,
    `- [Résumé (JSON Resume schema)](${profile.resume.json}): structured data for parsers and applicant tracking systems`,
    `- [Website](${SITE}/)`,
  ].filter(Boolean)
  md.push(
    `This file is a short brief about ${profile.name} for AI assistants, agents and recruiters. Everything here is also on ${SITE}/ and is kept in sync with it.`,
    '',
    '## Quick facts',
    '',
    ...mdFacts(profile),
    '',
    '## Full profile',
    '',
    ...full,
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
  md.push(`- Résumé: ${profile.resume.html}${profile.resume.pdf ? ` · PDF: ${profile.resume.pdf}` : ''} · JSON: ${profile.resume.json}`)
  return md.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}

// ---------------------------------------------------------- JSON Resume
function renderResumeJson(profile) {
  const drop = (o) => JSON.parse(JSON.stringify(o, (_, v) => (v === '' || v === null || (Array.isArray(v) && !v.length) ? undefined : v)))
  return drop({
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: profile.name,
      label: profile.headline || profile.eyebrow,
      image: profile.image,
      email: profile.email,
      url: `${SITE}/`,
      summary: [profile.summary, openSentence(profile)].filter(Boolean).join(' '),
      location: { city: profile.location.city, region: profile.location.region, countryCode: profile.location.countryCode },
      profiles: profile.links.map((l) => ({ network: l.name, username: l.handle, url: l.url })),
    },
    work: profile.jobs.map((j) => ({
      name: j.company,
      position: j.role,
      url: j.url,
      startDate: j.start,
      endDate: j.end,
      summary: j.intro,
      highlights: j.bullets,
    })),
    education: profile.education.map((e) => ({
      institution: e.institution,
      url: e.url,
      area: e.area,
      studyType: e.studyType,
      startDate: e.start,
      endDate: e.end,
      score: e.grade,
    })),
    awards: profile.awards.map((x) => ({ title: x.title, date: isoDate(x.date), awarder: x.org, summary: x.desc })),
    certificates: profile.certs.map((x) => ({ name: x.name, date: isoDate(x.date), issuer: x.issuer, url: x.url })),
    publications: [
      ...profile.research.filter((r) => r.published).map((r) => ({ name: r.title, publisher: r.venue, releaseDate: isoDate(r.date), url: r.url, summary: r.desc })),
      ...profile.writing.map((b) => ({ name: b.title, publisher: /we45/i.test(b.url) ? 'we45' : /medium/i.test(b.url) ? 'Medium' : undefined, releaseDate: b.iso, url: b.url, summary: b.desc })),
    ],
    skills: profile.skills.map((g) => ({ name: g.label, keywords: g.items })),
    languages: profile.languages.map((l) => ({ language: l })),
    interests: profile.focusAreas.map((f) => ({ name: f })),
    projects: profile.projects.map((p) => ({ name: p.name, description: p.desc, keywords: p.tags, url: p.url || p.repo })),
    meta: { canonical: profile.resume.json, version: 'v1.0.0', lastModified: `${updated}T00:00:00Z` },
  })
}

// ------------------------------------------------------------------ PDF
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean)
  for (const bin of candidates) {
    try {
      if (spawnSync(bin, ['--version'], { stdio: 'ignore', timeout: 15000 }).status === 0) return bin
    } catch {}
  }
  return ''
}

/** Prints dist/resume/index.html to PDF with headless Chrome. Returns true when a real PDF came out. */
function printResumePdf() {
  const chrome = findChrome()
  if (!chrome) return false
  rmSync(PDF_PATH, { force: true })
  spawnSync(
    chrome,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${resolve(PDF_PATH)}`,
      pathToFileURL(resolve(DIST, 'resume', 'index.html')).href,
    ],
    { stdio: 'ignore', timeout: 90000 }
  )
  return existsSync(PDF_PATH) && statSync(PDF_PATH).size > 2000
}

// ================================================================ write
const indexPath = join(DIST, 'index.html')
const shell = readFileSync(indexPath, 'utf8')
for (const needle of ['<div id="root"></div>', '<!-- seo:start -->', '<!-- seo:end -->']) {
  if (!shell.includes(needle)) throw new Error(`prerender: ${needle} not found in dist/index.html`)
}

function writeSite(hasPdf) {
  const profile = buildProfile(content, { updated, resumePdf: hasPdf ? `/${PDF_NAME}` : '' })

  // ---- index.html
  const head = [
    renderHead(profile),
    `<script type="application/ld+json" id="person-jsonld">${safeJson(buildJsonLd(profile))}</script>`,
  ].join('\n    ')
  const index = shell
    .replace(/<!-- seo:start -->[\s\S]*<!-- seo:end -->/, () => head)
    .replace('<html lang="en"', () => `<html lang="en" data-updated="${updated}"${hasPdf ? ` data-resume-pdf="/${PDF_NAME}"` : ''}`)
    .replace(
      '<div id="root"></div>',
      // The inline copy of content.json lets React render on the first tick instead of after a second request.
      () => `<div id="root">${renderHomeBody(profile)}</div>\n    <script type="application/json" id="site-content">${safeJson(content)}</script>`
    )
  writeFileSync(indexPath, index)
  // GitHub Pages serves 404.html for unknown paths; keep it out of the index.
  writeFileSync(join(DIST, '404.html'), index.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex" />'))

  // ---- résumé
  mkdirSync(join(DIST, 'resume'), { recursive: true })
  writeFileSync(join(DIST, 'resume', 'index.html'), renderResume(profile))
  writeFileSync(join(DIST, 'resume.json'), JSON.stringify(renderResumeJson(profile), null, 2) + '\n')

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
# Machine-readable profile:  ${SITE}/llms.txt  ·  ${SITE}/llms-full.txt  ·  ${SITE}/resume.json

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: ${SITE}/sitemap.xml
`
  )
  const urls = ['/', '/resume/', hasPdf && `/${PDF_NAME}`].filter(Boolean)
  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${updated}</lastmod></url>`).join('\n')}
</urlset>
`
  )
  return profile
}

// The résumé page links to its own PDF, so write once assuming there is one,
// print it, and rewrite without the links if Chrome was not available.
let hasPdf = pdfSupplied
writeSite(true)
if (!pdfSupplied) {
  hasPdf = printResumePdf()
  if (!hasPdf) {
    console.warn(`prerender: no Chrome found (set CHROME_PATH), so ${PDF_NAME} was not generated — pages will not link to it`)
    writeSite(false)
  }
}

if (!existsSync(join(DIST, 'CNAME'))) console.warn('prerender: no dist/CNAME (custom domain) — is public/CNAME missing?')
console.log(
  `prerender: index.html, 404.html, resume/, resume.json, llms.txt, llms-full.txt, robots.txt, sitemap.xml` +
    (hasPdf ? `, ${PDF_NAME}${pdfSupplied ? ' (from public/)' : ''}` : '') +
    ` — profile last updated ${updated}`
)
