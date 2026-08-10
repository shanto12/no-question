import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { build } from 'vite'
import { modes, puzzles } from '../src/game-data.js'
import { validatePuzzleCatalog } from '../src/game-logic.js'

const catalogErrors = validatePuzzleCatalog(modes, puzzles)
if (catalogErrors.length) {
  throw new Error(`Puzzle catalog validation failed:\n${catalogErrors.join('\n')}`)
}

await build()

let commit = process.env.COMMIT_REF || process.env.GITHUB_SHA || ''
let sourceDirty = false
if (!commit) {
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    sourceDirty = Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim())
  } catch {
    commit = 'local-build'
  }
}

const dist = resolve(process.cwd(), 'dist')
mkdirSync(dist, { recursive: true })
const puzzleDigest = createHash('sha256').update(JSON.stringify({ modes, puzzles })).digest('hex')
const precache = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', ...readdirSync(resolve(dist, 'assets')).map((file) => `/assets/${file}`)]
const serviceWorker = readFileSync(resolve(dist, 'sw.js'), 'utf8')
  .replace(/const CACHE_NAME = '[^']+'/, `const CACHE_NAME = 'no-question-${commit.slice(0, 12)}-${puzzleDigest.slice(0, 8)}'`)
  .replace(/const PRECACHE = \[[^\]]*\]/, `const PRECACHE = ${JSON.stringify(precache)}`)
writeFileSync(resolve(dist, 'sw.js'), serviceWorker)
writeFileSync(resolve(dist, 'build.json'), `${JSON.stringify({ commit, builtAt: new Date().toISOString(), puzzleDigest, contentVersion: 'issue-001.v1', node: process.version, sourceDirty }, null, 2)}\n`)
console.log(`Build identity recorded for ${commit}`)
