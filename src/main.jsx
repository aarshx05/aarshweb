import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Opt into scroll reveals only when we can actually drive them. Doing this
// before the first React paint avoids a flash of already-visible content,
// while leaving the no-JS / reduced-motion path fully readable.
if (
  typeof IntersectionObserver !== 'undefined' &&
  !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
) {
  document.documentElement.classList.add('reveal-ready')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
