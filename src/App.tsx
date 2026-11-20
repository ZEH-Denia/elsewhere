import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CallCard, CallState } from './components/CallCard'
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

type View = 'home' | 'intro' | 'incoming' | 'call'

function getSceneName(view: View, node: ReturnType<typeof getOpeningNode>): SceneName {
  if (view === 'home' || view === 'intro') return 'home'
  if (view === 'incoming') return 'incoming'

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
  const sceneName = getSceneName(view, currentNode)

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

  function advanceOnSurfaceClick(event: MouseEvent<HTMLDivElement>) {
    if (view !== 'call' || confirmOpen) return
    if (currentNode.kind !== 'dialogue' && currentNode.kind !== 'feedback' && currentNode.kind !== 'closing') return
    const target = event.target
    if (target instanceof Element && target.closest('button, a, input, select, textarea, dialog, [role="dialog"]')) return
    if (window.getSelection()?.toString()) return
    setProgress(advanceOpening)
  }

  const liveText = currentNode.kind === 'dialogue' || currentNode.kind === 'feedback' || currentNode.kind === 'closing'
    ? `${currentNode.speaker}：${currentNode.text}`
    : ''
  const callActive = view === 'call' && currentNode.kind !== 'end'
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
  const screenKey = view !== 'call'
    ? view
    : currentNode.kind === 'end'
      ? 'call-end'
      : currentNode.kind === 'choice'
        ? `call-${currentNode.id}`
        : 'call-dialogue'

  return (
    <div className="app-background min-h-svh text-mist" data-view={view} onClick={advanceOnSurfaceClick}>
      <SceneBackground scene={sceneName} preview={previewScene} />
      {previewScene === null && <SceneWhispers scene={sceneName} />}
      <div className="ambient ambient-violet" aria-hidden="true" />
      <div className="ambient ambient-cyan" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-360 flex-col px-5 sm:px-8 lg:px-12">
        <header className="app-header">
          <div className="flex items-center gap-3" aria-label="Elsewhere">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="header-brand font-mono text-xs font-medium tracking-[0.24em]">ELSEWHERE</span>
          </div>
          {callActive ? (
            <div className="header-call">
              <h1 ref={callHeading} tabIndex={-1} id="call-title" className="header-call-title">第一通来电</h1>
              <button type="button" className="end-call-action header-end-call" onClick={() => setConfirmOpen(true)}>结束通话</button>
            </div>
          ) : (
            <p className="header-meta font-mono text-[10px] tracking-[0.16em] sm:text-xs">平行人生 <span className="header-sep mx-2">/</span> 001</p>
          )}
        </header>

        <main className={`app-main${callActive ? ' is-call' : view !== 'call' ? ' is-prelude' : ''}`}>
          <div key={screenKey} className="screen-transition" data-screen={screenKey}>
            {view === 'home' && (
              <section className="screen-enter prelude" aria-labelledby="home-title">
                <div className="prelude-stage">
                  <CallCard className="home-call" object />
                </div>
                <div className="prelude-dock">
                  <article className="prelude-panel">
                    <div className="prelude-copy">
                      <p className="eyebrow"><span />来自另一个世界的信号</p>
                      <h1 id="home-title" className="home-title">
                        <span className="home-title-brand">Elsewhere</span>
                        <span className="home-title-cn">未接来电</span>
                      </h1>
                      <div className="home-intro">
                        <p>如果当年，你选择了另一条路。</p>
                        <p>平行世界的你，正在来电。</p>
                      </div>
                      <p className="quiet-note prelude-note"><span className="status-dot" aria-hidden="true" />一段虚构的平行人生，无需注册</p>
                    </div>
                    <div className="prelude-actions">
                      <button ref={startButton} type="button" className="primary-action group" onClick={() => setView('intro')}>
                        <span>开始体验</span><span className="action-icon"><Arrow /></span>
                      </button>
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
              <section className="screen-enter prelude prelude-incoming" aria-labelledby="incoming-title">
                <div className="prelude-stage">
                  <CallCard className="incoming-call" object status="ringing" />
                </div>
                <div className="prelude-dock">
                  <article className="prelude-panel">
                    <div className="prelude-copy">
                      <p className="eyebrow"><span />一通来自平行世界的来电</p>
                      <h1 ref={incomingHeading} tabIndex={-1} id="incoming-title">另一个你，<br />正在来电</h1>
                      <p className="incoming-note">这不是一次真实的通话。你可以随时结束，也可以听听另一条路上的自己。</p>
                      <p className="quiet-note prelude-note">剧情模拟，不会请求麦克风或通知权限。</p>
                    </div>
                    <div className="prelude-actions">
                      <button type="button" className="panel-return-action group" onClick={returnHome}>
                        <span className="action-icon"><Arrow returning /></span><span>返回首页</span>
                      </button>
                      <button type="button" className="primary-action group" onClick={answerCall}>
                        <span>接听</span><span className="action-icon"><Arrow /></span>
                      </button>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {view === 'call' && currentNode.kind !== 'end' && (
              <section className="screen-enter call-session" aria-labelledby="call-title">
                <p className="sr-only" aria-live="polite" aria-atomic="true">{liveText}</p>
                <div className={`call-dock${currentNode.kind === 'choice' ? ' is-choice' : ''}`}>
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
                    <div className="dialogue-panel-footer">
                      <p className="dialogue-progress">{panelProgress}</p>
                      {currentNode.kind === 'choice' ? (
                        <p className="choice-hint">移入选项可预览另一条路 · 选择会改变走向</p>
                      ) : (
                        <button type="button" className="dialogue-continue" onClick={() => setProgress(advanceOpening)}>
                          <span>继续</span><span className="action-icon"><Arrow /></span>
                        </button>
                      )}
                    </div>
                  </article>

                  {currentNode.kind === 'choice' && (
                    <div className="choice-options" aria-labelledby="choice-title">
                      {currentNode.options.map((option, index) => (
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
                          <span className="choice-index">{String(index + 1).padStart(2, '0')}</span>
                          <span className="choice-label">{option.label}</span>
                          <span className="choice-arrow"><Arrow /></span>
                        </button>
                      ))}
                    </div>
                  )}
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
                  <button type="button" className="primary-action group" onClick={showIncoming}>
                    <span>重听这通来电</span><span className="action-icon"><Arrow returning /></span>
                  </button>
                  <button type="button" className="secondary-action group home-return-action" onClick={returnHome}>
                    <span>返回首页</span><span className="action-icon"><Arrow /></span>
                  </button>
                </div>
              </section>
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
