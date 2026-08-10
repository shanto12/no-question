import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const requiredFiles = ['dist/index.html', 'dist/assets', 'dist/manifest.webmanifest', 'dist/robots.txt', 'dist/sitemap.xml', 'dist/build.json', 'dist/sw.js', 'dist/404.html', 'public/_headers', 'netlify.toml']
const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)))
if (missing.length) {
  console.error(`Missing release artifacts: ${missing.join(', ')}`)
  process.exit(1)
}

const index = readFileSync(resolve(root, 'dist/index.html'), 'utf8')
const buildInfo = JSON.parse(readFileSync(resolve(root, 'dist/build.json'), 'utf8'))
const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8')
const appSource = readFileSync(resolve(root, 'src/App.jsx'), 'utf8')
const serviceWorker = readFileSync(resolve(root, 'dist/sw.js'), 'utf8')
const requiredStrings = ['No Question', 'manifest.webmanifest', 'canonical', 'Content-Security-Policy', 'X-Content-Type-Options', 'Strict-Transport-Security']
const combined = `${index}\n${headers}`
if (!buildInfo.commit || !buildInfo.builtAt || !buildInfo.puzzleDigest || !buildInfo.contentVersion) {
  console.error('Build identity is incomplete.')
  process.exit(1)
}
const absent = requiredStrings.filter((value) => !combined.includes(value))
if (absent.length) {
  console.error(`Missing release assertions: ${absent.join(', ')}`)
  process.exit(1)
}

const appAssertions = ['skip-link', 'description-toggle', 'share-solve', 'next-puzzle', 'data-testid="feedback"', 'export-progress', 'undo-sequence']
const missingAppAssertions = appAssertions.filter((value) => !appSource.includes(value))
if (missingAppAssertions.length) {
  console.error(`Missing app release assertions: ${missingAppAssertions.join(', ')}`)
  process.exit(1)
}
if (!serviceWorker.includes('const PRECACHE =') || !serviceWorker.includes('/assets/')) {
  console.error('Service worker does not contain the built asset precache.')
  process.exit(1)
}
if (appSource.includes('style={{')) {
  console.error('Inline React styles are not permitted by the production CSP.')
  process.exit(1)
}

console.log('Static release verification passed: build output, content provenance, offline shell, and security headers are present.')
