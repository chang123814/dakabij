const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

let loaded = false

function loadEnv () {
  if (loaded) return

  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env')
  ]

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath })
      loaded = true
      return
    }
  }

  console.warn('[env] No .env file found, using process defaults')
  loaded = true
}

module.exports = { loadEnv }
