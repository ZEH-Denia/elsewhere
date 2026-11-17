import { useEffect, useRef, useState } from 'react'

type View = 'home' | 'intro'

function PhoneSymbol() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M16.8 8.5 21 17l-4.7 3.6c2.3 5.1 6 8.8 11.1 11.1l3.6-4.7 8.5 4.2-.8 7.1c-.2 1.7-1.7 2.9-3.4 2.7C18.5 39.5 8.5 29.5 7 12.7c-.2-1.7 1-3.2 2.7-3.4l7.1-.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 8c6.5 1.3 10.7 5.5 12 12M29.5 14c3.3.8 5.7 3.2 6.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
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
  const previousView = useRef<View>('home')
  const startButton = useRef<HTMLButtonElement>(null)
  const introHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view

    if (view === 'intro') {
      introHeading.current?.focus()
    } else {
      startButton.current?.focus()
    }
  }, [view])

  return (
    <div className="app-background min-h-svh overflow-hidden text-mist">
      <div className="ambient ambient-violet" aria-hidden="true" />
      <div className="ambient ambient-cyan" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-360 flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-line sm:h-24">
          <div className="flex items-center gap-3" aria-label="Elsewhere">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="font-mono text-xs font-medium tracking-[0.24em] text-mist">ELSEWHERE</span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-dim sm:text-xs">平行人生 <span className="mx-2 text-line-strong">/</span> 001</p>
        </header>

        <main className="flex flex-1 items-center py-10 sm:py-14 lg:py-16">
          {view === 'home' ? (
            <section className="screen-enter grid w-full items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16" aria-labelledby="home-title">
              <div className="max-w-2xl">
                <p className="eyebrow mb-6"><span />来自另一个世界的信号</p>
                <h1 id="home-title" className="font-medium tracking-[-0.045em]">
                  <span className="block text-[clamp(3.4rem,8vw,7.2rem)] leading-[0.9] text-white">Elsewhere</span>
                  <span className="mt-5 block text-[clamp(1.75rem,3vw,2.75rem)] font-normal tracking-[0.16em] text-mist">未接来电</span>
                </h1>
                <div className="mt-8 max-w-lg space-y-3 text-base leading-8 text-soft sm:text-lg">
                  <p>如果当年，你做了另一个选择。</p>
                  <p>某个平行世界里，另一个你正试图拨通这通电话。</p>
                </div>
                <button ref={startButton} type="button" className="primary-action group mt-9" onClick={() => setView('intro')}>
                  <span>开始体验</span>
                  <span className="action-icon"><Arrow /></span>
                </button>
                <p className="mt-5 flex items-center gap-2 text-xs tracking-wide text-dim">
                  <span className="status-dot" aria-hidden="true" />一段虚构的平行人生，无需注册
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-105 lg:mx-0 lg:ml-auto" aria-hidden="true">
                <div className="orbit orbit-outer"><span /></div>
                <div className="orbit orbit-inner"><span /></div>
                <div className="phone-card">
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-dim">
                    <span>UNKNOWN CALLER</span><span>001</span>
                  </div>
                  <div className="my-10 flex flex-col items-center sm:my-12">
                    <div className="phone-symbol"><PhoneSymbol /></div>
                    <p className="mt-7 text-2xl font-medium tracking-[0.12em] text-white">另一个你</p>
                    <p className="mt-3 text-sm tracking-[0.08em] text-soft">来自平行世界的自己</p>
                  </div>
                  <div className="border-t border-line pt-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.18em] text-dim">SIGNAL ORIGIN</p>
                        <p className="mt-2 text-sm text-mist">另一种可能</p>
                      </div>
                      <div className="signal-lines"><i /><i /><i /><i /><i /></div>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-center font-mono text-[9px] tracking-[0.22em] text-dim">A CALL ACROSS POSSIBILITIES</p>
              </div>
            </section>
          ) : (
            <section className="screen-enter mx-auto w-full max-w-3xl" aria-labelledby="intro-title">
              <p className="eyebrow mb-7"><span />来电前言</p>
              <p className="mb-6 font-mono text-xs tracking-[0.18em] text-dim">BEFORE THE CALL <span className="mx-2 text-line-strong">/</span> 01</p>
              <h1 ref={introHeading} tabIndex={-1} id="intro-title" className="intro-heading max-w-3xl text-[clamp(2.25rem,5vw,4.75rem)] font-medium leading-[1.2] tracking-[-0.035em] text-white outline-none">
                如果当年选择了音乐，<br className="hidden sm:block" />你现在会在哪里？
              </h1>
              <div className="mt-9 max-w-xl border-l border-accent pl-5 sm:pl-7">
                <p className="text-base leading-8 text-soft sm:text-lg">闭上眼，想象电话另一端的声音。熟悉，却又走向了你未曾抵达的人生。</p>
                <p className="mt-5 text-sm leading-7 text-dim">这是一段虚构的平行人生，不代表对真实未来的预测。</p>
              </div>
              <button type="button" className="secondary-action group mt-10" onClick={() => setView('home')}>
                <span className="action-icon"><Arrow returning /></span>
                <span>返回首页</span>
              </button>
            </section>
          )}
        </main>

        <footer className="flex min-h-16 shrink-0 items-center justify-between border-t border-line py-4 font-mono text-[9px] tracking-[0.16em] text-dim sm:text-[10px]">
          <span>AN INTERACTIVE STORY</span>
          <span>此刻 · 另一种可能</span>
        </footer>
      </div>
    </div>
  )
}

export default App
