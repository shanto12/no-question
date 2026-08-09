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
