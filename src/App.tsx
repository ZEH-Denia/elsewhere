import { useEffect, useRef, useState } from 'react'
import { CallCard } from './components/CallCard'
import { SceneBackground, type SceneName } from './components/SceneBackground'
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

type View = 'home' | 'intro' | 'incoming' | 'call'

function getSceneName(view: View, node: ReturnType<typeof getOpeningNode>): SceneName {
  if (view === 'home' || view === 'intro') return 'home'
  if (view === 'incoming') return 'incoming'

  switch (node.id) {
    case 'opening-03':
    case 'opening-05':
      return 'music'
    case 'opening-04':
    case 'opening-06':
      return 'reality'
    case 'first-response':
      return 'first-choice'
    case 'regret-feedback-01':
    case 'regret-feedback-02':
      return 'regret'
    case 'cherish-feedback-01':
    case 'cherish-feedback-02':
      return 'cherish'
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

function Arrow({ returning = false }: { returning?: boolean }) {
  return (
    <svg className={returning ? 'rotate-180' : ''} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function App() {
  const [view, setView] = useState<View>('home')
  const [progress, setProgress] = useState(createInitialOpeningProgress)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [previewScene, setPreviewScene] = useState<SceneName | null>(null)
  const previousView = useRef<View>('home')
  const startButton = useRef<HTMLButtonElement>(null)
  const introHeading = useRef<HTMLHeadingElement>(null)
  const incomingHeading = useRef<HTMLHeadingElement>(null)
  const callHeading = useRef<HTMLHeadingElement>(null)
  const choiceHeading = useRef<HTMLHeadingElement>(null)
  const endHeading = useRef<HTMLHeadingElement>(null)
  const confirmDialog = useRef<HTMLDialogElement>(null)
  const safeProgress = normalizeOpeningProgress(progress)
  const currentNode = getOpeningNode(safeProgress.nodeId)
  const sceneName = previewScene ?? getSceneName(view, currentNode)

  useEffect(() => {
    setPreviewScene(null)
  }, [safeProgress.nodeId])

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
  }, [confirmOpen, view])

  useEffect(() => {
    if (currentNode.kind === 'choice') choiceHeading.current?.focus()
    if (currentNode.kind === 'end') endHeading.current?.focus()
  }, [currentNode.kind, safeProgress.nodeId])

  function returnHome() {
    setConfirmOpen(false)
    setProgress(createInitialOpeningProgress())
    setView('home')
  }

  function showIncoming() {
    setProgress(createInitialOpeningProgress())
    setView('incoming')
  }

  function answerCall() {
    setProgress(createInitialOpeningProgress())
    setView('call')
  }

  const liveText = currentNode.kind === 'dialogue' || currentNode.kind === 'feedback' || currentNode.kind === 'closing'
    ? `${currentNode.speaker}：${currentNode.text}`
    : ''
  const selectedOption = firstChoice.options.find(({ id }) => id === safeProgress.choiceId)
  const selectedNextStep = secondChoice.options.find(({ id }) => id === safeProgress.nextStepId)

  return (
    <div className="app-background min-h-svh text-mist">
      <SceneBackground scene={sceneName} preview={previewScene !== null} />
      <div className="ambient ambient-violet" aria-hidden="true" />
      <div className="ambient ambient-cyan" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-360 flex-col px-5 sm:px-8 lg:px-12">
        <header className="app-header">
          <div className="flex items-center gap-3" aria-label="Elsewhere">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="font-mono text-xs font-medium tracking-[0.24em] text-mist">ELSEWHERE</span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-dim sm:text-xs">平行人生 <span className="mx-2 text-line-strong">/</span> 001</p>
        </header>

        <main className="app-main">
          {view === 'home' && (
            <section className="screen-enter home-layout" aria-labelledby="home-title">
              <div className="home-copy">
                <p className="eyebrow"><span />来自另一个世界的信号</p>
                <h1 id="home-title" className="home-title">
                  <span className="home-title-brand">Elsewhere</span>
                  <span className="home-title-cn">未接来电</span>
                </h1>
                <div className="home-intro">
                  <p>如果当年，你选择了另一条路。</p>
                  <p>平行世界的你，正在来电。</p>
                </div>
              </div>

              <CallCard className="home-call" />

              <div className="home-actions">
                <p className="quiet-note"><span className="status-dot" aria-hidden="true" />一段虚构的平行人生，无需注册</p>
              </div>
            </section>
          )}

          {view === 'intro' && (
            <section className="screen-enter intro-layout" aria-labelledby="intro-title">
              <p className="eyebrow"><span />来电前言</p>
              <h1 ref={introHeading} tabIndex={-1} id="intro-title" className="intro-heading">
                如果当年选择了音乐，<br className="hidden sm:block" />你现在会在哪里？
              </h1>
              <div className="intro-copy">
                <p>想象一下电话另一端的声音：那么熟悉，却来自你不曾抵达的人生。</p>
                <p>这是一段虚构的平行人生，不代表对未来的预测。</p>
              </div>
            </section>
          )}

          {view === 'incoming' && (
            <section className="screen-enter incoming-layout" aria-labelledby="incoming-title">
              <div className="incoming-copy">
                <p className="eyebrow"><span />一通来自平行世界的来电</p>
                <h1 ref={incomingHeading} tabIndex={-1} id="incoming-title">另一个你，<br />正在来电</h1>
                <p>这不是一次真实的通话。你可以随时结束，也可以听听另一条路上的自己。</p>
              </div>
              <CallCard className="incoming-call" />
              <div className="incoming-actions">
                <p className="quiet-note">剧情模拟，不会请求麦克风或通知权限。</p>
              </div>
            </section>
          )}

          {view === 'call' && currentNode.kind !== 'end' && (
            <section className="screen-enter call-session" aria-labelledby="call-title">
              <p className="sr-only" aria-live="polite" aria-atomic="true">{liveText}</p>
              <div className="call-session-header">
                <div>
                  <p className="eyebrow"><span />另一个你 · 来自平行世界的自己</p>
                  <h1 ref={callHeading} tabIndex={-1} id="call-title">第一通来电</h1>
                </div>
                <button type="button" className="end-call-action" onClick={() => setConfirmOpen(true)}>结束通话</button>
              </div>

              {currentNode.kind === 'dialogue' && (
                <div className="dialogue-stage">
                  <p className="dialogue-progress">主线 {String(openingDialogue.findIndex(({ id }) => id === currentNode.id) + 1).padStart(2, '0')} / 07</p>
                  <article className="dialogue-card">
                    <p className="dialogue-speaker">{currentNode.speaker}</p>
                    <p className="dialogue-text">{currentNode.text}</p>
                  </article>
                  <button type="button" className="primary-action group dialogue-continue" onClick={() => setProgress(advanceOpening)}>
                    <span>继续</span><span className="action-icon"><Arrow /></span>
                  </button>
                </div>
              )}

              {currentNode.kind === 'choice' && (
                <div className="choice-stage">
                  <p className="dialogue-progress">{currentNode.id === 'first-response' ? '第一次选择' : '第二次选择'}</p>
                  {currentNode.id === 'next-step' && <p className="dialogue-speaker">另一个你</p>}
                  <h2 ref={choiceHeading} tabIndex={-1} id="choice-title">
                    {currentNode.id === 'first-response' ? '你想怎么回答？' : '如果明天就能为自己做一件小事，你想从哪里开始？'}
                  </h2>
                  <div className="choice-options" aria-labelledby="choice-title">
                    {currentNode.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="choice-option"
                        onMouseEnter={() => setPreviewScene(getChoicePreviewScene(option.id))}
                        onMouseLeave={() => setPreviewScene(null)}
                        onFocus={() => setPreviewScene(getChoicePreviewScene(option.id))}
                        onBlur={() => setPreviewScene(null)}
                        onClick={() => setProgress((current) => chooseOpening(current, option.id))}
                      >
                        <span>{option.label}</span><Arrow />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(currentNode.kind === 'feedback' || currentNode.kind === 'closing') && (
                <div className="dialogue-stage">
                  <p className="dialogue-progress">
                    {currentNode.kind === 'closing'
                      ? currentNode.id === 'opening-closing' ? '共同衔接' : '通话尾声'
                      : safeProgress.nextStepId ? '行动反馈' : `回应反馈 ${currentNode.id.endsWith('01') ? '01' : '02'} / 02`}
                  </p>
                  <article className="dialogue-card">
                    <p className="dialogue-speaker">{currentNode.speaker}</p>
                    <p className="dialogue-text">{currentNode.text}</p>
                  </article>
                  <button type="button" className="primary-action group dialogue-continue" onClick={() => setProgress(advanceOpening)}>
                    <span>继续</span><span className="action-icon"><Arrow /></span>
                  </button>
                </div>
              )}
            </section>
          )}

          {view === 'call' && currentNode.kind === 'end' && (
            <section className="screen-enter end-layout" aria-labelledby="end-title" data-ending-id={currentNode.id}>
              <p className="eyebrow"><span />剧情结局</p>
              <h1 ref={endHeading} tabIndex={-1} id="end-title">{currentNode.title}</h1>
              <div className="end-reflection">
                {selectedOption && <p className="end-choice">你的回应：{selectedOption.label}</p>}
                {selectedNextStep && <p className="end-choice">下一步：{selectedNextStep.label}</p>}
                <p>{currentNode.summary}</p>
              </div>
              <div className="action-row">
                <button type="button" className="primary-action group" onClick={showIncoming}>
                  <span>重听这通来电</span><span className="action-icon"><Arrow returning /></span>
                </button>
                <button type="button" className="secondary-action group home-return-action" onClick={returnHome}>
                  <span>返回首页</span><span className="action-icon"><Arrow /></span>
                </button>
              </div>
            </section>
          )}

          {view !== 'call' && (
            <div className="journey-actions">
              <button
                ref={view === 'home' ? startButton : undefined}
                type="button"
                className="primary-action group"
                onClick={view === 'home' ? () => setView('intro') : view === 'intro' ? showIncoming : answerCall}
              >
                <span>{view === 'home' ? '开始体验' : view === 'intro' ? '进入来电' : '接听'}</span>
                <span className="action-icon"><Arrow /></span>
              </button>
              {view !== 'home' && (
                <button type="button" className="secondary-action group home-return-action journey-return-action" onClick={returnHome}>
                  <span className="action-icon"><Arrow returning /></span><span>返回首页</span>
                </button>
              )}
            </div>
          )}
        </main>

        <footer className="app-footer">
          <span>AN INTERACTIVE STORY</span>
          <span>此刻 · 另一种可能</span>
        </footer>
      </div>

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
        <h2 id="confirm-title">结束本次通话并返回首页？</h2>
        <p>当前对话与选择将清空。</p>
        <div className="action-row">
          <button type="button" className="secondary-action" onClick={() => setConfirmOpen(false)}>取消</button>
          <button type="button" className="danger-action" onClick={returnHome}>确认结束</button>
        </div>
      </dialog>
    </div>
  )
}

export default App
