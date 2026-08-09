import assert from 'node:assert/strict'
import { modes, puzzles } from '../src/game-data.js'
import { evaluatePuzzle, expectedSequence, getNextModeId, includesKeyword } from '../src/game-logic.js'

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

console.log('Game logic verification passed: all modes, failure state, hint score, and progression are covered.')
