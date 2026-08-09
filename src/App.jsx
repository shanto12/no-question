import React, { useEffect, useMemo, useState } from 'react'

const modes = [
  {
    id: 'hidden',
    eyebrow: '01 / infer',
    name: 'Hidden signal',
    short: 'Find what the clues are asking.',
    icon: '◌',
    accent: 'amber',
  },
  {
    id: 'odd',
    eyebrow: '02 / notice',
    name: 'Odd one out',
    short: 'Find the detail that breaks the rule.',
    icon: '✳',
    accent: 'coral',
  },
  {
    id: 'sequence',
    eyebrow: '03 / arrange',
    name: 'Sequence sense',
    short: 'Put the evidence in its natural order.',
    icon: '↗',
    accent: 'mint',
  },
]

const puzzles = [
  {
    id: 'hidden-time',
    mode: 'hidden',
    difficulty: 'warm-up',
    title: 'Three clues. One invisible constant.',
    description: 'The answer is hiding in the relationship, not any single tile.',
    accent: 'amber',
    questionPlaceholder: 'What do you think these clues are asking?',
    answerPlaceholder: 'Name the invisible constant…',
    questionKeywords: ['repeat', 'measure', 'constant', 'pass', 'hold', 'change', 'point', 'time'],
    answerKeywords: ['time', 'moment', 'hours', 'clock'],
    explanation: 'The moon, the tide, and an hourglass all point toward time: something you can measure, feel passing, and never hold still.',
    intendedQuestion: 'What keeps passing even when nothing appears to move?',
    clues: [
      { label: 'moon phase', meta: 'wax / wane', glyph: '◐', tone: 'night' },
      { label: 'tide chart', meta: 'rise / fall', glyph: '≈', tone: 'water' },
      { label: 'hourglass', meta: 'grain by grain', glyph: '⌛', tone: 'sand' },
    ],
  },
  {
    id: 'odd-band',
    mode: 'odd',
    difficulty: 'observation',
    title: 'One of these never made the soundcheck.',
    description: 'Every tile belongs to a quiet pattern. One is faking it.',
    accent: 'coral',
    questionPlaceholder: 'What rule do you think is hiding here?',
    answerPlaceholder: 'Choose the tile that breaks it…',
    questionKeywords: ['instrument', 'music', 'sound', 'band', 'play', 'belongs', 'odd', 'instrument'],
    answerKeywords: ['bicycle', 'bike', 'wheel'],
    explanation: 'The violin, piano, trumpet, and drum are instruments. The bicycle is the only object that cannot make music as an instrument.',
    intendedQuestion: 'Which tile does not belong to the band?',
    clues: [
      { label: 'violin', meta: 'strings', glyph: '♬', tone: 'wine' },
      { label: 'piano', meta: 'keys', glyph: '▥', tone: 'cream' },
      { label: 'trumpet', meta: 'brass', glyph: '◁', tone: 'gold' },
      { label: 'drum', meta: 'percussion', glyph: '◉', tone: 'rose' },
      { label: 'bicycle', meta: 'two wheels', glyph: '◎', tone: 'mint', odd: true },
    ],
  },
  {
    id: 'sequence-garden',
    mode: 'sequence',
    difficulty: 'pattern',
    title: 'A garden, told out of order.',
    description: 'Tap the evidence into the order the story wants to happen.',
    accent: 'mint',
    questionPlaceholder: 'What story is this sequence answering?',
    answerPlaceholder: 'What is the final result?',
    questionKeywords: ['grow', 'happen', 'first', 'last', 'become', 'garden', 'plant', 'life'],
    answerKeywords: ['fruit', 'apple', 'harvest'],
    explanation: 'A seed comes first, then a sprout, then a blossom, then fruit. The final state answers the hidden “what does it become?” question.',
    intendedQuestion: 'What does the small beginning become?',
    clues: [
      { label: 'fruit', meta: 'the result', glyph: '●', tone: 'coral', order: 4 },
      { label: 'blossom', meta: 'the turning point', glyph: '✺', tone: 'pink', order: 3 },
      { label: 'seed', meta: 'the beginning', glyph: '•', tone: 'soil', order: 1 },
      { label: 'sprout', meta: 'the first reach', glyph: '⌁', tone: 'leaf', order: 2 },
    ],
  },
]

const initialProgress = { completed: [], score: 0, streak: 3 }

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

function includesKeyword(value, keywords) {
  const normalized = normalize(value)
  return keywords.some((keyword) => normalized.includes(keyword))
}

function progressFromStorage() {
  try {
    const stored = window.localStorage.getItem('no-question-progress')
    return stored ? { ...initialProgress, ...JSON.parse(stored) } : initialProgress
  } catch {
    return initialProgress
  }
}

function App() {
  const [activeMode, setActiveMode] = useState('hidden')
  const [progress, setProgress] = useState(progressFromStorage)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [sequence, setSequence] = useState([])
  const [hintVisible, setHintVisible] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const puzzle = useMemo(() => puzzles.find((item) => item.mode === activeMode), [activeMode])
  const mode = modes.find((item) => item.id === activeMode)
  const isCompleted = progress.completed.includes(puzzle.id)

  useEffect(() => {
    window.localStorage.setItem('no-question-progress', JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    setQuestion('')
    setAnswer('')
    setSelectedEvidence(null)
    setSequence([])
    setHintVisible(false)
    setFeedback(null)
  }, [activeMode])

  function chooseMode(modeId) {
    setActiveMode(modeId)
    document.getElementById('puzzle')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function resetPuzzle() {
    setQuestion('')
    setAnswer('')
    setSelectedEvidence(null)
    setSequence([])
    setHintVisible(false)
    setFeedback(null)
  }

  function selectSequence(clue) {
    setFeedback(null)
    setSequence((current) => current.includes(clue.label)
      ? current.filter((label) => label !== clue.label)
      : [...current, clue.label])
  }

  function submitPuzzle(event) {
    event.preventDefault()
    const questionCorrect = includesKeyword(question, puzzle.questionKeywords)
    const answerCorrect = includesKeyword(answer, puzzle.answerKeywords)
    const evidenceCorrect = activeMode === 'odd' && puzzle.clues.find((clue) => clue.label === selectedEvidence)?.odd
    const sequenceCorrect = activeMode === 'sequence' && sequence.join('|') === puzzle.clues.slice().sort((a, b) => a.order - b.order).map((clue) => clue.label).join('|')

    const solved = activeMode === 'hidden'
      ? questionCorrect && answerCorrect
      : activeMode === 'odd'
        ? questionCorrect && evidenceCorrect
        : questionCorrect && answerCorrect && sequenceCorrect

    const answerOnTarget = activeMode === 'odd' ? evidenceCorrect : answerCorrect
    const score = Math.max(0, (questionCorrect ? 20 : 0) + (answerOnTarget ? 70 : 0) + (sequenceCorrect ? 10 : 0) - (hintVisible ? 15 : 0))

    if (solved) {
      const alreadyDone = progress.completed.includes(puzzle.id)
      setProgress((current) => ({
        ...current,
        completed: alreadyDone ? current.completed : [...current.completed, puzzle.id],
        score: alreadyDone ? current.score : current.score + score,
      }))
      setFeedback({ type: 'success', title: 'You found the question.', body: `${puzzle.intendedQuestion} ${puzzle.explanation}` })
      return
    }

    if (questionCorrect || answerOnTarget) {
      setFeedback({ type: 'near', title: 'You are circling it.', body: questionCorrect ? 'The question is close. Now make the answer precise.' : 'The answer is on target. Complete the question to close the loop.' })
    } else {
      setFeedback({ type: 'try', title: 'The clues are still quiet.', body: 'Look for the relationship shared by the tiles, then name what that relationship is asking.' })
    }
  }

  function revealHint() {
    setHintVisible(true)
    setFeedback({ type: 'hint', title: 'A little less hidden.', body: activeMode === 'hidden' ? 'Think about something that moves without traveling.' : activeMode === 'odd' ? 'Four tiles belong to the same creative family.' : 'Start with the thing that could fit in your palm.' })
  }

  function handleAnswerChange(event) {
    setAnswer(event.target.value)
    if (feedback) setFeedback(null)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="No Question home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
          <span>no question</span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <a href="#puzzle">Play</a>
          <a href="#modes">Modes</a>
          <a href="#about">Why this works</a>
        </nav>
        <div className="header-actions">
          <span className="streak-pill"><span aria-hidden="true">✦</span> {progress.streak} day streak</span>
          <button className="icon-button" type="button" aria-label="Open how to play" onClick={() => setIsHelpOpen(true)}>?</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> visual brain games / issue 001</p>
            <h1 id="hero-title">The question<br /><em>is missing.</em></h1>
            <p className="hero-subtitle">Read the clues. Feel the pattern. Figure out what you’re being asked — then solve it.</p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={() => chooseMode('hidden')}>Play today’s puzzle <span aria-hidden="true">↗</span></button>
              <a className="text-link" href="#modes">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true"><span>R</span><span>M</span><span>J</span><span>+</span></div>
              <p><strong>18,420</strong> curious minds<br />are solving without a prompt.</p>
            </div>
          </div>
          <div className="hero-art" aria-label="An abstract arrangement of puzzle pieces">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-piece piece-large"><span className="piece-glyph">?</span><span className="piece-label">start here</span></div>
            <div className="hero-piece piece-small piece-amber"><span>◌</span></div>
            <div className="hero-piece piece-small piece-mint"><span>✳</span></div>
            <div className="hero-piece piece-small piece-coral"><span>↗</span></div>
            <div className="art-note note-top">no hints<br />until asked</div>
            <div className="art-note note-bottom">a better<br />kind of hard</div>
          </div>
        </section>

        <section className="game-section" id="puzzle" aria-labelledby="puzzle-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> your daily set</p>
              <h2 id="puzzle-title">Start with what you can see.</h2>
            </div>
            <div className="completion-meter" aria-label={`${progress.completed.length} of ${puzzles.length} puzzles solved`}>
              <span>set progress</span>
              <strong>{String(progress.completed.length).padStart(2, '0')} <small>/ {String(puzzles.length).padStart(2, '0')}</small></strong>
              <div className="meter-track"><span style={{ width: `${(progress.completed.length / puzzles.length) * 100}%` }} /></div>
            </div>
          </div>

          <div className="mode-tabs" role="tablist" aria-label="Puzzle modes" id="modes">
            {modes.map((item) => (
              <button
                className={`mode-tab ${activeMode === item.id ? 'active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeMode === item.id}
                aria-controls="puzzle-panel"
                data-testid={`mode-tab-${item.id}`}
                key={item.id}
                onClick={() => chooseMode(item.id)}
              >
                <span className={`mode-icon ${item.accent}`} aria-hidden="true">{item.icon}</span>
                <span><small>{item.eyebrow}</small><strong>{item.name}</strong></span>
                <span className="mode-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div className={`puzzle-layout accent-${puzzle.accent}`} id="puzzle-panel" role="tabpanel">
            <div className="puzzle-board">
              <div className="board-topline"><span>puzzle / {puzzle.difficulty}</span><span>no. 00{modes.findIndex((item) => item.id === activeMode) + 1}</span></div>
              <div className="board-heading">
                <div><span className="status-dot" /> evidence is live</div>
                {isCompleted && <span className="solved-tag">solved ✓</span>}
              </div>
              <h3>{puzzle.title}</h3>
              <p className="board-description">{puzzle.description}</p>
              <div className={`clue-grid mode-${activeMode}`}>
                {puzzle.clues.map((clue, index) => (
                  <button
                    type="button"
                    className={`clue-tile tone-${clue.tone} ${selectedEvidence === clue.label ? 'selected' : ''} ${sequence.includes(clue.label) ? 'in-sequence' : ''}`}
                    key={clue.label}
                    aria-label={`${clue.label}, ${clue.meta}${clue.odd ? ', possible odd one out' : ''}`}
                    aria-pressed={activeMode === 'odd' ? selectedEvidence === clue.label : sequence.includes(clue.label)}
                    onClick={() => activeMode === 'odd' ? setSelectedEvidence(clue.label) : activeMode === 'sequence' ? selectSequence(clue) : null}
                  >
                    <span className="clue-number">0{index + 1}</span>
                    <span className="clue-glyph" aria-hidden="true">{clue.glyph}</span>
                    <span className="clue-label">{clue.label}</span>
                    <span className="clue-meta">{clue.meta}</span>
                    {activeMode === 'sequence' && sequence.includes(clue.label) && <span className="sequence-badge">{sequence.indexOf(clue.label) + 1}</span>}
                  </button>
                ))}
              </div>
              {hintVisible && <div className="hint-strip"><span aria-hidden="true">⌁</span><span><strong>One extra signal:</strong> {activeMode === 'hidden' ? 'it has been measured for longer than anyone can remember.' : activeMode === 'odd' ? 'the odd tile has a different kind of motion.' : 'the story begins below the surface.'}</span></div>}
            </div>

            <form className="solve-panel" onSubmit={submitPuzzle}>
              <div className="solve-kicker"><span className={`mode-icon ${mode.accent}`} aria-hidden="true">{mode.icon}</span><span>{mode.name}</span></div>
              <h3>What’s the question?</h3>
              <p className="solve-intro">It’s your move. Write the question you think these clues are asking, then give us your answer.</p>

              <label htmlFor="question-input">01 / infer the prompt</label>
              <textarea id="question-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={puzzle.questionPlaceholder} rows="3" required />

              {activeMode === 'odd' ? (
                <fieldset>
                  <legend>02 / choose the answer</legend>
                  <div className="choice-grid">
                    {puzzle.clues.map((clue) => <button className={`choice-button ${selectedEvidence === clue.label ? 'selected' : ''}`} type="button" key={clue.label} onClick={() => setSelectedEvidence(clue.label)}>{clue.label}<span aria-hidden="true">{selectedEvidence === clue.label ? '✓' : '↗'}</span></button>)}
                  </div>
                </fieldset>
              ) : (
                <>
                  <label htmlFor="answer-input">02 / name the answer</label>
                  <input id="answer-input" value={answer} onChange={handleAnswerChange} placeholder={puzzle.answerPlaceholder} required />
                </>
              )}

              {activeMode === 'sequence' && <p className="sequence-helper"><span aria-hidden="true">↗</span> Tap tiles in order. Your sequence: <strong>{sequence.length ? sequence.join(' → ') : 'not started'}</strong></p>}

              <div className="solve-actions">
                <button className="button button-primary solve-button" type="submit" data-testid="submit-puzzle">Check my thinking <span aria-hidden="true">↗</span></button>
                <button className="button button-quiet" type="button" onClick={revealHint}>Reveal a clue <span aria-hidden="true">⌁</span></button>
              </div>
              {feedback && <div className={`feedback feedback-${feedback.type}`} role="status"><span className="feedback-icon" aria-hidden="true">{feedback.type === 'success' ? '✓' : feedback.type === 'hint' ? '⌁' : '!'}</span><div><strong>{feedback.title}</strong><p>{feedback.body}</p></div></div>}
            </form>
          </div>

          <div className="game-footer"><span><span className="tiny-dot" /> no timer / no leaderboard pressure</span><button type="button" onClick={resetPuzzle}>Reset this puzzle <span aria-hidden="true">↺</span></button><span>score: <strong>{String(progress.score).padStart(3, '0')}</strong></span></div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="about-stamp" aria-hidden="true"><span>the</span><strong>WHY</strong><span>behind the play</span></div>
          <div className="about-copy"><p className="eyebrow"><span className="eyebrow-line" /> a small manifesto</p><h2 id="about-title">Hard should feel<br /><em>rewarding.</em></h2><p>Most games give you a question and ask you to search for the answer. No Question starts one step earlier. You practice noticing, framing, and trusting the connection you found.</p><p>There is no trivia bank to memorize. Just a quiet screen, a handful of evidence, and the satisfying click when the invisible prompt becomes obvious.</p><a className="text-link" href="#puzzle">Enter the next puzzle <span aria-hidden="true">↗</span></a></div>
        </section>

        <section className="mode-overview" aria-labelledby="mode-overview-title">
          <div className="section-heading compact"><div><p className="eyebrow"><span className="eyebrow-line" /> the field guide</p><h2 id="mode-overview-title">Three ways to get unstuck.</h2></div><span className="section-count">03 / 03</span></div>
          <div className="mode-cards">{modes.map((item, index) => <button className={`mode-card card-${item.accent}`} type="button" key={item.id} onClick={() => chooseMode(item.id)}><span className="card-index">0{index + 1}</span><span className={`card-icon ${item.accent}`} aria-hidden="true">{item.icon}</span><span className="card-copy"><strong>{item.name}</strong><span>{item.short}</span></span><span className="card-arrow" aria-hidden="true">↗</span></button>)}</div>
        </section>
      </main>

      <footer className="site-footer"><a className="brand" href="#top"><span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span><span>no question</span></a><span>made for the gloriously curious</span><span>© 2026 / issue 001</span></footer>

      {isHelpOpen && <div className="modal-backdrop" role="presentation" onClick={() => setIsHelpOpen(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" aria-label="Close how to play" onClick={() => setIsHelpOpen(false)}>×</button><p className="eyebrow"><span className="eyebrow-line" /> the only rule</p><h2 id="help-title">The question is yours.</h2><p>Every puzzle gives you evidence but withholds the prompt. Write the question you think is hiding there, then make the answer fit. You can ask for one clue if you need a nudge.</p><div className="help-steps"><span><b>01</b> notice</span><span><b>02</b> frame</span><span><b>03</b> solve</span></div><button className="button button-primary" type="button" onClick={() => { setIsHelpOpen(false); document.getElementById('puzzle')?.scrollIntoView({ behavior: 'smooth' }) }}>Got it — let’s play <span aria-hidden="true">↗</span></button></section></div>}
    </div>
  )
}

export default App
