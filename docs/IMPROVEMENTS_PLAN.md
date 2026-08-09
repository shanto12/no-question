# No Question — ten-improvement release plan

Second release pass, 2026-08-09 (America/Chicago).

1. **Next-puzzle progression** — add a solved-state action that advances through the set, with a replay state after all three modes are complete.
2. **Progress accounting** — track attempts, hints, score, and a real Central Time streak per puzzle, show them beside the board, and make the hint score cost explicit.
3. **Shareable solve receipt** — let players share or copy a spoiler-light solve receipt after a successful solve.
4. **Clue description mode** — add a visible text-equivalent description toggle so visual evidence is not the only way to interpret a clue.
5. **Keyboard-first navigation** — add a skip link plus `1`, `2`, `3`, `?`, and `Escape` shortcuts that are discoverable in help.
6. **Accessible dialog and semantics** — give the help dialog focus trapping/restoration, an escape path, description linkage, keyboard labels, and a correctly labelled puzzle panel.
7. **Resilient local progress** — validate stored data, sync changes across tabs, preserve in-progress drafts, and show whether the current progress is saved locally or the player is offline.
8. **Runtime failure recovery** — add an error boundary with a calm reload path so a rendering failure does not strand the player on a blank page.
9. **Install/share metadata** — add a web manifest and Open Graph/Twitter metadata for installability and better link previews.
10. **Logic and release verification** — extract game logic into testable modules, reject accidental substring matches, record the build commit identity, and make `npm run verify` cover all modes, failure states, hint scoring, progression, static assets, and release assertions.

## Release gates

- Local `npm run verify` and `npm audit --omit=dev --audit-level=high` must pass.
- GitHub Actions must pass on the final commit.
- Netlify must deploy the exact final build and expose `/`, `/puzzle`, `/manifest.webmanifest`, and `/robots.txt`.
- Production Playwright must exercise all modes, progression, hint, description mode, share fallback, help dialog, mobile overflow, console, and requests.
- The real Chrome profile must complete a final desktop pass with no app-origin errors.
