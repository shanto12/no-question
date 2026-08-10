import { initialProgress, modes, puzzles } from './game-data.js'

export const progressKey = 'no-question-progress'
export const progressVersion = 2

function validMode(modeId) {
  return modes.some((mode) => mode.id === modeId)
}

function validPuzzle(puzzleId) {
  return puzzles.some((puzzle) => puzzle.id === puzzleId)
}

function cleanDraft(draft, puzzle) {
  if (!draft || typeof draft !== 'object') return {}
  const labels = new Set(puzzle.clues.map((clue) => clue.label))
  return {
    question: typeof draft.question === 'string' ? draft.question.slice(0, 1000) : '',
    answer: typeof draft.answer === 'string' ? draft.answer.slice(0, 240) : '',
    selectedEvidence: labels.has(draft.selectedEvidence) ? draft.selectedEvidence : null,
    sequence: Array.isArray(draft.sequence) ? [...new Set(draft.sequence.filter((label) => labels.has(label)))].slice(0, puzzle.clues.length) : [],
  }
}

function cleanCounterMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value)
    .filter(([puzzleId, count]) => validPuzzle(puzzleId) && Number.isFinite(count))
    .map(([puzzleId, count]) => [puzzleId, Math.min(9999, Math.max(0, Math.floor(count)))]))
  }

export function parseProgress(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : {}
    const completed = Array.isArray(parsed.completed) ? [...new Set(parsed.completed.filter(validPuzzle))] : []
    const drafts = {}
    if (parsed.drafts && typeof parsed.drafts === 'object') {
      for (const puzzle of puzzles) drafts[puzzle.id] = cleanDraft(parsed.drafts[puzzle.id], puzzle)
    }
    return {
      ...initialProgress,
      ...parsed,
      version: progressVersion,
      lastMode: validMode(parsed.lastMode) ? parsed.lastMode : initialProgress.lastMode,
      completed,
      score: Number.isFinite(parsed.score) ? Math.max(0, Math.floor(parsed.score)) : 0,
      streak: Number.isFinite(parsed.streak) ? Math.max(0, Math.floor(parsed.streak)) : 0,
      lastSolvedDate: typeof parsed.lastSolvedDate === 'string' ? parsed.lastSolvedDate.slice(0, 10) : initialProgress.lastSolvedDate,
      attempts: cleanCounterMap(parsed.attempts),
      hints: cleanCounterMap(parsed.hints),
      drafts,
    }
  } catch {
    return { ...initialProgress }
  }
}

export function serializeProgress(progress) {
  return JSON.stringify({
    ...progress,
    version: progressVersion,
  }, null, 2)
}

export function isProgressEnvelope(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (Number.isFinite(value.version) && value.version > progressVersion) return false
  return ['lastMode', 'completed', 'score', 'streak', 'attempts', 'hints', 'drafts'].some((key) => key in value)
}

export function readStoredProgress() {
  try {
    return parseProgress(window.localStorage.getItem(progressKey))
  } catch {
    return { ...initialProgress }
  }
}
