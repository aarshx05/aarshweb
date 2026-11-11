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
npm run preview
```

`scripts/prerender.mjs` runs after the Vite build and makes the site readable without JavaScript
(search engines, AI crawlers like GPTBot/ClaudeBot/PerplexityBot, link previews):

- writes the content of `content.json` as plain HTML inside `#root` (React replaces it on load)
- adds static Person JSON-LD and absolute social-preview image URLs
- generates `robots.txt` (all crawlers allowed), `sitemap.xml`, `llms.txt` and `404.html`

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages.

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

## Editing content

Edit `public/content.json` and push. The optional local admin panel lives in `server/`:

```bash
cd server && npm install
node setup.js        # prompts for an admin username/password; writes gitignored auth.json
npm start            # http://localhost:3001/admin
```

Copy the updated `server/content.json` to `public/content.json` before committing.
