import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const requiredFiles = ['dist/index.html', 'dist/assets', 'public/_headers', 'netlify.toml']
const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)))
if (missing.length) {
  console.error(`Missing release artifacts: ${missing.join(', ')}`)
  process.exit(1)
}

const index = readFileSync(resolve(root, 'dist/index.html'), 'utf8')
const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8')
const requiredStrings = ['No Question', 'Content-Security-Policy', 'X-Content-Type-Options', 'Strict-Transport-Security']
const combined = `${index}\n${headers}`
const absent = requiredStrings.filter((value) => !combined.includes(value))
if (absent.length) {
  console.error(`Missing release assertions: ${absent.join(', ')}`)
  process.exit(1)
}

console.log('Static release verification passed: build output and security headers are present.')
