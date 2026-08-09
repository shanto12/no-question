import React, { useEffect, useMemo, useRef, useState } from 'react'
import { initialProgress, modes, puzzles } from './game-data.js'
import { evaluatePuzzle, getNextModeId } from './game-logic.js'

const progressKey = 'no-question-progress'

function parseProgress(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      ...initialProgress,
      ...parsed,
      lastMode: modes.some((item) => item.id === parsed.lastMode) ? parsed.lastMode : initialProgress.lastMode,
      completed: Array.isArray(parsed.completed) ? [...new Set(parsed.completed.filter((id) => puzzles.some((puzzle) => puzzle.id === id)))] : [],
      score: Number.isFinite(parsed.score) ? Math.max(0, parsed.score) : 0,
      streak: Number.isFinite(parsed.streak) ? Math.max(0, parsed.streak) : initialProgress.streak,
      lastSolvedDate: typeof parsed.lastSolvedDate === 'string' ? parsed.lastSolvedDate : initialProgress.lastSolvedDate,
      attempts: parsed.attempts && typeof parsed.attempts === 'object' ? parsed.attempts : {},
      hints: parsed.hints && typeof parsed.hints === 'object' ? parsed.hints : {},
      drafts: parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts : {},
    }
  } catch {
    return initialProgress
  }
}

function loadProgress() {
  try {
    return parseProgress(window.localStorage.getItem(progressKey))
  } catch {
    return initialProgress
  }
}

function solveDateKey(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 86400000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(date)
}

function App() {
  const [storedProgress] = useState(loadProgress)
  const [activeMode, setActiveMode] = useState(storedProgress.lastMode)
  const [progress, setProgress] = useState(storedProgress)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [sequence, setSequence] = useState([])
  const [hintVisible, setHintVisible] = useState(false)
  const [showDescriptions, setShowDescriptions] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [saveState, setSaveState] = useState('saving')
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine)
  const [shareState, setShareState] = useState('Share solve')
  const helpCloseRef = useRef(null)
  const lastFocusedRef = useRef(null)

  const puzzle = useMemo(() => puzzles.find((item) => item.mode === activeMode), [activeMode])
  const mode = modes.find((item) => item.id === activeMode)
  const isCompleted = progress.completed.includes(puzzle.id)
  const attempts = progress.attempts[puzzle.id] ?? 0
  const hintsUsed = progress.hints[puzzle.id] ?? 0
  const nextModeId = getNextModeId(activeMode, modes)
  const isSetComplete = progress.completed.length === puzzles.length

  useEffect(() => {
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(progress))
      setSaveState('saved on this device')
    } catch {
      setSaveState('device save unavailable')
    }
  }, [progress])

  useEffect(() => {
    function onStorage(event) {
      if (event.key === progressKey && event.newValue) {
        setProgress(parseProgress(event.newValue))
        setSaveState('synced from another tab')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    function setConnection() {
      setIsOnline(navigator.onLine)
    }
    window.addEventListener('online', setConnection)
    window.addEventListener('offline', setConnection)
    return () => {
      window.removeEventListener('online', setConnection)
      window.removeEventListener('offline', setConnection)
    }
  }, [])

  useEffect(() => {
    if (isHelpOpen) {
      window.requestAnimationFrame(() => helpCloseRef.current?.focus())
    }
  }, [isHelpOpen])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        if (isHelpOpen) closeHelp()
        return
      }
      if (isHelpOpen) {
        if (event.key === 'Tab') {
          const focusable = Array.from(document.querySelectorAll('.help-modal button, .help-modal a, .help-modal input, .help-modal textarea, .help-modal select, .help-modal [tabindex]:not([tabindex="-1"])'))
          if (focusable.length) {
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first.focus()
            }
          }
        }
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key === '?') openHelp()
      if (event.key === '1') chooseMode('hidden')
      if (event.key === '2') chooseMode('odd')
      if (event.key === '3') chooseMode('sequence')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isHelpOpen])

  useEffect(() => {
    const draft = progress.drafts?.[puzzle.id] ?? {}
    setQuestion(typeof draft.question === 'string' ? draft.question : '')
    setAnswer(typeof draft.answer === 'string' ? draft.answer : '')
    setSelectedEvidence(typeof draft.selectedEvidence === 'string' ? draft.selectedEvidence : null)
    setSequence(Array.isArray(draft.sequence) ? draft.sequence : [])
    setHintVisible(false)
    setShowDescriptions(false)
    setFeedback(null)
    setShareState('Share solve')
  }, [activeMode])

  function openHelp() {
    lastFocusedRef.current = document.activeElement
    setIsHelpOpen(true)
  }

  function closeHelp() {
    setIsHelpOpen(false)
    window.requestAnimationFrame(() => lastFocusedRef.current?.focus?.())
  }

  function writeDraft(changes) {
    setProgress((current) => ({
      ...current,
      drafts: {
        ...current.drafts,
        [puzzle.id]: {
          ...current.drafts?.[puzzle.id],
          ...changes,
        },
      },
    }))
  }

  function chooseMode(modeId) {
    setActiveMode(modeId)
    setProgress((current) => ({ ...current, lastMode: modeId }))
    document.getElementById('puzzle')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function resetPuzzle() {
    setQuestion('')
    setAnswer('')
    setSelectedEvidence(null)
    setSequence([])
    setHintVisible(false)
    setShowDescriptions(false)
    setFeedback(null)
    setShareState('Share solve')
    writeDraft({ question: '', answer: '', selectedEvidence: null, sequence: [] })
  }

  function selectSequence(clue) {
    setFeedback(null)
    const nextSequence = sequence.includes(clue.label)
      ? sequence.filter((label) => label !== clue.label)
      : [...sequence, clue.label]
    setSequence(nextSequence)
    writeDraft({ sequence: nextSequence })
  }

  function selectEvidence(label) {
    setSelectedEvidence(label)
    writeDraft({ selectedEvidence: label })
    setFeedback(null)
  }

  function submitPuzzle(event) {
    event.preventDefault()
    const evaluation = evaluatePuzzle(puzzle, activeMode, { question, answer, selectedEvidence, sequence, hintVisible })
    const attemptNumber = attempts + 1
    const alreadyDone = progress.completed.includes(puzzle.id)

    setProgress((current) => {
      const nextAttempts = { ...current.attempts, [puzzle.id]: attemptNumber }
      const nextProgress = { ...current, attempts: nextAttempts }
      if (!evaluation.solved) return nextProgress
      const today = solveDateKey()
      const yesterday = solveDateKey(-1)
      const nextStreak = current.lastSolvedDate === today
        ? current.streak
        : current.lastSolvedDate === yesterday
          ? current.streak + 1
          : 1
      return {
        ...nextProgress,
        completed: alreadyDone ? current.completed : [...current.completed, puzzle.id],
        score: alreadyDone ? current.score : current.score + evaluation.score,
        streak: alreadyDone ? current.streak : nextStreak,
        lastSolvedDate: alreadyDone ? current.lastSolvedDate : today,
      }
    })

    if (evaluation.solved) {
      setFeedback({ type: 'success', title: 'You found the question.', body: `${puzzle.intendedQuestion} ${puzzle.explanation}`, score: evaluation.score, attemptNumber })
    } else if (evaluation.questionCorrect || evaluation.answerOnTarget) {
      setFeedback({ type: 'near', title: 'You are circling it.', body: evaluation.questionCorrect ? 'The question is close. Now make the answer precise.' : 'The answer is on target. Complete the question to close the loop.' })
    } else {
      setFeedback({ type: 'try', title: 'The clues are still quiet.', body: 'Look for the relationship shared by the tiles, then name what that relationship is asking.' })
    }
  }

  function revealHint() {
    if (!hintVisible) {
      setHintVisible(true)
      setProgress((current) => ({ ...current, hints: { ...current.hints, [puzzle.id]: (current.hints[puzzle.id] ?? 0) + 1 } }))
    }
    setFeedback({ type: 'hint', title: 'A little less hidden.', body: activeMode === 'hidden' ? 'Think about something that moves without traveling.' : activeMode === 'odd' ? 'Four tiles belong to the same creative family.' : 'Start with the thing that could fit in your palm.' })
  }

  async function shareResult() {
    const text = `No Question / ${puzzle.id}\n${puzzle.intendedQuestion}\nScore: ${feedback?.score ?? 0} · Attempt ${feedback?.attemptNumber ?? attempts}\n\nSolve yours: https://no-question.netlify.app/#puzzle`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'No Question solve', text, url: 'https://no-question.netlify.app/#puzzle' })
        setShareState('Shared')
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setShareState('Copied solve')
      } else {
        setShareState('Copy unavailable')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareState('Try again')
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#puzzle">Skip to today’s puzzle</a>
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
          <button className="icon-button" type="button" aria-label="Open how to play" onClick={openHelp}>?</button>
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
              <p><strong>{puzzles.length}</strong> visual modes<br />{progress.completed.length ? `${progress.completed.length} solved in this set.` : 'your first solve is waiting.'}</p>
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
                <button className={`mode-tab ${activeMode === item.id ? 'active' : ''}`} id={`mode-tab-${item.id}`} type="button" role="tab" aria-selected={activeMode === item.id} aria-controls="puzzle-panel" data-testid={`mode-tab-${item.id}`} key={item.id} onClick={() => chooseMode(item.id)}>
                <span className={`mode-icon ${item.accent}`} aria-hidden="true">{item.icon}</span>
                <span><small>{item.eyebrow}</small><strong>{item.name}</strong></span>
                <span className="mode-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div className={`puzzle-layout accent-${puzzle.accent}`} id="puzzle-panel" role="tabpanel" aria-labelledby={`mode-tab-${activeMode}`}>
            <div className="puzzle-board">
              <div className="board-topline"><span>puzzle / {puzzle.difficulty}</span><span>no. 00{modes.findIndex((item) => item.id === activeMode) + 1}</span></div>
              <div className="board-heading">
                <div><span className="status-dot" /> evidence is live</div>
                <div className="puzzle-stats"><span>{attempts} attempt{attempts === 1 ? '' : 's'}</span><span>{hintsUsed} hint{hintsUsed === 1 ? '' : 's'}</span>{isCompleted && <span className="solved-tag">solved ✓</span>}</div>
              </div>
              <h3>{puzzle.title}</h3>
              <p className="board-description">{puzzle.description}</p>
              <button className="description-toggle" type="button" aria-pressed={showDescriptions} onClick={() => setShowDescriptions((current) => !current)} data-testid="description-toggle">{showDescriptions ? 'Hide clue descriptions' : 'Describe the clues'} <span aria-hidden="true">{showDescriptions ? '−' : '+'}</span></button>
              <div className={`clue-grid mode-${activeMode}`} aria-label={`Visual clues for ${mode.name}`}>
                {puzzle.clues.map((clue, index) => (
                  <button type="button" className={`clue-tile tone-${clue.tone} ${selectedEvidence === clue.label ? 'selected' : ''} ${sequence.includes(clue.label) ? 'in-sequence' : ''} ${showDescriptions ? 'has-description' : ''}`} key={clue.label} disabled={activeMode === 'hidden'} aria-label={`${clue.label}, ${clue.meta}${clue.odd ? ', possible odd one out' : ''}`} aria-pressed={activeMode === 'odd' ? selectedEvidence === clue.label : sequence.includes(clue.label)} onClick={() => activeMode === 'odd' ? selectEvidence(clue.label) : activeMode === 'sequence' ? selectSequence(clue) : null}>
                    <span className="clue-number">0{index + 1}</span>
                    <span className="clue-glyph" aria-hidden="true">{clue.glyph}</span>
                    <span className="clue-label">{clue.label}</span>
                    <span className="clue-meta">{clue.meta}</span>
                    {showDescriptions && <span className="clue-description">{clue.description}</span>}
                    {activeMode === 'sequence' && sequence.includes(clue.label) && <span className="sequence-badge">{sequence.indexOf(clue.label) + 1}</span>}
                  </button>
                ))}
              </div>
              {hintVisible && <div className="hint-strip"><span aria-hidden="true">⌁</span><span><strong>One extra signal:</strong> {activeMode === 'hidden' ? 'it has been measured for longer than anyone can remember.' : activeMode === 'odd' ? 'Four tiles belong to the same creative family.' : 'The story begins below the surface.'}</span></div>}
            </div>

            <form className="solve-panel" onSubmit={submitPuzzle} aria-describedby="solve-intro">
              <div className="solve-kicker"><span className={`mode-icon ${mode.accent}`} aria-hidden="true">{mode.icon}</span><span>{mode.name}</span></div>
              <h3>What’s the question?</h3>
              <p className="solve-intro" id="solve-intro">It’s your move. Write the question you think these clues are asking, then give us your answer.</p>

              <label htmlFor="question-input">01 / infer the prompt</label>
              <textarea id="question-input" value={question} onChange={(event) => { setQuestion(event.target.value); writeDraft({ question: event.target.value }); if (feedback?.type !== 'success') setFeedback(null) }} placeholder={puzzle.questionPlaceholder} rows="3" required />

              {activeMode === 'odd' ? (
                <fieldset>
                  <legend>02 / choose the answer</legend>
                  <div className="choice-grid">
                    {puzzle.clues.map((clue) => <button className={`choice-button ${selectedEvidence === clue.label ? 'selected' : ''}`} type="button" key={clue.label} onClick={() => selectEvidence(clue.label)}>{clue.label}<span aria-hidden="true">{selectedEvidence === clue.label ? '✓' : '↗'}</span></button>)}
                  </div>
                </fieldset>
              ) : (
                <>
                  <label htmlFor="answer-input">02 / name the answer</label>
                  <input id="answer-input" value={answer} onChange={(event) => { setAnswer(event.target.value); writeDraft({ answer: event.target.value }); if (feedback?.type !== 'success') setFeedback(null) }} placeholder={puzzle.answerPlaceholder} required />
                </>
              )}

              {activeMode === 'sequence' && <p className="sequence-helper"><span aria-hidden="true">↗</span> Tap tiles in order. Your sequence: <strong>{sequence.length ? sequence.join(' → ') : 'not started'}</strong></p>}

              <div className="solve-actions">
                <button className="button button-primary solve-button" type="submit" data-testid="submit-puzzle">Check my thinking <span aria-hidden="true">↗</span></button>
                <button className="button button-quiet" type="button" onClick={revealHint} data-testid="hint-button">Reveal a clue <span className="hint-cost">−15</span></button>
              </div>
              {feedback && <div className={`feedback feedback-${feedback.type}`} role="status" data-testid="feedback"><span className="feedback-icon" aria-hidden="true">{feedback.type === 'success' ? '✓' : feedback.type === 'hint' ? '⌁' : '!'}</span><div><strong>{feedback.title}</strong><p>{feedback.body}</p>{feedback.type === 'success' && <div className="feedback-actions"><button className="feedback-button" type="button" onClick={shareResult} data-testid="share-solve">{shareState} <span aria-hidden="true">↗</span></button><button className="feedback-button" type="button" onClick={() => chooseMode(nextModeId)} data-testid="next-puzzle">{isSetComplete ? 'Replay this set' : 'Next puzzle'} <span aria-hidden="true">→</span></button></div>}</div></div>}
            </form>
          </div>

          <div className="game-footer"><span><span className="tiny-dot" /> no timer / no leaderboard pressure</span><span className="save-status" role="status"><span className="tiny-dot" /> {isOnline ? saveState : 'offline · saved locally'}</span><button type="button" onClick={resetPuzzle}>Reset this puzzle <span aria-hidden="true">↺</span></button><span>score: <strong>{String(progress.score).padStart(3, '0')}</strong></span></div>
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

      {isHelpOpen && <div className="modal-backdrop" role="presentation" onClick={closeHelp}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" aria-describedby="help-description" onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" aria-label="Close how to play" ref={helpCloseRef} onClick={closeHelp}>×</button><p className="eyebrow"><span className="eyebrow-line" /> the only rule</p><h2 id="help-title">The question is yours.</h2><p id="help-description">Every puzzle gives you evidence but withholds the prompt. Write the question you think is hiding there, then make the answer fit. You can ask for one clue if you need a nudge.</p><div className="help-steps"><span><b>01</b> notice</span><span><b>02</b> frame</span><span><b>03</b> solve</span></div><p className="help-shortcuts"><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> switch modes · <kbd>?</kbd> rules · <kbd>Esc</kbd> close</p><button className="button button-primary" type="button" onClick={() => { closeHelp(); document.getElementById('puzzle')?.scrollIntoView({ behavior: 'smooth' }) }}>Got it — let’s play <span aria-hidden="true">↗</span></button></section></div>}
    </div>
  )
}

export default App
