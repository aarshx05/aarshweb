# aarshc.me

Personal site of Aarsh Chaurasia. Vite + React, content driven by `public/content.json`,
deployed to **GitHub Pages** at <https://aarshc.me>.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build

```bash
npm run build        # vite build + scripts/prerender.mjs  ->  dist/
npm run preview      # http://localhost:4173  (the résumé page and the files below only exist after a build)
```

## What the build publishes

The React app renders in the browser, so on its own the HTML would be an empty `<div>` to anything that
does not run JavaScript: AI crawlers (GPTBot, ClaudeBot, PerplexityBot), recruiter-sourcing scrapers, link
previewers. `scripts/prerender.mjs` runs after the Vite build and writes the same profile, from the same
`content.json`, in every form a search engine, an AI assistant or a recruiter is likely to ask for:

| File | For |
|---|---|
| `index.html` | Full profile as plain HTML inside `#root` (React replaces it on load), meta + Open Graph tags, schema.org JSON-LD (`WebSite` → `ProfilePage` → `Person`, plus projects, papers and articles) |
| `resume/index.html` | Static, printable résumé at `/resume/` with every role on one page |
| `Aarsh-Chaurasia-Resume.pdf` | That page printed by headless Chrome (two pages, real text, parser-friendly reading order) |
| `resume.json` | The same data in the [JSON Resume](https://jsonresume.org/schema) schema |
| `llms.txt`, `llms-full.txt` | A short brief and the complete profile in Markdown, for AI assistants |
| `robots.txt`, `sitemap.xml`, `404.html` | Crawlers (everyone is allowed, AI crawlers included) |

`src/lib/profile.js` is the single place that turns `content.json` into those facts. The build and the React
app both import it, so the page, the structured data and the files above cannot drift apart.

### The résumé PDF

- Generated when a Chrome/Chromium binary is available: on PATH (`google-chrome`, `chromium`), or via
  `CHROME_PATH=/path/to/chrome npm run build`. GitHub's runners ship with Chrome, so deploys include it.
  Without Chrome the build still succeeds and the pages simply do not link to a PDF.
- **To use your own PDF instead**, save it as `public/Aarsh-Chaurasia-Resume.pdf`. The build then leaves it alone.
- The four most recent roles print in full; earlier ones print as one line each (the web page shows everything).
  Change the number with `"resumeFullRoles"` under `"profile"` in `content.json`.

### The share card

`public/og.png` (1200×630) is what LinkedIn, Slack, WhatsApp and X show when the site is shared. Redraw it
after changing your name, headline, current role or photo:

```bash
npm run og           # needs a local Chrome; then commit public/og.png
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds, checks the output, publishes `dist/`
to GitHub Pages, and then pings [IndexNow](https://www.indexnow.org/) so Bing (which also feeds ChatGPT
search, Copilot and DuckDuckGo) and Yandex recrawl the changed pages straight away. The IndexNow key is the
`public/<key>.txt` file; it is meant to be public.

One-time setup:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. DNS for `aarshc.me` (custom domain comes from `public/CNAME`):

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
   | CNAME | `www` | `aarshx05.github.io` |

3. **Settings → Pages → Enforce HTTPS** once the certificate is issued.
4. Search engines: add the site in [Google Search Console](https://search.google.com/search-console) and
   [Bing Webmaster Tools](https://www.bing.com/webmasters), then submit `https://aarshc.me/sitemap.xml` in
   each. Verify by DNS record, or paste the verification codes into `seo.verification.google` /
   `seo.verification.bing` in `content.json` and push.

## Editing content

Edit `public/content.json` and push. The parts that decide how you are found:

| Key | What it controls |
|---|---|
| `seo.title`, `seo.description` | The search result and link preview. Keep the description near 160 characters. |
| `profile.headline` | The one-line label under your name on the résumé, share card and `llms.txt`. |
| `profile.roles` | The roles you want to be found for. Shown as "Roles" and published as schema.org occupations. |
| `profile.summary` | Two to four sentences in the third person. **Update it when your job changes.** |
| `profile.location` | City / region / country. Recruiters filter on this first. |
| `profile.openTo` | Off by default. `status: "open"` publishes that you are looking ("Looking for …", plus `types`, `from`, `workModes`, `relocation`) across the page, résumé, `llms.txt` and structured data. `""` says nothing about availability. |
| `profile.education` | Degree, institution, years, grade. |
| `achievements.certifications[].date` | A date of "Preparing" / "In progress" keeps that certificate out of the structured data and marks it "in progress" everywhere else. |

Empty fields are never shown, so nothing unconfirmed gets published.

The optional local admin panel lives in `server/`:

```bash
cd server && npm install
node setup.js        # prompts for an admin username/password; writes gitignored auth.json
npm start            # http://localhost:3001/admin
```

Copy the updated `server/content.json` to `public/content.json` before committing.
