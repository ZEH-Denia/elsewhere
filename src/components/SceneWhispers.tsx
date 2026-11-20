import { useEffect, useRef, useState } from 'react'
import type { SceneName } from './SceneBackground'

type Whisper = {
  id: string
  x: number
  y: number
  text: string
  placement?: 'above' | 'below'
}

const HOVER_DELAY = 450

const whispers: Partial<Record<SceneName, Whisper[]>> = {
  home: [{ id: 'guitar', x: 978, y: 478, text: '琴弦上还留着当年的指印。' }],
  connection: [{ id: 'phone', x: 720, y: 247, text: '信号只够传过来声音。' }],
  doubt: [{ id: 'photo', x: 898, y: 238, text: '两张照片，背面写着同一天。' }],
  rehearsal: [{ id: 'sheet', x: 336, y: 205, text: '第三小节，改了很多次。' }],
  desk: [{ id: 'clock', x: 720, y: 236, text: '秒针走得很慢，像在等回答。', placement: 'below' }],
  question: [{ id: 'voice', x: 720, y: 352, text: '有句话，被杂音轻轻吞掉了。' }],
  'regret-quiet': [{ id: 'guitar', x: 769, y: 480, text: '最旧的那根弦，一直没换。' }],
  closing: [{ id: 'rings', x: 720, y: 300, text: '波纹散开，又回到原处。', placement: 'below' }],
}

export function SceneWhispers({ scene }: { scene: SceneName }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<number | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pinnedId, setPinnedId] = useState<string | null>(null)
  const items = whispers[scene] ?? []

  useEffect(() => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
    setHoveredId(null)
    setPinnedId(null)
  }, [scene])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const measure = () => {
      const rect = host.getBoundingClientRect()
      setSize((current) =>
        current.width === rect.width && current.height === rect.height ? current : { width: rect.width, height: rect.height },
      )
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setHoveredId(null)
      setPinnedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const clearTimer = () => {
    if (hoverTimer.current === null) return
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = null
  }

  const showSoon = (id: string) => {
    clearTimer()
    hoverTimer.current = window.setTimeout(() => setHoveredId(id), HOVER_DELAY)
  }

  const showNow = (id: string) => {
    clearTimer()
    setHoveredId(id)
  }

  const hide = (id: string) => {
    clearTimer()
    setHoveredId((current) => (current === id ? null : current))
  }

  const togglePin = (id: string) => {
    clearTimer()
    setPinnedId((current) => (current === id ? null : id))
    setHoveredId(id)
  }

  useEffect(() => () => clearTimer(), [])

  const scale = size.width > 0 && size.height > 0 ? Math.max(size.width / 1440, size.height / 900) : 0
  const offsetX = (size.width - 1440 * scale) / 2
  const offsetY = (size.height - 900 * scale) * 0.46
  const activeId = hoveredId ?? pinnedId

  return (
    <div className="scene-whispers" ref={hostRef}>
      {scale > 0 &&
        items.map((item) => {
          const active = activeId === item.id
          const bubbleId = `whisper-${scene}-${item.id}`
          return (
            <button
              key={item.id}
              type="button"
              className={`scene-whisper${active ? ' is-open' : ''}`}
              style={{ left: offsetX + item.x * scale, top: offsetY + item.y * scale }}
              aria-label="画面细节"
              aria-describedby={bubbleId}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse' || event.pointerType === 'pen') showSoon(item.id)
              }}
              onPointerLeave={() => hide(item.id)}
              onFocus={() => showNow(item.id)}
              onBlur={() => hide(item.id)}
              onClick={() => togglePin(item.id)}
            >
              <span className="scene-whisper-dot" aria-hidden="true" />
              <span
                id={bubbleId}
                className={`scene-whisper-bubble is-${item.placement ?? 'above'}`}
              >
                {item.text}
              </span>
            </button>
          )
        })}
    </div>
  )
}
