/**
 * server/index.js — Express backend for the Aarsh Chaurasia portfolio
 * Routes:
 *   POST /api/login          — auth (returns JWT)
 *   GET  /api/content        — public portfolio content
 *   PUT  /api/content        — update content (JWT required)
 *   GET  /api/content/:section — single section (JWT required)
 *   PUT  /api/content/:section — update single section (JWT required)
 *   GET  /admin              — admin panel HTML
 *   GET  /*                  — serves React build (production)
 */

const express  = require('express')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const cors     = require('cors')
const fs       = require('fs')
const path     = require('path')

const app  = express()
const PORT = process.env.PORT || 3001

const AUTH_PATH    = path.join(__dirname, 'auth.json')
const CONTENT_PATH = path.join(__dirname, 'content.json')
const DIST_PATH    = path.join(__dirname, '..', 'dist')

// ── Middleware ──────────────────────────────────────────────
app.use(cors()) // Relaxed for Vercel
app.use(express.json({ limit: '2mb' }))

// ── Helpers ─────────────────────────────────────────────────
function loadAuth() {
  if (!fs.existsSync(AUTH_PATH)) {
    console.error('❌  auth.json not found. Run: node setup.js')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(AUTH_PATH, 'utf-8'))
}

function loadContent() {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'))
}

function saveContent(data) {
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2))
}

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const { jwtSecret } = loadAuth()
    jwt.verify(token, jwtSecret)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── Auth routes ─────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password)
    return res.status(400).json({ error: 'username and password required' })

  const auth = loadAuth()
  if (username !== auth.username)
    return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, auth.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ username }, auth.jwtSecret, { expiresIn: '24h' })
  res.json({ token, username })
})

// ── Content routes ───────────────────────────────────────────
// Public: read all content
app.get('/api/content', (_req, res) => {
  try { res.json(loadContent()) }
  catch { res.status(500).json({ error: 'Failed to read content' }) }
})

// Protected: overwrite all content
app.put('/api/content', authMiddleware, (req, res) => {
  try {
    saveContent(req.body)
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to save content' }) }
})

// Protected: read single section
app.get('/api/content/:section', authMiddleware, (req, res) => {
  const c = loadContent()
  const s = c[req.params.section]
  if (!s) return res.status(404).json({ error: 'Section not found' })
  res.json(s)
})

// Protected: update single section
app.put('/api/content/:section', authMiddleware, (req, res) => {
  try {
    const c = loadContent()
    c[req.params.section] = req.body
    saveContent(c)
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to save section' }) }
})

// ── Admin panel ──────────────────────────────────────────────
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'))
})

// ── Serve React dist (production) ───────────────────────────
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH))
  app.get('*', (_req, res) => res.sendFile(path.join(DIST_PATH, 'index.html')))
}

// ── Start ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  Portfolio API  →  http://localhost:${PORT}/api/content`)
    console.log(`  Admin Panel    →  http://localhost:${PORT}/admin\n`)
  })
}

module.exports = app
