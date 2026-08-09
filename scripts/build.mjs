import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { build } from 'vite'

await build()

let commit = process.env.COMMIT_REF || process.env.GITHUB_SHA || ''
if (!commit) {
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    commit = 'local-build'
  }
}

const dist = resolve(process.cwd(), 'dist')
mkdirSync(dist, { recursive: true })
writeFileSync(resolve(dist, 'build.json'), `${JSON.stringify({ commit, builtAt: new Date().toISOString() }, null, 2)}\n`)
console.log(`Build identity recorded for ${commit}`)
