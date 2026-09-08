/**
 * setup.js — Run ONCE to hash and store credentials
 * Usage: node setup.js
 */
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs    = require('fs')
const path  = require('path')

const USERNAME = 'aarsh'
const PASSWORD = 'Rc12345c@'            // plain text used ONLY here, never stored

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12)
  const jwtSecret   = crypto.randomBytes(48).toString('hex')

  const auth = { username: USERNAME, passwordHash, jwtSecret }
  const authPath = path.join(__dirname, 'auth.json')
  fs.writeFileSync(authPath, JSON.stringify(auth, null, 2))

  console.log('✅  Credentials hashed and saved to server/auth.json')
  console.log('    Username :', USERNAME)
  console.log('    JWT Secret auto-generated')
  console.log('\n⚠️  auth.json contains secrets — never commit it to Git!')
}

main().catch(err => { console.error(err); process.exit(1) })
