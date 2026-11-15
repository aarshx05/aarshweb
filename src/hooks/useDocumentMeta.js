import { useEffect } from 'react'
import { buildJsonLd, headTags } from '../lib/profile'

function setMeta({ name, property, content }) {
  const attr = name ? 'name' : 'property'
  const key = name || property
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Keeps <title>, the meta tags and the schema.org JSON-LD in step with the
 * profile. The production build already bakes the same values into the HTML
 * (scripts/prerender.mjs, from the same lib/profile.js), so there this is a
 * no-op; it matters for `npm run dev`, where nothing is prerendered.
 */
export function useDocumentMeta(profile) {
  useEffect(() => {
    if (!profile) return

    const { title, meta } = headTags(profile)
    if (title) document.title = title
    meta.forEach(setMeta)

    let script = document.getElementById('person-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.id = 'person-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(buildJsonLd(profile))
  }, [profile])
}
