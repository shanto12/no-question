# Release evidence matrix

Updated: 2026-08-09 (America/Chicago)

Application source verified: `7b56b65c0e9633ac7d385d0c47e38fd6e2f1faca`
Production packaging commit: `7b56b65c0e9633ac7d385d0c47e38fd6e2f1faca`
Evidence matrix first committed in GitHub: `b5c95e2f4582803feb5d245bc95abee1f88b6c55`
Production URL: https://no-question.netlify.app
Netlify deploy: `6a79506712930a64d2e8666c`
Unique deploy URL: https://6a79506712930a64d2e8666c--no-question.netlify.app

| Requirement | Evidence source | Result | Current evidence |
|---|---|---|---|
| Product concept and puzzle loop | Product brief + source implementation | PASS | `docs/PRODUCT_BRIEF.md`, `src/App.jsx` |
| Three playable puzzle modes | Final production Playwright + final Chrome | PASS | Hidden signal, Odd one out, and Sequence sense each solved successfully in production Playwright; Chrome manually selected Odd and Sequence tabs without app-origin errors |
| Question + answer entry | Final production Playwright | PASS | Separate question and answer controls; successful feedback rendered in a status region; Chrome did not type into the preserved user-profile draft |
| Failure and recovery feedback | Final production Playwright | PASS | Invalid/near submissions remain in the loop with actionable feedback; reset clears the active draft |
| Hint and explanation state | Final production Playwright | PASS | Hint strip, explicit `-15` cost, explanation, attempt count, and hint count verified |
| Clue descriptions / non-visual interpretation | Final production Playwright + final Chrome DOM snapshot | PASS | Description toggle exposes text through `aria-describedby`; hidden-mode evidence is non-interactive |
| Next-puzzle progression and replay | Final production Playwright | PASS | Hidden → Odd → Sequence progression and `Replay this set` verified |
| Local progress and streak accounting | Final production Playwright | PASS | Score, attempts, hints, completed count, and Central Time streak updated and persisted |
| Draft persistence and selected-mode recovery | Final production Playwright, two tabs | PASS | Question, answer, sequence, and selected mode survived reload; a cross-tab storage update hydrated the visible form |
| Resilient storage clearing | Final production Playwright, two tabs | PASS | Storage event path accepts a cleared value and rehydrates the active puzzle from safe defaults |
| Keyboard and dialog accessibility | Final production Playwright + final Chrome | PASS | `1/2/3`, Left/Right/Home/End tab movement, focus trap, Escape close, focus restoration, and in-viewport “Got it” focus verified |
| Runtime failure recovery | Source inspection + local build | PASS | `AppErrorBoundary` provides a reload path in `src/main.jsx` |
| Install/share metadata | Production route checks + source | PASS | Manifest, canonical URL, Open Graph/Twitter metadata, robots, and sitemap are present |
| Responsive desktop layout | Final production Playwright + final Chrome | PASS | Desktop production interaction pass completed without layout failure |
| Responsive mobile layout | Final production Playwright | PASS | Viewport `390x844`; `scrollWidth=390`, `innerWidth=390`; mobile screenshot captured |
| Local production build | Terminal | PASS | `npm run verify` passed on final source `7b56b65c0e96`; live `/build.json` reports the same clean commit and content digest |
| Static security headers | Production smoke checker + terminal | PASS | Exact CSP, HSTS preload, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy, COOP, and CORP values present |
| Production npm dependency audit | Terminal + GitHub Actions | PASS | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities; CI audit passed |
| Repeatable CI quality gate | GitHub Actions | PASS | Run `31354891515` passed on source `7b56b65`; build verification plus production and full dependency audits completed |
| Production deployment | Netlify CLI + live build manifest | PASS | Site `no-question`, deploy `6a79506712930a64d2e8666c`; `/build.json` reports the final packaging commit |
| Production route behavior | Production smoke checker + terminal | PASS | `/`, `/puzzle/hidden`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, `/build.json`, and `/sw.js` returned HTTP 200; a missing asset returned 404 |
| Production API/backend/runner jobs | Scope review + production request inventory | N/A | Deliberately backend-free MVP; no API or background job is required |
| Auth / logout / login | Scope review | N/A | No accounts, auth, or logout surface exists in this MVP |
| Password-manager behavior | Scope review | N/A | No sign-in or password fields exist; Chrome manual pass used the existing profile without entering credentials |
| Failed production requests / app console errors | Final production Playwright + final Chrome logs | PASS | Final mobile Playwright observed four app requests at 200 with console errors/warnings 0; terminal route checks found no failed required request; Chrome had 0 app-origin logs and only unrelated extension-origin warnings |
| Versioned progress schema and safe migration | Local logic tests + production Playwright | PASS | `version: 2`, bounded counters/drafts, malformed JSON recovery, legacy migration, and incompatible-file rejection are covered |
| Portable progress export/import | Production Playwright + source | PASS | Export produced a JSON download; importing `dist/build.json` was rejected while the existing `3 of 3` state remained unchanged; no credentials or network request involved |
| Offline-first service worker | Production Playwright + static build | PASS | `/sw.js` returned JavaScript with `no-cache`; browser reported a registered and controlling service worker; built precache contains hashed JS/CSS assets |
| Mode deep links and current-mode sharing | Production Playwright + source | PASS | `#puzzle/sequence` loaded the selected tab and `#puzzle/odd` followed progression; share construction uses the active mode URL |
| Sequence recovery controls | Production Playwright | PASS | Seed → sprout followed by Undo and Clear restored the draft without resetting the question/answer fields |
| Accessible form guidance and announcements | Production Playwright + final Chrome DOM/log pass | PASS | Empty submissions expose field invalid states and a specific alert; form has an accessible name; feedback and sequence status are live regions |
| Content catalog validation and provenance | Local verification + live `/build.json` | PASS | Catalog invariants and negative cases pass; live build reports commit `7b56b65c0e96`, content version `issue-001.v1`, digest `138a8e126837e4c8e4787a5a78343c150c81565640d1ec5f751dd41995c6d2e7`, and `sourceDirty: false` |
| Repeatable production smoke checker | Terminal against live site | PASS | `EXPECTED_COMMIT=7b56b65c0e9633ac7d385d0c47e38fd6e2f1faca npm run verify:production` passed routes, exact MIME/cache policies, missing-asset 404, and eight security headers |
| Deployment hardening | Live response headers + terminal | PASS | CSP, HSTS, COOP, CORP, DNS prefetch control, exact manifest/service-worker MIME, immutable asset caching, and no-store build metadata verified |
| Central Time daily spotlight | Local logic tests + current production DOM | PASS | Date-keyed deterministic mode selection passed and the live hero showed the current Hidden signal spotlight |

## Release gates

- Local `npm run verify`, production/full dependency audits, and GitHub Actions run `31354891515` passed.
- Netlify production exposes the application, SPA route, manifest, robots, sitemap, security headers, and build identity.
- The broader production Playwright interaction run covered all modes, hints, descriptions, validation, progression, replay, share control, import/export, sequence recovery, service-worker registration, console, and requests on the immediately preceding release candidate; the final `7b56b65` deployment re-ran smoke, mobile overflow, service-worker, requests, and console checks after the tab-rail-only change.
- Final real Chrome used the connected user profile for a desktop manual pass covering help, descriptions, mode tabs, navigation, and app-origin logs. Existing local progress was preserved; full solve regression coverage was performed in Playwright, not claimed as a Chrome solve pass.
