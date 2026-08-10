export function normalize(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function includesKeyword(value, keywords = []) {
  const normalized = normalize(value)
  const padded = ` ${normalized} `
  return keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword)
    return normalized === normalizedKeyword || padded.includes(` ${normalizedKeyword} `)
  })
}

export function expectedSequence(puzzle) {
  return puzzle.clues.slice().sort((a, b) => a.order - b.order).map((clue) => clue.label)
}

export function evaluatePuzzle(puzzle, modeId, state) {
  const questionCorrect = includesKeyword(state.question, puzzle.questionKeywords)
  const answerCorrect = includesKeyword(state.answer, puzzle.answerKeywords)
  const evidenceCorrect = modeId === 'odd' && Boolean(puzzle.clues.find((clue) => clue.label === state.selectedEvidence)?.odd)
  const sequenceCorrect = modeId === 'sequence' && state.sequence.join('|') === expectedSequence(puzzle).join('|')
  const answerOnTarget = modeId === 'odd' ? evidenceCorrect : answerCorrect
  const solved = modeId === 'hidden'
    ? questionCorrect && answerCorrect
    : modeId === 'odd'
      ? questionCorrect && evidenceCorrect
      : questionCorrect && answerCorrect && sequenceCorrect

  return {
    questionCorrect,
    answerCorrect,
    evidenceCorrect,
    sequenceCorrect,
    answerOnTarget,
    solved,
    score: Math.max(0, (questionCorrect ? 20 : 0) + (answerOnTarget ? 70 : 0) + (sequenceCorrect ? 10 : 0) - (state.hintVisible ? 15 : 0)),
  }
}

export function getNextModeId(currentModeId, modes) {
  const index = modes.findIndex((mode) => mode.id === currentModeId)
  return modes[(index + 1) % modes.length]?.id ?? modes[0]?.id
}

export function getDailyModeId(dateKey, modes) {
  const digits = String(dateKey).replace(/\D/g, '')
  const dayValue = Number(digits.slice(-2)) || 0
  return modes[dayValue % modes.length]?.id ?? modes[0]?.id
}

export function validatePuzzleCatalog(modes, puzzles) {
  const errors = []
  const modeIds = new Set()
  const puzzleIds = new Set()
  const puzzlesByMode = new Map()

  for (const mode of modes) {
    if (!mode?.id || modeIds.has(mode.id)) errors.push(`mode id must be unique: ${mode?.id ?? 'missing'}`)
    modeIds.add(mode?.id)
  }

  for (const puzzle of puzzles) {
    if (!puzzle?.id || puzzleIds.has(puzzle.id)) errors.push(`puzzle id must be unique: ${puzzle?.id ?? 'missing'}`)
    puzzleIds.add(puzzle?.id)
    puzzlesByMode.set(puzzle?.mode, (puzzlesByMode.get(puzzle?.mode) ?? 0) + 1)
    if (!modeIds.has(puzzle?.mode)) errors.push(`${puzzle.id ?? 'puzzle'} references an unknown mode`)
    if (!puzzle?.title || !puzzle?.description || !puzzle?.intendedQuestion) errors.push(`${puzzle.id ?? 'puzzle'} is missing player-facing copy`)
    if (!Array.isArray(puzzle?.questionKeywords) || !puzzle.questionKeywords.length) errors.push(`${puzzle.id ?? 'puzzle'} has no question keywords`)
    if (!Array.isArray(puzzle?.answerKeywords) || !puzzle.answerKeywords.length) errors.push(`${puzzle.id ?? 'puzzle'} has no answer keywords`)
    if (!Array.isArray(puzzle?.clues) || puzzle.clues.length < 2) {
      errors.push(`${puzzle.id ?? 'puzzle'} needs at least two clues`)
      continue
    }
    const clueLabels = new Set()
    for (const clue of puzzle.clues) {
      if (!clue?.label || clueLabels.has(clue.label)) errors.push(`${puzzle.id ?? 'puzzle'} clue labels must be unique`)
      clueLabels.add(clue?.label)
      if (!clue?.meta || !clue?.description || !clue?.glyph) errors.push(`${puzzle.id ?? 'puzzle'} has an incomplete clue`)
    }
    if (puzzle.mode === 'odd' && puzzle.clues.filter((clue) => clue.odd).length !== 1) errors.push(`${puzzle.id} must have exactly one odd clue`)
    if (puzzle.mode === 'sequence') {
      const orders = puzzle.clues.map((clue) => clue.order).sort((a, b) => a - b)
      if (orders.some((order, index) => order !== index + 1)) errors.push(`${puzzle.id} sequence orders must be contiguous from 1`)
    }
  }

  if (puzzles.length !== modes.length || modes.some((mode) => puzzlesByMode.get(mode.id) !== 1)) errors.push('every mode must have exactly one puzzle in the current release')
  return errors
}
