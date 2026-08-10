import assert from 'node:assert/strict'
import { modes, puzzles } from '../src/game-data.js'
import { evaluatePuzzle, expectedSequence, getDailyModeId, getNextModeId, includesKeyword, validatePuzzleCatalog } from '../src/game-logic.js'
import { parseProgress, progressVersion, serializeProgress } from '../src/progress.js'

const hidden = puzzles.find((puzzle) => puzzle.mode === 'hidden')
const odd = puzzles.find((puzzle) => puzzle.mode === 'odd')
const sequence = puzzles.find((puzzle) => puzzle.mode === 'sequence')

assert.equal(evaluatePuzzle(hidden, 'hidden', { question: 'What keeps passing?', answer: 'time', hintVisible: false }).solved, true)
assert.equal(evaluatePuzzle(odd, 'odd', { question: 'Which instrument does not belong?', selectedEvidence: 'bicycle', hintVisible: false }).solved, true)
assert.equal(evaluatePuzzle(sequence, 'sequence', { question: 'What does a seed become?', answer: 'fruit', sequence: expectedSequence(sequence), hintVisible: false }).solved, true)
assert.equal(evaluatePuzzle(hidden, 'hidden', { question: 'What is this?', answer: 'banana', hintVisible: false }).solved, false)
assert.equal(evaluatePuzzle(hidden, 'hidden', { question: 'What keeps passing?', answer: 'time', hintVisible: true }).score, 75)
assert.equal(getNextModeId('hidden', modes), 'odd')
assert.equal(getNextModeId('sequence', modes), 'hidden')
assert.equal(includesKeyword('sometimes', ['time']), false)
assert.equal(includesKeyword('What measures time?', ['time']), true)
assert.deepEqual(validatePuzzleCatalog(modes, puzzles), [])
assert.ok(modes.some((mode) => mode.id === getDailyModeId('2026-08-09', modes)))
const migrated = parseProgress(JSON.stringify({ lastMode: 'odd', completed: ['odd-band', 'not-a-puzzle'], score: 12.8, drafts: { 'odd-band': { question: 'x'.repeat(1200), selectedEvidence: 'bicycle' } } }))
assert.equal(migrated.version, progressVersion)
assert.deepEqual(migrated.completed, ['odd-band'])
assert.equal(migrated.score, 12)
assert.equal(migrated.drafts['odd-band'].question.length, 1000)
assert.equal(parseProgress('{bad json').version, progressVersion)
assert.equal(JSON.parse(serializeProgress(migrated)).version, progressVersion)
const bounded = parseProgress(JSON.stringify({ attempts: { 'hidden-time': -3, 'odd-band': 10001, 'not-a-puzzle': 8, 'sequence-garden': {} }, hints: [] }))
assert.deepEqual(bounded.attempts, { 'hidden-time': 0, 'odd-band': 9999 })
assert.deepEqual(bounded.hints, {})
const invalidCatalog = structuredClone(puzzles)
invalidCatalog[1].clues = invalidCatalog[1].clues.slice(0, 4)
assert.ok(validatePuzzleCatalog(modes, invalidCatalog).some((error) => error.includes('exactly one odd clue')))

console.log('Game logic verification passed: catalog integrity, all modes, failure state, hint scoring, progression, daily selection, and progress migration are covered.')
