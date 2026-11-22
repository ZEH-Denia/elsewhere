import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CallCard, CallState, HomeSignal } from './components/CallCard'
import { SceneBackground, type SceneName } from './components/SceneBackground'
import { SceneWhispers } from './components/SceneWhispers'
import {
  advanceOpening,
  chooseOpening,
  createInitialOpeningProgress,
  firstChoice,
  getOpeningNode,
  normalizeOpeningProgress,
  openingDialogue,
  secondChoice,
} from './story/opening'
import { letterKey, loadCheckpoint, soundsAreEnabled, storeCheckpoint, storeSoundPreference, type Checkpoint, type CheckpointView } from './story/checkpoint'
import { createCallSound, type CallSound } from './story/callSound'
import {
  advanceCareerPage,
  canOpenFinale,
  chooseCareerFirst,
  chooseCareerSecond,
  createCareerProgress,
  finale,
  getCareer,
  getCareerChoice,
  getCareerEnding,
  getCareerLetter,
  getCareerPage,
  getFinaleLines,
  getPrologueText,
  identities,
  prologue,
} from './story/expansion'
import type { CareerId, PlayerIdentity, StoryLine } from './story/expansionTypes'
import type { CareerProgress } from './story/expansion'

type View = 'home' | CheckpointView

type ChoicePreview = { scene: SceneName | null; tone: 'cool' | 'warm' }

const desktopLayoutQuery = '(min-width: 900px)'
const expansionLinePhases = ['dialogue', 'identity', 'first-feedback', 'transition', 'second-feedback']

function getSceneName(view: View | 'letter', node: ReturnType<typeof getOpeningNode>, careerId: CareerId | null): SceneName {
  if (view === 'home' || view === 'intro' || view === 'incoming' || view === 'letter' || view === 'finale') return view
  if (view === 'career') return careerId ?? 'connection'
  if (view === 'identity' || view === 'hub') return 'hub'

  switch (node.id) {
    case 'opening-01':
      return 'connection'
    case 'opening-02':
      return 'doubt'
    case 'opening-03':
      return 'music'
    case 'opening-04':
      return 'reality'
    case 'opening-05':
      return 'rehearsal'
    case 'opening-06':
      return 'desk'
    case 'opening-07':
      return 'question'
    case 'first-response':
      return 'first-choice'
    case 'regret-feedback-01':
      return 'regret'
    case 'regret-feedback-02':
      return 'regret-quiet'
    case 'cherish-feedback-01':
      return 'cherish'
    case 'cherish-feedback-02':
      return 'cherish-morning'
    case 'opening-closing':
      return 'closing'
    case 'next-step':
      return 'second-choice'
    case 'make-space-feedback':
      return 'make-space'
    case 'reach-out-feedback':
      return 'reach-out'
    case 'call-farewell':
      return 'farewell'
    case 'regret-make-space':
      return 'ending-regret-space'
    case 'regret-reach-out':
      return 'ending-regret-reach'
    case 'cherish-make-space':
      return 'ending-cherish-space'
    case 'cherish-reach-out':
      return 'ending-cherish-reach'
    default:
      return 'opening'
  }
}

function getChoicePreviewScene(optionId: string): SceneName | null {
  switch (optionId) {
    case 'regret':
      return 'regret'
    case 'cherish-present':
      return 'cherish'
    case 'make-space':
      return 'make-space'
    case 'reach-out':
      return 'reach-out'
    default:
      return null
  }
}

const CAREER_SCENES: Record<CareerId, [SceneName, SceneName, SceneName, SceneName]> = {
  doctor: ['doctor', 'doctor-triage', 'doctor-break', 'doctor-night'],
  teacher: ['teacher', 'teacher-window', 'teacher-office', 'teacher-corridor'],
  designer: ['designer', 'designer-wall', 'designer-night', 'designer-sketch'],
  founder: ['founder', 'founder-meeting', 'founder-window', 'founder-server'],
}

function careerSceneFor(progress: CareerProgress): SceneName {
  const scenes = CAREER_SCENES[progress.careerId]
  if (progress.phase === 'dialogue') {
    const total = getCareer(progress.careerId).dialogue.length
    const segment = Math.min(3, Math.floor(progress.lineIndex / Math.ceil(total / 4)))
    return scenes[segment]
  }
  if (progress.phase === 'identity' || progress.phase === 'first-choice' || progress.phase === 'first-feedback') return scenes[1]
  if (progress.phase === 'transition' || progress.phase === 'second-choice') return scenes[2]
  return scenes[3]
}

function careerProgressLabel(progress: CareerProgress): string {
  switch (progress.phase) {
    case 'dialogue':
      return `对白 ${String(progress.lineIndex + 1).padStart(2, '0')}`
    case 'identity':
      return '身份回应'
    case 'first-choice':
    case 'first-feedback':
      return '第一次选择'
    case 'transition':
      return '共同衔接'
    case 'second-choice':
    case 'second-feedback':
      return '第二次选择'
    case 'ending':
      return '剧情结局'
    case 'letter':
      return '一周后的信'
    default:
      return '第二通来电'
  }
}

function expansionSpeakerOrigin(speaker: string | undefined): string {
  if (speaker === '另一个你') return '来自平行世界的自己'
  if (speaker === '旁白') return '通话之外'
  if (speaker === '你（内心）') return '此刻的你'
  return '此刻的你'
}

function Arrow({ returning = false }: { returning?: boolean }) {
  return (
    <svg className={returning ? 'rotate-180' : ''} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function choicePreviewFor(optionIndex: number, scene: SceneName | null = null): ChoicePreview {
  return { scene, tone: optionIndex === 0 ? 'cool' : 'warm' }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [desktopLayout, setDesktopLayout] = useState(() => window.matchMedia(desktopLayoutQuery).matches)
  const [progress, setProgress] = useState(createInitialOpeningProgress)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<'home' | 'hub' | 'restart'>('home')
  const [hoveredPreview, setHoveredPreview] = useState<ChoicePreview | null>(null)
  const [focusedPreview, setFocusedPreview] = useState<ChoicePreview | null>(null)
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null)
  const [letters, setLetters] = useState<CareerProgress[]>([])
  const [careerProgress, setCareerProgress] = useState<CareerProgress | null>(null)
  const [finaleStep, setFinaleStep] = useState(0)
  const [finaleSeen, setFinaleSeen] = useState(false)
  const [hubIntroSeen, setHubIntroSeen] = useState(false)
  const [dialogueLog, setDialogueLog] = useState<StoryLine[]>([])
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(loadCheckpoint)
  const [soundEnabled, setSoundEnabled] = useState(soundsAreEnabled)
  const audioContext = useRef<AudioContext | null>(null)
  const playingSound = useRef<AudioBufferSourceNode | null>(null)
  const [surfaceHintDismissed, setSurfaceHintDismissed] = useState(false)
  const previousView = useRef<View>('home')
  const selectionOnPointerDown = useRef(false)
  const startButton = useRef<HTMLButtonElement>(null)
  const introHeading = useRef<HTMLHeadingElement>(null)
  const incomingHeading = useRef<HTMLHeadingElement>(null)
  const callHeading = useRef<HTMLHeadingElement>(null)
  const choiceHeading = useRef<HTMLHeadingElement>(null)
  const openingContinueButton = useRef<HTMLButtonElement>(null)
  const endHeading = useRef<HTMLHeadingElement>(null)
  const careerHeading = useRef<HTMLHeadingElement>(null)
  const careerContinueButton = useRef<HTMLButtonElement>(null)
  const identityHeading = useRef<HTMLHeadingElement>(null)
  const hubHeading = useRef<HTMLHeadingElement>(null)
  const letterHeading = useRef<HTMLHeadingElement>(null)
  const finaleHeading = useRef<HTMLHeadingElement>(null)
  const confirmDialog = useRef<HTMLDialogElement>(null)
  const transcriptDialog = useRef<HTMLDialogElement>(null)
  const safeProgress = normalizeOpeningProgress(progress)
  const currentNode = getOpeningNode(safeProgress.nodeId)
  const firstEnding = currentNode.kind === 'end' ? currentNode.id : null
  const readCareers = [...new Set(letters.map((letter) => letter.careerId))]
  const previousOpeningKind = useRef(currentNode.kind)
  const choicePreview = hoveredPreview ?? focusedPreview
  const illustratedHome = view === 'home' && desktopLayout
  const sceneName = illustratedHome
    ? 'home-hero'
    : view === 'career' && careerProgress
      ? careerProgress.phase === 'letter' ? 'letter' : careerSceneFor(careerProgress)
      : getSceneName(view === 'finale' && finaleStep > finale.lines.length ? 'letter' : view, currentNode, careerProgress?.careerId ?? null)
  const activeCareer = careerProgress ? getCareer(careerProgress.careerId) : null
  const careerPage = careerProgress ? getCareerPage(careerProgress) : []
  const careerLine = careerPage[0]
  const careerChoice = careerProgress ? getCareerChoice(careerProgress) : null
  const careerEnding = careerProgress ? getCareerEnding(careerProgress) : null
  const careerLetter = careerProgress ? getCareerLetter(careerProgress) : null
  const careerPhase = careerProgress?.phase
  const canSkipCareer = careerProgress && readCareers.includes(careerProgress.careerId) &&
    (careerPhase === 'dialogue' || careerPhase === 'identity')
  const prologueText = getPrologueText(firstEnding, identity)
  const finaleLines = getFinaleLines(firstEnding, letters.at(-1))
  const finaleLine = finaleStep < finaleLines.length ? finaleLines[finaleStep] : null
  const finaleDone = finaleStep >= finaleLines.length
  const hubPrologueLines: StoryLine[] = [
    ...prologue.bridge.slice(0, 2),
    { speaker: '另一个你', text: prologueText.musicOpening },
    ...prologue.bridge.slice(2),
    ...prologue.handoff,
  ]
  const openingLine = currentNode.kind === 'dialogue' || currentNode.kind === 'feedback' || currentNode.kind === 'closing'
    ? currentNode
    : null
  const currentLines = view === 'call' && openingLine ? [openingLine]
    : view === 'career' ? careerPage
      : view === 'finale' && finaleLine ? [finaleLine] : []

  useEffect(() => {
    if (view === 'home') return
    const next: Checkpoint = {
      view, progress, identity, career: careerProgress, letters, finaleStep, finaleSeen, hubIntroSeen, dialogueLog,
    }
    storeCheckpoint(next)
    setCheckpoint(next)
  }, [view, progress, identity, careerProgress, letters, finaleStep, finaleSeen, hubIntroSeen, dialogueLog])

  useEffect(() => {
    setHoveredPreview(null)
    setFocusedPreview(null)
  }, [safeProgress.nodeId, view, careerPhase])

  useEffect(() => {
    const dialog = confirmDialog.current
    if (dialog) {
      if (confirmOpen && !dialog.open) dialog.showModal()
      if (!confirmOpen && dialog.open) dialog.close()
    }

    if (previousView.current === view) return
    previousView.current = view

    if (view === 'home') startButton.current?.focus()
    if (view === 'intro') introHeading.current?.focus()
    if (view === 'incoming') incomingHeading.current?.focus()
    if (view === 'call') callHeading.current?.focus()
    if (view === 'identity') identityHeading.current?.focus()
    if (view === 'hub') hubHeading.current?.focus()
    if (view === 'finale') callHeading.current?.focus()
  }, [confirmOpen, view])

  useEffect(() => {
    if (view !== 'career') return

    switch (careerPhase) {
      case 'dialogue':
        callHeading.current?.focus()
        break
      case 'first-choice':
      case 'second-choice':
      case 'ending':
        careerHeading.current?.focus()
        break
      case 'first-feedback':
      case 'second-feedback':
        careerContinueButton.current?.focus()
        break
      case 'letter':
        letterHeading.current?.focus()
        break
    }
  }, [view, careerPhase])

  useEffect(() => {
    if (view === 'finale' && finaleDone) finaleHeading.current?.focus()
  }, [view, finaleDone])

  useEffect(() => {
    const previousKind = previousOpeningKind.current
    previousOpeningKind.current = currentNode.kind
    if (view !== 'call') return
    if (currentNode.kind === 'choice') choiceHeading.current?.focus()
    if (currentNode.kind === 'feedback' && previousKind === 'choice') openingContinueButton.current?.focus()
    if (currentNode.kind === 'end') endHeading.current?.focus()
  }, [currentNode.kind, safeProgress.nodeId, view])

  function openEndConfirm() {
    setConfirmTarget(view === 'career' || view === 'finale' ? 'hub' : 'home')
    setConfirmOpen(true)
  }

  function confirmEnd(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    if (confirmTarget === 'restart') {
      beginStory()
      return
    }
    if (confirmTarget === 'home') {
      returnHome(event)
      return
    }
    setConfirmOpen(false)
    setCareerProgress(null)
    setFinaleStep(0)
    setDialogueLog([])
    setView('hub')
  }

  function returnHome(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    setConfirmOpen(false)
    setView('home')
  }

  function beginStory() {
    setConfirmOpen(false)
    storeCheckpoint(null)
    setCheckpoint(null)
    setProgress(createInitialOpeningProgress())
    setIdentity(null)
    setLetters([])
    setCareerProgress(null)
    setFinaleStep(0)
    setFinaleSeen(false)
    setHubIntroSeen(false)
    setDialogueLog([])
    setSurfaceHintDismissed(false)
    setView('intro')
  }

  function startStory(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    if (checkpoint) {
      setConfirmTarget('restart')
      setConfirmOpen(true)
      return
    }
    beginStory()
  }

  function resumeStory(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1 || !checkpoint) return
    setProgress(checkpoint.progress)
    setIdentity(checkpoint.identity)
    setLetters(checkpoint.letters)
    setCareerProgress(checkpoint.career)
    setFinaleStep(checkpoint.finaleStep)
    setFinaleSeen(checkpoint.finaleSeen)
    setHubIntroSeen(checkpoint.hubIntroSeen)
    setDialogueLog(checkpoint.dialogueLog)
    setView(checkpoint.view)
  }

  function showIncoming(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    setProgress(createInitialOpeningProgress())
    setDialogueLog([])
    setView('incoming')
  }

  function answerCall(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    playSound('connect')
    setProgress(createInitialOpeningProgress())
    setView('call')
  }

  function advanceStory(event?: MouseEvent<HTMLButtonElement>) {
    if (event && event.detail > 1) return
    if (!surfaceHintDismissed) setSurfaceHintDismissed(true)
    rememberDialogue(currentLines)
    setProgress(advanceOpening)
  }

  function startExpansion(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    setCareerProgress(null)
    setView('identity')
  }

  function chooseIdentity(option: PlayerIdentity) {
    setIdentity(option)
    setView('hub')
  }

  function startCareer(careerId: CareerId) {
    playSound('connect')
    setHubIntroSeen(true)
    setDialogueLog([])
    setCareerProgress(createCareerProgress(careerId, identity ?? 'steady'))
    setView('career')
  }

  function openSavedLetter(letter: CareerProgress) {
    setHubIntroSeen(true)
    setDialogueLog([])
    setCareerProgress(letter)
    setView('career')
  }

  function advanceCareerStory(event?: MouseEvent<HTMLButtonElement>) {
    if (event && event.detail > 1) return
    rememberDialogue(currentLines)
    setCareerProgress((current) => current ? advanceCareerPage(current) : current)
  }

  function chooseCareer(event: MouseEvent<HTMLButtonElement>, optionId: string) {
    if (event.detail > 1) return
    const option = careerChoice?.options.find(({ id }) => id === optionId)
    if (option) rememberDialogue([{ speaker: '你', text: option.label }])
    setCareerProgress((current) => {
      if (!current) return current
      if (current.phase === 'first-choice') return chooseCareerFirst(current, optionId)
      if (current.phase === 'second-choice') return chooseCareerSecond(current, optionId)
      return current
    })
  }

  function skipCareer(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1 || !canSkipCareer || !careerProgress) return
    rememberDialogue(currentLines)
    setCareerProgress({ ...careerProgress, phase: 'first-choice', lineIndex: 0 })
  }

  function rememberDialogue(lines: StoryLine[]) {
    if (lines.length === 0) return
    setDialogueLog((current) => [...current, ...lines.map(({ speaker, text }) => ({ speaker, text }))])
  }

  function openTranscript() {
    const dialog = transcriptDialog.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    const list = dialog.querySelector('.transcript-list')
    if (list) list.scrollTop = list.scrollHeight
  }

  function focusChoicePreview(optionIndex: number, scene: SceneName | null = null) {
    setHoveredPreview(null)
    setFocusedPreview(choicePreviewFor(optionIndex, scene))
  }

  function rememberLetter() {
    if (careerProgress?.phase === 'letter') {
      setLetters((current) => current.some((letter) => letterKey(letter) === letterKey(careerProgress))
        ? current
        : [...current, careerProgress])
    }
  }

  function finishCareer(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    rememberLetter()
    setCareerProgress(null)
    setDialogueLog([])
    setView('hub')
  }

  function restartCareer(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1 || !careerProgress) return
    rememberLetter()
    startCareer(careerProgress.careerId)
  }

  function startFinale(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    playSound('connect')
    setHubIntroSeen(true)
    setDialogueLog([])
    setFinaleStep(0)
    setView('finale')
  }

  function advanceFinale(event?: MouseEvent<HTMLButtonElement>) {
    if (event && event.detail > 1) return
    if (finaleDone) return
    rememberDialogue(currentLines)
    if (finaleLines[finaleStep + 1]?.id === 'guitar-cue') playSound('guitar')
    if (finaleStep + 1 >= finaleLines.length) setFinaleSeen(true)
    setFinaleStep((current) => Math.min(current + 1, finaleLines.length))
  }

  function returnToHub(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 1) return
    setFinaleStep(0)
    setDialogueLog([])
    setView('hub')
  }

  function playSound(sound: CallSound) {
    if (!soundEnabled || typeof AudioContext === 'undefined') return
    try {
      const context = audioContext.current ??= new AudioContext()
      void context.resume().catch(() => {})
      playingSound.current?.stop()
      const source = createCallSound(context, sound)
      source.onended = () => {
        if (playingSound.current === source) playingSound.current = null
        source.disconnect()
      }
      source.start()
      playingSound.current = source
    } catch {
      // Sound is optional in browsers that cannot open an audio output.
    }
  }

  function toggleSound() {
    const enabled = !soundEnabled
    if (!enabled) playingSound.current?.stop()
    setSoundEnabled(enabled)
    storeSoundPreference(enabled)
  }

  function surfaceAdvanceAction(target: EventTarget) {
    if (confirmOpen || transcriptDialog.current?.open) return
    if (target instanceof Element && target.closest('button, a, input, select, textarea, summary, details, dialog, [role="dialog"]')) return

    if (view === 'call') {
      if (currentNode.kind === 'dialogue' || currentNode.kind === 'feedback' || currentNode.kind === 'closing') return advanceStory
    }

    if (view === 'career' && careerProgress) {
      if (expansionLinePhases.includes(careerProgress.phase)) return advanceCareerStory
    }

    if (view === 'finale' && !finaleDone) return advanceFinale
  }

  function preventRepeatedTextSelection(event: MouseEvent<HTMLDivElement>) {
    if (event.button === 0 && event.detail > 1 && surfaceAdvanceAction(event.target)) event.preventDefault()
  }

  function advanceOnSurfaceClick(event: MouseEvent<HTMLDivElement>) {
    const advance = surfaceAdvanceAction(event.target)
    if (!advance || event.detail > 1) return
    if (selectionOnPointerDown.current || window.getSelection()?.toString()) {
      selectionOnPointerDown.current = false
      return
    }
    advance()
  }

  const openingLive = view === 'call' && (currentNode.kind === 'dialogue' || currentNode.kind === 'feedback' || currentNode.kind === 'closing')
    ? `${currentNode.speaker}：${currentNode.text}`
    : ''
  const careerLive = view === 'career' && careerProgress
    ? careerPage.length
      ? careerPage.map(({ speaker, text }) => `${speaker}：${text}`).join(' ')
      : careerChoice
        ? careerChoice.prompt
        : careerEnding
          ? `${careerEnding.title}。${careerEnding.summary}`
          : ''
    : ''
  const finaleLive = view === 'finale' && finaleLine ? `${finaleLine.speaker}：${finaleLine.text}` : ''
  const liveText = openingLive || careerLive || finaleLive
  const expansionCallActive = Boolean(
    (view === 'career' && careerProgress && careerProgress.phase !== 'letter') ||
    (view === 'finale' && !finaleDone),
  )
  const callActive = (view === 'call' && currentNode.kind !== 'end') || expansionCallActive
  const callTitle = view === 'call' ? '第一通来电' : '第二通来电'
  const speakerOrigin = currentNode.kind === 'choice'
    ? '来自平行世界的自己'
    : currentNode.kind === 'end'
      ? ''
      : currentNode.speaker === '另一个你'
        ? '来自平行世界的自己'
        : currentNode.speaker === '旁白'
          ? '通话之外'
          : '此刻的你'
  const dialogueStep = currentNode.kind === 'dialogue'
    ? openingDialogue.findIndex(({ id }) => id === currentNode.id) + 1
    : 0
  const panelProgress = currentNode.kind === 'dialogue'
    ? `主线 ${String(dialogueStep).padStart(2, '0')} / 07`
    : currentNode.kind === 'choice'
      ? `选择 ${currentNode.id === 'first-response' ? '01' : '02'} / 02`
      : currentNode.kind === 'closing'
        ? currentNode.id === 'opening-closing' ? '共同衔接' : '通话尾声'
        : currentNode.kind === 'feedback'
          ? safeProgress.nextStepId ? '行动反馈' : `回应反馈 ${currentNode.id.endsWith('01') ? '01' : '02'} / 02`
          : ''
  const selectedOption = firstChoice.options.find(({ id }) => id === safeProgress.choiceId)
  const selectedNextStep = secondChoice.options.find(({ id }) => id === safeProgress.nextStepId)
  const screenKey = view === 'career'
    ? careerProgress
      ? `career-${careerProgress.careerId}-${careerProgress.phase === 'letter' ? 'letter' : 'call'}`
      : 'career'
    : view === 'finale'
      ? finaleDone ? 'finale-letter' : 'finale'
      : view !== 'call'
        ? view
        : currentNode.kind === 'end'
          ? 'call-end'
          : currentNode.kind === 'choice'
            ? `call-${currentNode.id}`
            : 'call-dialogue'

  useEffect(() => {
    const media = window.matchMedia(desktopLayoutQuery)
    const update = () => setDesktopLayout(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [])

  const answerAction = (
    <button type="button" className="primary-action group" onClick={answerCall}>
      <span>接听</span><span className="action-icon"><Arrow /></span>
    </button>
  )

  return (
    <div
      className={`app-background min-h-svh text-mist${illustratedHome ? ' is-home-hero' : ''}`}
      data-view={view}
      onClick={advanceOnSurfaceClick}
      onMouseDownCapture={preventRepeatedTextSelection}
      onPointerDownCapture={() => {
        selectionOnPointerDown.current = Boolean(window.getSelection()?.toString())
      }}
    >
      <SceneBackground scene={sceneName} preview={choicePreview?.scene} previewTone={choicePreview?.tone} />
      <p className="sr-only" aria-live="polite" aria-atomic="true">{liveText}</p>
      <div className="ambient ambient-violet" aria-hidden="true" />
      <div className="ambient ambient-cyan" aria-hidden="true" />

      <div className="app-shell relative z-10 mx-auto flex min-h-svh w-full max-w-360 flex-col px-5 sm:px-8 lg:px-12">
        <header className="app-header">
          <div className="flex items-center gap-3" aria-label="Elsewhere">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="header-brand font-mono text-xs font-medium tracking-[0.24em]">ELSEWHERE</span>
          </div>
          <div className="header-call">
            {callActive ? (
              <h1 ref={callHeading} tabIndex={-1} id="call-title" className="header-call-title">{callTitle}</h1>
            ) : !illustratedHome && (
              <p className="header-meta font-mono text-[10px] tracking-[0.16em] sm:text-xs">平行人生 <span className="header-sep mx-2">/</span> 001</p>
            )}
            <button type="button" className="end-call-action sound-toggle" aria-label="音效" aria-pressed={soundEnabled} onClick={toggleSound}>
              音效<span aria-hidden="true"> · {soundEnabled ? '开' : '关'}</span>
            </button>
            {callActive && (
              <>
                <button type="button" className="end-call-action" onClick={openTranscript}>对白记录</button>
                <button type="button" className="end-call-action header-end-call" onClick={openEndConfirm}>结束通话</button>
              </>
            )}
          </div>
        </header>

        <main className={`app-main${callActive ? ' is-call' : view !== 'call' ? ' is-prelude' : ''}`}>
          <div key={screenKey} className="screen-transition" data-screen={screenKey}>
            {view === 'home' && (
              <section className={`screen-enter prelude${illustratedHome ? ' home-hero' : ''}`} aria-labelledby="home-title">
                <div className="prelude-stage">
                  {illustratedHome ? <HomeSignal /> : <CallCard className="home-call" object compact />}
                </div>
                <div className="prelude-dock">
                  <article className="prelude-panel">
                    <div className="prelude-copy">
                      <h1 id="home-title" className="home-title">
                        {!illustratedHome && <span className="home-title-brand">Elsewhere</span>}
                        <span className="home-title-cn">未接来电</span>
                      </h1>
                      <p className="home-intro">如果当年，你选择了另一条路。</p>
                      {!illustratedHome && <p className="quiet-note prelude-note"><span className="status-dot" aria-hidden="true" />一段虚构的平行人生，无需注册</p>}
                    </div>
                    <div className="prelude-actions">
                      <button ref={startButton} type="button" className="primary-action group" onClick={checkpoint ? resumeStory : startStory}>
                        <span>{checkpoint ? '继续上次体验' : '开始体验'}</span><span className="action-icon"><Arrow /></span>
                      </button>
                      {checkpoint && <button type="button" className="panel-return-action home-restart" onClick={startStory}>重新开始</button>}
                    </div>
                  </article>
                </div>
              </section>
            )}

            {view === 'intro' && (
              <section className="screen-enter prelude" aria-labelledby="intro-title">
                <div className="prelude-dock">
                  <article className="prelude-panel">
                    <div className="prelude-copy">
                      <p className="eyebrow"><span />来电前言</p>
                      <h1 ref={introHeading} tabIndex={-1} id="intro-title" className="intro-heading">
                        如果当年选择了音乐，<br className="hidden sm:block" />你现在会在哪里？
                      </h1>
                      <div className="intro-copy">
                        <p>想象一下电话另一端的声音：那么熟悉，却来自你不曾抵达的人生。</p>
                        <p>这是一段虚构的平行人生，不代表对未来的预测。</p>
                      </div>
                    </div>
                    <div className="prelude-actions">
                      <button type="button" className="panel-return-action group" onClick={returnHome}>
                        <span className="action-icon"><Arrow returning /></span><span>返回首页</span>
                      </button>
                      <button type="button" className="primary-action group" onClick={showIncoming}>
                        <span>进入来电</span><span className="action-icon"><Arrow /></span>
                      </button>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {view === 'incoming' && (
              <section className={`screen-enter prelude prelude-incoming${desktopLayout ? ' is-centered' : ''}`} aria-labelledby="incoming-title">
                <div className="prelude-stage">
                  <CallCard
                    className="incoming-call"
                    object
                    compact={desktopLayout}
                    status="ringing"
                    title={desktopLayout ? (
                      <h1 ref={incomingHeading} tabIndex={-1} id="incoming-title" className="caller-name">
                        另一个你<span className="sr-only">，正在来电</span>
                      </h1>
                    ) : undefined}
                    action={desktopLayout ? answerAction : undefined}
                  />
                </div>
                <div className="prelude-dock">
                  <article className="prelude-panel">
                    <div className="prelude-copy">
                      {!desktopLayout && (
                        <>
                          <p className="eyebrow"><span />一通来自平行世界的来电</p>
                          <h1 ref={incomingHeading} tabIndex={-1} id="incoming-title">另一个你，<br />正在来电</h1>
                        </>
                      )}
                      <p className="incoming-note">这不是一次真实的通话。你可以随时结束，也可以听听另一条路上的自己。</p>
                      <p className="quiet-note prelude-note">剧情模拟，不会请求麦克风或通知权限。</p>
                    </div>
                    <div className="prelude-actions">
                      <button type="button" className="panel-return-action group" onClick={returnHome}>
                        <span className="action-icon"><Arrow returning /></span><span>返回首页</span>
                      </button>
                      {!desktopLayout && answerAction}
                    </div>
                  </article>
                </div>
              </section>
            )}

            {view === 'call' && currentNode.kind !== 'end' && (
              <section className="screen-enter call-session" aria-labelledby="call-title">
                <div className="call-dock">
                  <article className={`dialogue-panel${currentNode.kind === 'choice' ? ' is-prompt' : ''}`}>
                    <div className="dialogue-speaker-tab">
                      <span className="dialogue-speaker-state call-live-state"><CallState status="connected" showLabel={false} /></span>
                      <span className="speaker-name">{currentNode.kind === 'choice' ? '另一个你' : currentNode.speaker}</span>
                      {speakerOrigin && <span className="speaker-origin">{speakerOrigin}</span>}
                    </div>
                    {currentNode.kind === 'choice' ? (
                      <div className="choice-prompt">
                        <p className="choice-kicker"><span />{currentNode.id === 'first-response' ? '第一次选择' : '第二次选择'}</p>
                        <h2 ref={choiceHeading} tabIndex={-1} id="choice-title">
                          {currentNode.id === 'first-response' ? '你想怎么回答？' : '如果明天就能为自己做一件小事，你想从哪里开始？'}
                        </h2>
                      </div>
                    ) : (
                      <p key={currentNode.id} className="dialogue-text dialogue-line">{currentNode.text}</p>
                    )}
                    {currentNode.kind === 'choice' && (
                      <div className="choice-options" role="group" aria-labelledby="choice-title">
                        {currentNode.options.map((option, index) => (
                          <button
                            key={option.id}
                            type="button"
                            className="choice-option"
                            onMouseEnter={() => setHoveredPreview(choicePreviewFor(index, getChoicePreviewScene(option.id)))}
                            onMouseLeave={() => setHoveredPreview(null)}
                            onFocus={() => focusChoicePreview(index, getChoicePreviewScene(option.id))}
                            onBlur={() => setFocusedPreview(null)}
                            onClick={(event) => {
                              if (event.detail > 1) return
                              rememberDialogue([{ speaker: '你', text: option.label }])
                              setProgress((current) => chooseOpening(current, option.id))
                            }}
                          >
                            <span className="choice-index">{String(index + 1).padStart(2, '0')}</span>
                            <span className="choice-label">{option.label}</span>
                            <span className="choice-arrow"><Arrow /></span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="dialogue-panel-footer">
                      <p className="dialogue-progress">{panelProgress}</p>
                      {!surfaceHintDismissed && dialogueStep === 1 && (
                        <p className="dialogue-next-hint">也可以点击画面继续</p>
                      )}
                      {currentNode.kind === 'choice' ? (
                        <p className="choice-hint">移入选项可预览另一条路 · 选择会改变走向</p>
                      ) : (
                        <button ref={openingContinueButton} type="button" className="dialogue-continue" onClick={advanceStory}>
                          <span>继续</span><span className="action-icon"><Arrow /></span>
                        </button>
                      )}
                    </div>
                  </article>
                </div>
              </section>
            )}

            {view === 'call' && currentNode.kind === 'end' && (
              <section className="screen-enter end-layout" aria-labelledby="end-title" data-ending-id={currentNode.id}>
                <p className="eyebrow"><span />剧情结局</p>
                <h1 ref={endHeading} tabIndex={-1} id="end-title">{currentNode.title}</h1>
                <div className="call-live-state end-call-state"><CallState status="ended" /></div>
                <div className="end-reflection">
                  {selectedOption && <p className="end-choice">你的回应：{selectedOption.label}</p>}
                  {selectedNextStep && <p className="end-choice">下一步：{selectedNextStep.label}</p>}
                  <p>{currentNode.summary}</p>
                </div>
                <div className="action-row">
                  <button type="button" className="primary-action group" onClick={startExpansion}>
                    <span>接听更多来电</span><span className="action-icon"><Arrow /></span>
                  </button>
                  <button type="button" className="secondary-action group" onClick={showIncoming}>
                    <span>重听这通来电</span><span className="action-icon"><Arrow returning /></span>
                  </button>
                  <button type="button" className="secondary-action group home-return-action" onClick={returnHome}>
                    <span>返回首页</span><span className="action-icon"><Arrow returning /></span>
                  </button>
                </div>
              </section>
            )}

            {view === 'identity' && (
              <section className="screen-enter prelude identity-screen" aria-labelledby="identity-title">
                <div className="prelude-dock">
                  <article className="prelude-panel identity-panel">
                    <div className="prelude-copy">
                      <p className="eyebrow"><span />第一章之后</p>
                      <h1 ref={identityHeading} tabIndex={-1} id="identity-title" className="section-heading">
                        现在的你，更接近哪一种？
                      </h1>
                      <p className="section-note">这个选择只改变你回应另一个自己的方式，不改变第一章的选择和结局。</p>
                    </div>
                    <div className="identity-options">
                      {identities.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="identity-option"
                          onClick={() => chooseIdentity(option.id)}
                        >
                          <span className="identity-copy">
                            <strong>{option.label}</strong>
                            <span>{option.description}</span>
                          </span>
                          <span className="choice-arrow"><Arrow /></span>
                        </button>
                      ))}
                    </div>
                    <div className="screen-back-row">
                      <button type="button" className="panel-return-action group" onClick={returnHome}>
                        <span className="action-icon"><Arrow returning /></span><span>返回首页</span>
                      </button>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {view === 'hub' && (
              <section className="screen-enter prelude hub-screen" aria-labelledby="hub-title">
                <div className="prelude-dock">
                  <article className="prelude-panel hub-panel">
                    <div className="prelude-copy">
                      <p className="eyebrow"><span />第二通来电 · 线路总机</p>
                      <h1 ref={hubHeading} tabIndex={-1} id="hub-title" className="section-heading">
                        另一个世界，未知线路
                      </h1>
                      {canOpenFinale({ identity, firstEnding, readCareers, finaleSeen }) ? (
                        <div className="hub-finale">
                          <p>「还有一通，来自你自己。」</p>
                          <button type="button" className="primary-action group" onClick={startFinale}>
                            <span>{finaleSeen ? '重听最后回电' : '接听最后一通'}</span><span className="action-icon"><Arrow /></span>
                          </button>
                        </div>
                      ) : <p className="section-note hub-unlock">读完任意一封来信，就能接听最后一通。</p>}
                      <details className="hub-prologue" open={!hubIntroSeen} onToggle={(event) => {
                        if (!event.currentTarget.open) setHubIntroSeen(true)
                      }}>
                        <summary>总机开场对白</summary>
                        <p className="hub-later">{prologueText.laterYou}</p>
                        <div className="hub-script">
                          {hubPrologueLines.map((line, index) => (
                            <p key={`${line.speaker}-${index}`} className="hub-line">
                              <span className="hub-speaker">{line.speaker}</span>
                              <span>{line.text}</span>
                            </p>
                          ))}
                        </div>
                      </details>
                    </div>

                    <p className="hub-progress">已读来信 · {readCareers.length} / {prologue.cards.length} 条线路</p>
                    <div className="hub-cards" aria-label="可接听的线路">
                      {prologue.cards.map((card) => {
                        const routeLetters = letters.filter((letter) => letter.careerId === card.id)
                        const read = routeLetters.length > 0
                        return (
                          <div key={card.id} className="hub-route">
                            <button type="button" className={`hub-card${read ? ' is-read' : ''}`} onClick={() => startCareer(card.id)}>
                              <span className="hub-card-time">{card.time}</span>
                              <strong className="hub-card-title">{card.label}</strong>
                              <span className="hub-card-hook">{card.hook}</span>
                              <span className="hub-card-status">{read ? '已接听 · 重听' : '接听'}</span>
                            </button>
                            {routeLetters.length === 1 && (
                              <button className="hub-letter-link" type="button" aria-label={`重读${card.label}的回信`} onClick={() => openSavedLetter(routeLetters[0])}>重读回信</button>
                            )}
                            {routeLetters.length > 1 && (
                              <details className="hub-route-letters">
                                <summary aria-label={`重读${card.label}的回信`}>重读回信 · {routeLetters.length} 封</summary>
                                {routeLetters.map((letter) => (
                                  <button key={letterKey(letter)} type="button" onClick={() => openSavedLetter(letter)}>{getCareerEnding(letter)?.title}</button>
                                ))}
                              </details>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="screen-back-row">
                      <button type="button" className="panel-return-action group" onClick={returnHome}>
                        <span className="action-icon"><Arrow returning /></span><span>返回首页</span>
                      </button>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {view === 'career' && careerProgress && activeCareer && (
              careerProgress.phase === 'letter' ? (
                <section className="screen-enter prelude letter-screen" aria-labelledby="letter-title">
                  <div className="prelude-dock">
                    <article className="prelude-panel letter-panel">
                      <div className="prelude-copy">
                        <p className="eyebrow"><span />一周后的信 · {activeCareer.title}</p>
                        <h1 ref={letterHeading} tabIndex={-1} id="letter-title" className="section-heading">
                          另一条线路的回信
                        </h1>
                        {careerLetter && (
                          <div className="letter-paper">
                            <p className="letter-opening">{careerLetter.opening}</p>
                            <p className="letter-body">{careerLetter.body}</p>
                            <p className="letter-sign">——另一个你</p>
                          </div>
                        )}
                      </div>
                      <div className="action-row letter-actions">
                        <button type="button" className="primary-action group" onClick={finishCareer}>
                          <span>读完，回总机</span><span className="action-icon"><Arrow returning /></span>
                        </button>
                        <button type="button" className="secondary-action group" onClick={restartCareer}>
                          <span>重听这条线</span><span className="action-icon"><Arrow returning /></span>
                        </button>
                      </div>
                    </article>
                  </div>
                </section>
              ) : (
                <section className="screen-enter call-session" aria-labelledby={careerChoice || careerEnding ? 'career-title' : 'call-title'}>
                  <div className="call-dock">
                    <article className={`dialogue-panel${careerChoice ? ' is-prompt' : ''}`}>
                      <div className="dialogue-speaker-tab">
                        <span className="dialogue-speaker-state call-live-state"><CallState status="connected" showLabel={false} /></span>
                        <span className="speaker-name">
                          {careerChoice ? '另一个你' : careerEnding ? '第二通来电' : careerPage.length > 1 ? '通话中' : careerLine?.speaker ?? '另一个你'}
                        </span>
                        {careerPage.length <= 1 && (
                          <span className="speaker-origin">
                            {careerChoice || careerEnding ? '来自平行世界的自己' : expansionSpeakerOrigin(careerLine?.speaker)}
                          </span>
                        )}
                      </div>

                      {careerEnding ? (
                        <div className="career-ending">
                          <p className="choice-kicker"><span />剧情结局</p>
                          <h2 ref={careerHeading} tabIndex={-1} id="career-title">{careerEnding.title}</h2>
                          <p className="dialogue-text">{careerEnding.summary}</p>
                          <p className="career-last-line">{careerEnding.lastLine}</p>
                          <button type="button" className="dialogue-continue" onClick={advanceCareerStory}>
                            <span>读这封信</span><span className="action-icon"><Arrow /></span>
                          </button>
                        </div>
                      ) : careerChoice ? (
                        <div className="choice-prompt">
                          <p className="choice-kicker"><span />{careerProgress.phase === 'first-choice' ? '第一次选择' : '第二次选择'}</p>
                          <h2 ref={careerHeading} tabIndex={-1} id="career-title">{careerChoice.prompt}</h2>
                        </div>
                      ) : careerPage.length > 1 ? (
                        <div key={careerProgress.lineIndex} className="career-dialogue-page dialogue-line">
                          {careerPage.map((line) => (
                            <p key={line.id} className="career-dialogue-row">
                              <span className="career-dialogue-speaker">{line.speaker}</span>
                              <span>{line.text}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p
                          key={`${careerProgress.phase}-${careerProgress.lineIndex}-${careerProgress.feedbackIndex}`}
                          className="dialogue-text dialogue-line"
                        >
                          {careerLine?.text}
                        </p>
                      )}

                      {careerChoice && (
                        <div className="choice-options" role="group" aria-labelledby="career-title">
                          {careerChoice.options.map((option, index) => (
                            <button
                              key={option.id}
                              type="button"
                              className="choice-option"
                              onMouseEnter={() => setHoveredPreview(choicePreviewFor(index))}
                              onMouseLeave={() => setHoveredPreview(null)}
                              onFocus={() => focusChoicePreview(index)}
                              onBlur={() => setFocusedPreview(null)}
                              onClick={(event) => chooseCareer(event, option.id)}
                            >
                              <span className="choice-index">{String(index + 1).padStart(2, '0')}</span>
                              <span className="choice-label">{option.label}</span>
                              <span className="choice-arrow"><Arrow /></span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="dialogue-panel-footer">
                        <p className="dialogue-progress">{activeCareer.title} · {careerProgressLabel(careerProgress)}</p>
                        {canSkipCareer && <button type="button" className="dialogue-skip" onClick={skipCareer}>跳到第一次选择</button>}
                        {careerChoice ? (
                          <p className="choice-hint">选择会改变这条线路的走向</p>
                        ) : careerEnding ? null : (
                          <button ref={careerContinueButton} type="button" className="dialogue-continue" onClick={advanceCareerStory}>
                            <span>继续</span><span className="action-icon"><Arrow /></span>
                          </button>
                        )}
                      </div>
                    </article>
                  </div>
                </section>
              )
            )}

            {view === 'finale' && (
              finaleDone ? (
                <section className="screen-enter prelude letter-screen" aria-labelledby="finale-title">
                  <div className="prelude-dock">
                    <article className="prelude-panel letter-panel finale-letter-panel">
                      <div className="prelude-copy">
                        <p className="eyebrow"><span />最后一封信 · 最初的线路</p>
                        <h1 ref={finaleHeading} tabIndex={-1} id="finale-title" className="section-heading">
                          下次换你打给我
                        </h1>
                        <div className="letter-paper">
                          <p className="letter-body">{finale.letter}</p>
                          <p className="letter-sign">——另一个你</p>
                        </div>
                      </div>
                      <div className="action-row letter-actions">
                        <button type="button" className="primary-action group" onClick={returnToHub}>
                          <span>返回总机</span><span className="action-icon"><Arrow returning /></span>
                        </button>
                        <button type="button" className="secondary-action group" onClick={returnHome}>
                          <span>返回首页</span><span className="action-icon"><Arrow returning /></span>
                        </button>
                      </div>
                    </article>
                  </div>
                </section>
              ) : (
                <section className="screen-enter call-session" aria-labelledby="finale-call-title">
                  <div className="call-dock">
                    <article className="dialogue-panel">
                      <div className="dialogue-speaker-tab">
                        <span className="dialogue-speaker-state call-live-state"><CallState status="connected" showLabel={false} /></span>
                        <span className="speaker-name">{finaleLine?.speaker ?? '另一个你'}</span>
                        <span className="speaker-origin">来自平行世界的自己</span>
                      </div>
                      <h2 id="finale-call-title" className="sr-only">最后的回电</h2>
                      <p key={`finale-${finaleStep}`} className="dialogue-text dialogue-line">
                        {finaleLine?.text}
                      </p>
                      <div className="dialogue-panel-footer">
                        <p className="dialogue-progress">最初的线路 · 最后一通回电</p>
                        <button type="button" className="dialogue-continue" onClick={advanceFinale}>
                          <span>继续</span><span className="action-icon"><Arrow /></span>
                        </button>
                      </div>
                    </article>
                  </div>
                </section>
              )
            )}

          </div>
        </main>

        {view === 'call' && currentNode.kind === 'end' && (
          <footer className="app-footer">
            <span>AN INTERACTIVE STORY</span>
            <span>此刻 · 另一种可能</span>
          </footer>
        )}
      </div>

      {choicePreview === null && ['home', 'intro', 'incoming', 'call'].includes(view) && (
        <SceneWhispers scene={sceneName} layoutKey={screenKey} />
      )}

      <dialog ref={transcriptDialog} className="confirm-dialog transcript-dialog" aria-labelledby="transcript-title">
        <h2 id="transcript-title">对白记录</h2>
        <ol className="transcript-list">
          {[...dialogueLog, ...currentLines].map(({ speaker, text }, index) => (
            <li key={index}><strong>{speaker}</strong><span>{text}</span></li>
          ))}
        </ol>
        <form method="dialog" className="action-row">
          <button type="submit" className="secondary-action">返回通话</button>
        </form>
      </dialog>

      <dialog
        ref={confirmDialog}
        className="confirm-dialog"
        aria-labelledby="confirm-title"
        onCancel={(event) => {
          event.preventDefault()
          setConfirmOpen(false)
        }}
        onClose={() => setConfirmOpen(false)}
      >
        <h2 id="confirm-title">{confirmTarget === 'restart' ? '重新开始体验？' : confirmTarget === 'hub' ? '结束本次通话并返回总机？' : '结束本次通话并返回首页？'}</h2>
        <p>
          {confirmTarget === 'restart'
            ? '当前进度和来信会被清空。'
            : confirmTarget === 'home'
              ? '你可以稍后从首页继续这通来电。'
              : view === 'finale' ? '本次回电将结束，已读信件保留。' : '当前职业线进度将清空，已读信件保留。'}
        </p>
        <div className="action-row">
          <button type="button" className="secondary-action" onClick={() => setConfirmOpen(false)}>取消</button>
          <button type="button" className="danger-action" onClick={confirmEnd}>{confirmTarget === 'restart' ? '确认重新开始' : confirmTarget === 'hub' ? '确认返回总机' : '确认结束'}</button>
        </div>
      </dialog>
    </div>
  )
}

export default App
