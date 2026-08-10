const baseUrl = (process.env.PRODUCTION_URL || 'https://no-question.netlify.app').replace(/\/$/, '')
const expectedCommit = process.env.EXPECTED_COMMIT || ''
if (!expectedCommit) throw new Error('EXPECTED_COMMIT is required for production verification')
const routes = ['/', '/puzzle/hidden', '/manifest.webmanifest', '/robots.txt', '/sitemap.xml', '/build.json', '/sw.js']

function header(headers, name) {
  return headers.get(name) || ''
}

const responses = []
for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' })
  responses.push({ route, response })
  if (!response.ok) throw new Error(`Production route failed: ${route} returned ${response.status}`)
}

const root = responses.find(({ route }) => route === '/').response
const expectedHeaders = {
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
}
const headerMismatches = Object.entries(expectedHeaders).filter(([name, value]) => header(root.headers, name) !== value).map(([name]) => name)
if (headerMismatches.length) throw new Error(`Production headers missing or mismatched: ${headerMismatches.join(', ')}`)

const html = await root.text()
if (!html.includes('manifest.webmanifest') || !html.includes('No Question')) throw new Error('Production HTML is missing app identity or manifest metadata')
const build = await responses.find(({ route }) => route === '/build.json').response.json()
if (!build.commit || !build.builtAt || !build.puzzleDigest) throw new Error('Production build provenance is incomplete')
if (expectedCommit && build.commit !== expectedCommit) throw new Error(`Production commit mismatch: expected ${expectedCommit}, got ${build.commit}`)
const assetPaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1])
for (const assetPath of assetPaths) {
  const asset = await fetch(`${baseUrl}${assetPath}`)
  if (!asset.ok || !header(asset.headers, 'cache-control').includes('immutable')) throw new Error(`Production asset cache policy failed: ${assetPath}`)
}
const buildResponse = responses.find(({ route }) => route === '/build.json').response
const serviceWorkerResponse = responses.find(({ route }) => route === '/sw.js').response
if (!header(buildResponse.headers, 'cache-control').includes('no-store')) throw new Error('Production build manifest must not be cached')
if (!header(serviceWorkerResponse.headers, 'cache-control').includes('no-cache')) throw new Error('Production service worker must be revalidated')
const expectedMime = {
  '/': 'text/html',
  '/puzzle/hidden': 'text/html',
  '/manifest.webmanifest': 'application/manifest+json',
  '/robots.txt': 'text/plain',
  '/sitemap.xml': 'application/xml',
  '/build.json': 'application/json',
  '/sw.js': 'javascript',
}
for (const { route, response } of responses) {
  const contentType = header(response.headers, 'content-type')
  if (!contentType.includes(expectedMime[route])) throw new Error(`Production MIME mismatch: ${route} has ${contentType}`)
}
const missingAsset = await fetch(`${baseUrl}/assets/no-question-missing-asset.js`)
if (missingAsset.status !== 404) throw new Error(`Missing production assets must return 404, got ${missingAsset.status}`)

console.log(`Production smoke verification passed for ${baseUrl}: ${routes.length} routes, provenance ${build.commit.slice(0, 12)}, exact MIME/cache policies, and ${Object.keys(expectedHeaders).length} security headers.`)
