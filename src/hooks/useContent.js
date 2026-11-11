import { useState, useEffect } from 'react'

// Fallback static content (used if the server is unreachable)
const FALLBACK = null

export function useContent() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError  ] = useState(null)

  useEffect(() => {
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
        // Fallback to static JSON file (works on static hosts like Infinity Free)
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
  }, [])

  return { content, loading, error }
}
