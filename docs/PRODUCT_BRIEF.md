# No Question — product brief

## The idea

Most puzzle games hand players a prompt and ask them to search for an answer. **No Question** reverses the order: the clues arrive first, and the player must infer what the clues are asking before they can solve anything.

That extra framing step turns a familiar answer game into a practice in observation, interpretation, and explanation.

## Brainstormed directions

1. **Hidden signal** — three to five clues point toward an invisible constant or concept. The player writes the likely prompt and answer.
2. **Odd one out** — a set shares a rule except for one tile. The player infers the rule and selects the break.
3. **Sequence sense** — shuffled evidence implies a natural timeline. The player orders the pieces and names the outcome.
4. **Set logic** — a visual set contains a missing or misplaced member. The player infers the grammar of the set.
5. **Perspective shift** — multiple representations of the same fact point toward a location, identity, or relationship.

## MVP decision

The first release ships the first three modes because together they exercise the main cognitive loop without requiring accounts, a backend, or a content-authoring system:

- Hidden signal tests framing and semantic association.
- Odd one out tests rule discovery and classification.
- Sequence sense tests temporal reasoning and interaction with ordered evidence.

## Interaction principles

- The question is never printed inside the puzzle board.
- The player writes the question and answer in separate steps.
- A hint is optional and visible as a tradeoff, not a punishment.
- Feedback explains the relationship that made the solution work.
- Progress is device-local in the MVP; no account or personal data is required.
- Keyboard focus, screen-reader labels, reduced motion, and non-color semantics are part of the first release.

## Next product bets

- A daily puzzle archive with a lightweight authoring workflow.
- Anonymous, privacy-conscious difficulty calibration.
- Text-equivalent clue descriptions for every image-based puzzle.
- Shareable solve receipts that do not reveal the answer.
- Optional cross-device progress after the core loop has proven repeatable.
