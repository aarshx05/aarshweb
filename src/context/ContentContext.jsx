import { createContext, useContext } from 'react'

/**
 * Single source of truth for every surface of the site.
 *
 * Fed by `useContent()` (→ /api/content, falling back to /content.json), so
 * every section renders from one payload. Nothing on the page hardcodes
 * portfolio data — edit content.json, or the /admin panel, and the site
 * follows.
 */
const ContentContext = createContext(null)

export function ContentProvider({ content, children }) {
  return (
    <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
  )
}

export function useSiteContent() {
  const content = useContext(ContentContext)
  if (!content) {
    throw new Error('useSiteContent() must be used inside <ContentProvider>')
  }
  return content
}
