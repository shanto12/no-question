# No Question — next ten-improvement release

Third release pass, 2026-08-10 (America/Chicago). These additions extend the first ten improvements documented in `docs/IMPROVEMENTS_PLAN.md`.

1. **Versioned progress schema** — move local progress into a versioned, bounded envelope with safe legacy parsing and migration.
2. **Portable progress backup** — export and import local history and drafts as a privacy-preserving JSON file; no account or server is required.
3. **Offline-first shell** — register a service worker that caches the app shell and serves a last-known playable build when navigation loses connectivity.
4. **Puzzle deep links** — make each mode addressable with `#puzzle/hidden`, `#puzzle/odd`, or `#puzzle/sequence`, and include the selected mode in solve shares.
5. **Sequence recovery controls** — add Undo and Clear controls so players can revise a sequence without resetting the whole puzzle.
6. **Accessible form guidance** — replace opaque browser-only required-field behavior with targeted inline errors, invalid states, and polite live feedback.
7. **Content integrity provenance** — validate the puzzle catalog at build time and record a SHA-256 content digest and content version in `build.json`.
8. **Production smoke verification** — add a repeatable Node production checker for routes, metadata, build provenance, and required security headers.
9. **Deployment hardening** — add cross-origin isolation headers, DNS prefetch control, and immutable/static-vs-dynamic cache policies for Netlify.
10. **Daily spotlight rotation** — deterministically spotlight a different mode by Central Time day while keeping the full set available for free exploration.

## Acceptance gates

- `npm run verify` passes catalog, logic, migration, static, provenance, and service-worker checks.
- `npm audit --omit=dev --audit-level=high` reports no high-severity production vulnerabilities.
- `npm run verify:production` passes against the final Netlify URL with the final expected commit.
- Production Playwright exercises deep links, sequence recovery, empty-form guidance, import/export affordances, service-worker registration, all prior gameplay flows, desktop/mobile layout, console, and network requests.
- A final pass in the real Chrome profile confirms the shipped interactions and current response headers; any browser-extension noise remains separated from app-origin findings.
- This app remains intentionally backend-free: auth, logout/login, password-manager, API, and runner-job requirements are not applicable to this release.
