import { useState, useEffect } from 'react'

// Fallback static content (used if the server is unreachable)
const FALLBACK = null

export function useContent() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError  ] = useState(null)

  useEffect(() => {
    let cancelled = false
    
    // First try the API (works on Vercel/Local Backend)
    fetch('/api/content')
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
