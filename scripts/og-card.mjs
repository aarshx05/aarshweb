/**
 * og-card.mjs — draws public/og.png, the 1200×630 card that LinkedIn, Slack,
 * WhatsApp, iMessage and X show when someone shares a link to the site.
 *
 *   npm run og        (needs a local Chrome; set CHROME_PATH if it is not on PATH)
 *
 * Run it after changing your name, headline, current role or photo in
 * public/content.json, then commit the new public/og.png. It is not part of
 * `npm run build`, so the image you reviewed is the image that ships.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { buildProfile } from '../src/lib/profile.js'

const content = JSON.parse(readFileSync('public/content.json', 'utf8'))
const profile = buildProfile(content)
const OUT = resolve('public/og.png')

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const photo = content.hero?.image ? pathToFileURL(resolve('public', content.hero.image.replace(/^\//, ''))).href : ''
const previously = (content.about?.highlights || []).find((h) => /previous/i.test(h.label))?.value
const lines = [
  profile.current && ['Now', `${profile.current.role} · ${profile.current.company}`],
  previously && ['Previously', previously],
].filter(Boolean)

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{display:grid;grid-template-columns:minmax(0,1fr) 332px;gap:56px;padding:64px 68px;background:#f4f1ea;color:#1d2220;font-family:'Geist','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .copy{display:flex;flex-direction:column;min-width:0}
  .mono{font-family:'Geist Mono',ui-monospace,Menlo,monospace;font-size:21px;letter-spacing:0}
  .role{color:#b04a22}
  h1{margin-top:18px;font-size:104px;font-weight:400;line-height:.93;letter-spacing:-.055em}
  .dot{color:#c65a2e}
  .focus{margin-top:26px;max-width:21ch;font-size:35px;line-height:1.16;letter-spacing:-.03em;color:rgba(29,34,32,.78)}
  dl{display:grid;gap:9px;margin-top:auto}
  dl div{display:grid;grid-template-columns:156px minmax(0,1fr);align-items:baseline}
  dt{color:rgba(29,34,32,.52)}
  dd{font-size:23px;letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .side{display:flex;flex-direction:column;gap:20px}
  .photo{flex:1;border-radius:22px;background:#ebe7de center 28%/cover no-repeat;filter:grayscale(1) contrast(1.04)}
  .url{text-align:right;color:#1d2220}
</style></head>
<body>
  <div class="copy">
    <p class="mono role">${esc(profile.headline || profile.eyebrow)}</p>
    <h1>${esc(profile.givenName)}<br>${esc(profile.familyName)}<span class="dot">.</span></h1>
    ${profile.focusAreas[0] ? `<p class="focus">${esc(profile.focusAreas[0])}</p>` : ''}
    <dl>${lines.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  </div>
  <div class="side">
    <div class="photo"${photo ? ` style="background-image:url('${photo}')"` : ''}></div>
    <p class="mono url">${esc(profile.site.replace('https://', ''))}</p>
  </div>
</body></html>`

const chrome = [process.env.CHROME_PATH, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
  .filter(Boolean)
  .find((bin) => {
    try {
      return spawnSync(bin, ['--version'], { stdio: 'ignore', timeout: 15000 }).status === 0
    } catch {
      return false
    }
  })
if (!chrome) {
  console.error('og-card: no Chrome found — set CHROME_PATH to a Chrome or Chromium binary')
  process.exit(1)
}

const dir = mkdtempSync(join(tmpdir(), 'og-card-'))
const page = join(dir, 'card.html')
writeFileSync(page, html)
rmSync(OUT, { force: true })
spawnSync(
  chrome,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=8000', // lets the web fonts and the photo finish loading
    `--screenshot=${OUT}`,
    pathToFileURL(page).href,
  ],
  { stdio: 'ignore', timeout: 90000 }
)
rmSync(dir, { recursive: true, force: true })
if (!existsSync(OUT)) {
  console.error('og-card: Chrome did not produce an image')
  process.exit(1)
}
console.log(`og-card: wrote ${OUT}`)
