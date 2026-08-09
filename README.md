# No Question

No Question is a visual brain-puzzle game built around a small reversal: the evidence is visible, but the question is not. Players infer the hidden prompt, enter an answer, and get a short explanation of the connection they found.

Live production site: https://no-question.netlify.app
Source repository: https://github.com/shanto12/no-question

## MVP modes

- **Hidden signal** — infer the invisible constant shared by three clues.
- **Odd one out** — identify the tile that breaks the shared rule.
- **Sequence sense** — arrange visual evidence into a natural order and name the result.

The current build is intentionally backend-free. Progress is saved locally in the browser, which keeps the game quick and makes the product safe to explore without account friction. A future production data layer can add daily puzzle rotation, anonymous telemetry, authoring tools, and cross-device progress without changing the core interaction.

## Local development

```bash
npm install
npm run dev
```

## Release checks

```bash
npm run verify
npm audit --omit=dev
```

The Netlify deployment uses the `dist` directory, SPA fallback routing, and security headers defined in `netlify.toml` and `public/_headers`.
