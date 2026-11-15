import { useState, useEffect } from 'react'

/**
 * The production build inlines content.json into the page
 * (<script type="application/json" id="site-content">, written by
 * scripts/prerender.mjs), so the first render needs no second request.
 */
function inlineContent() {
  if (import.meta.env.DEV) return null
  try {
    const el = document.getElementById('site-content')
    return el ? JSON.parse(el.textContent) : null
  } catch {
    return null
  }
}

export function useContent() {
  const [content, setContent] = useState(inlineContent)
  const [loading, setLoading] = useState(() => !content)
  const [error,   setError  ] = useState(null)

  useEffect(() => {
    if (content) return undefined
    let cancelled = false

    // Dev (npm run dev + local admin server): try the live API first.
    // Production is static hosting (GitHub Pages) with no API, so skip straight to
    // the static content.json instead of making a request that always fails.
    const api = import.meta.env.DEV
      ? fetch('/api/content')
      : Promise.reject(new Error('static build'))
    api
      .then(r => {
        if (!r.ok) throw new Error(`API ${r.status}`)
        return r.json()
      })
      .then(data => { if (!cancelled) { setContent(data); setLoading(false) } })
      .catch(apiErr => {
        // Fallback to the static JSON file (static hosting, or no admin server running)
        console.warn('API unavailable, trying static fallback:', apiErr.message)
        fetch('/content.json')
          .then(r => {
            if (!r.ok) throw new Error(`Static ${r.status}`)
            return r.json()
          })
          .then(data => { if (!cancelled) { setContent(data); setLoading(false) } })
          .catch(staticErr => {
            if (!cancelled) { 
              setError(`Data Load Failed: ${staticErr.message}`); 
              setLoading(false) 
            }
          })
      })
    return () => { cancelled = true }
    // Runs once: `content` is only read here to skip the fetch when it was inlined.
  }, [])

  return { content, loading, error }
}
