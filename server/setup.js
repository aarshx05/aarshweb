/**
 * setup.js — Run ONCE to hash and store admin credentials in server/auth.json
 *
 * Usage:
 *   node setup.js                      (prompts for username + password)
 *   ADMIN_USERNAME=aarsh ADMIN_PASSWORD='...' node setup.js   (non-interactive)
 *
 * The password is never written anywhere in plain text: only its bcrypt hash
 * (plus a freshly generated JWT secret) goes into auth.json, which is gitignored.
 */
const bcrypt   = require('bcryptjs')
const crypto   = require('crypto')
const fs       = require('fs')
const path     = require('path')
const readline = require('readline')

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    if (hidden) {
      // Don't echo the password while it's typed.
      rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s) }
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

async function main() {
  const username = process.env.ADMIN_USERNAME || (await ask('Admin username [aarsh]: ')) || 'aarsh'
  const password = process.env.ADMIN_PASSWORD || (await ask('Admin password (min 12 chars): ', { hidden: true }))

  if (!password || password.length < 12) {
    console.error('❌  Password must be at least 12 characters.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const jwtSecret    = crypto.randomBytes(48).toString('hex')

  const authPath = path.join(__dirname, 'auth.json')
  fs.writeFileSync(authPath, JSON.stringify({ username, passwordHash, jwtSecret }, null, 2), { mode: 0o600 })

  console.log('✅  Credentials hashed and saved to server/auth.json')
  console.log('    Username :', username)
  console.log('    JWT Secret auto-generated')
  console.log('\n⚠️  auth.json contains secrets — never commit it to Git!')
}

main().catch((err) => { console.error(err); process.exit(1) })
