import { Fragment, useEffect, useRef, useState } from 'react'
import type { SceneName } from './SceneBackground'

type EdgeKind = 'guitar' | 'sheet'

type Halo = { cx: number; cy: number; rx: number; ry: number }
type Hit = { cx: number; cy: number; w: number; h: number }
type EdgeMask = { x: number; y: number; w: number; h: number; x1: number; y1: number; x2: number; y2: number }

type WhisperEdge = {
  kind: EdgeKind
  transform: string
  mask: EdgeMask
  soft?: boolean
}

type Whisper = {
  id: string
  x: number
  y: number
  text: string
  placement?: 'above' | 'below'
  hit: Hit
  halo: Halo
  edge?: WhisperEdge
}

const HOVER_DELAY = 450

const whispers: Partial<Record<SceneName, Whisper[]>> = {
  home: [{
    id: 'guitar',
    x: 978,
    y: 478,
    text: '琴弦上还留着当年的指印。',
    hit: { cx: 974, cy: 460, w: 280, h: 260 },
    halo: { cx: 973, cy: 478, rx: 150, ry: 200 },
    edge: {
      kind: 'guitar',
      transform: 'translate(0 -60) translate(900 378) rotate(-12 70 130)',
      mask: { x: -10, y: -10, w: 170, h: 250, x1: 20, y1: 0, x2: 140, y2: 230 },
    },
  }],
  connection: [{
    id: 'phone',
    x: 720,
    y: 247,
    text: '信号只够传过来声音。',
    hit: { cx: 720, cy: 245, w: 300, h: 220 },
    halo: { cx: 720, cy: 245, rx: 135, ry: 105 },
  }],
  doubt: [{
    id: 'photo',
    x: 898,
    y: 238,
    text: '两张照片，背面写着同一天。',
    hit: { cx: 930, cy: 240, w: 320, h: 230 },
    halo: { cx: 930, cy: 240, rx: 150, ry: 115 },
  }],
  rehearsal: [{
    id: 'sheet',
    x: 336,
    y: 205,
    text: '第三小节，改了很多次。',
    hit: { cx: 338, cy: 204, w: 330, h: 270 },
    halo: { cx: 338, cy: 204, rx: 175, ry: 135 },
    edge: {
      kind: 'sheet',
      transform: 'translate(0 -60) translate(-492.2 -120.4) scale(1.28) translate(648 300) rotate(-3)',
      mask: { x: -120, y: -88, w: 240, h: 176, x1: -96, y1: -64, x2: 96, y2: 64 },
      soft: true,
    },
  }],
  desk: [{
    id: 'clock',
    x: 720,
    y: 236,
    text: '秒针走得很慢，像在等回答。',
    placement: 'below',
    hit: { cx: 720, cy: 178, w: 280, h: 250 },
    halo: { cx: 720, cy: 178, rx: 120, ry: 120 },
  }],
  question: [{
    id: 'voice',
    x: 720,
    y: 352,
    text: '有句话，被杂音轻轻吞掉了。',
    hit: { cx: 710, cy: 376, w: 360, h: 220 },
    halo: { cx: 710, cy: 372, rx: 155, ry: 95 },
  }],
  'regret-quiet': [{
    id: 'guitar',
    x: 769,
    y: 480,
    text: '最旧的那根弦，一直没换。',
    hit: { cx: 768, cy: 478, w: 300, h: 340 },
    halo: { cx: 766, cy: 484, rx: 155, ry: 200 },
    edge: {
      kind: 'guitar',
      transform: 'translate(0 -60) translate(-449.3 -103.2) scale(1.24) translate(900 378) rotate(-12 70 130)',
      mask: { x: -10, y: -10, w: 170, h: 250, x1: 20, y1: 0, x2: 140, y2: 230 },
    },
  }],
  closing: [{
    id: 'rings',
    x: 720,
    y: 300,
    text: '波纹散开，又回到原处。',
    placement: 'below',
    hit: { cx: 720, cy: 304, w: 360, h: 300 },
    halo: { cx: 720, cy: 304, rx: 160, ry: 150 },
  }],
}

function GuitarSilhouette() {
  return (
    <>
      <path d="M72 14V144" stroke="#ffd7a2" strokeWidth="15" strokeLinecap="round" fill="none" />
      <path d="M66 14H78V72H66Z" fill="#ffd7a2" />
      <path
        d="M72 113C43 102 25 124 35 150C8 173 27 218 69 221C113 224 135 181 110 153C122 125 100 104 72 113Z"
        fill="#ffd7a2"
        stroke="#ffd7a2"
        strokeWidth="3"
      />
    </>
  )
}

function SheetSilhouette() {
  return <rect x="-96" y="-64" width="192" height="128" rx="4" fill="#ffd7a2" />
}

function EdgeSilhouette({ kind }: { kind: EdgeKind }) {
  return kind === 'guitar' ? <GuitarSilhouette /> : <SheetSilhouette />
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
    <div className={`scene-whispers${activeId ? ' has-open' : ''}`} ref={hostRef}>
      {scale > 0 && items.length > 0 && (
        <svg
          className="scene-whisper-art"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {items.map((item) => (
              <radialGradient key={`halo-${item.id}`} id={`whisper-halo-${scene}-${item.id}`}>
                <stop offset="0%" stopColor="#ffd8a4" stopOpacity="0.42" />
                <stop offset="42%" stopColor="#ffc98d" stopOpacity="0.2" />
                <stop offset="72%" stopColor="#ffbc7f" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#ffbc7f" stopOpacity="0" />
              </radialGradient>
            ))}
            {items.filter((item) => item.edge).map((item) => {
              const edge = item.edge!
              const edgeId = `whisper-edge-${scene}-${item.id}`
              return (
                <Fragment key={edgeId}>
                  <filter id={`${edgeId}-rim`} x="-40%" y="-40%" width="180%" height="180%">
                    <feMorphology in="SourceAlpha" operator="dilate" radius={edge.soft ? 2.2 : 1.2} result="dilate" />
                    <feComposite in="SourceAlpha" in2="dilate" operator="out" result="ring" />
                    <feGaussianBlur in="ring" stdDeviation={edge.soft ? 5.5 : 2.4} result="soft" />
                    <feFlood floodColor="#ffd7a2" floodOpacity={edge.soft ? 0.86 : 1} result="color" />
                    <feComposite in="color" in2="soft" operator="in" result="rim" />
                  </filter>
                  <linearGradient
                    id={`${edgeId}-fade`}
                    gradientUnits="userSpaceOnUse"
                    x1={edge.mask.x1}
                    y1={edge.mask.y1}
                    x2={edge.mask.x2}
                    y2={edge.mask.y2}
                  >
                    <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="45%" stopColor="#fff" stopOpacity="0.82" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0.28" />
                  </linearGradient>
                  <mask
                    id={`${edgeId}-mask`}
                    maskUnits="userSpaceOnUse"
                    x={edge.mask.x}
                    y={edge.mask.y}
                    width={edge.mask.w}
                    height={edge.mask.h}
                  >
                    <rect
                      x={edge.mask.x}
                      y={edge.mask.y}
                      width={edge.mask.w}
                      height={edge.mask.h}
                      fill={`url(#${edgeId}-fade)`}
                    />
                  </mask>
                </Fragment>
              )
            })}
          </defs>
          <g transform={`translate(${offsetX} ${offsetY}) scale(${scale})`}>
            {items.map((item) => (
              <ellipse
                key={`halo-${item.id}`}
                className="scene-whisper-halo"
                cx={item.halo.cx}
                cy={item.halo.cy}
                rx={item.halo.rx}
                ry={item.halo.ry}
                fill={`url(#whisper-halo-${scene}-${item.id})`}
              />
            ))}
            {items.filter((item) => item.edge).map((item) => {
              const edge = item.edge!
              const edgeId = `whisper-edge-${scene}-${item.id}`
              return (
                <g key={`edge-${item.id}`} className="scene-whisper-edge" transform={edge.transform}>
                  <g
                    className="scene-whisper-edge-rim"
                    filter={`url(#${edgeId}-rim)`}
                    mask={`url(#${edgeId}-mask)`}
                  >
                    <EdgeSilhouette kind={edge.kind} />
                  </g>
                </g>
              )
            })}
          </g>
        </svg>
      )}
      {scale > 0 &&
        items.map((item) => {
          const active = activeId === item.id
          const bubbleId = `whisper-${scene}-${item.id}`
          return (
            <button
              key={item.id}
              type="button"
              className={`scene-whisper${active ? ' is-open' : ''}`}
              style={{
                left: offsetX + item.hit.cx * scale,
                top: offsetY + item.hit.cy * scale,
                width: item.hit.w * scale,
                height: item.hit.h * scale,
              }}
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
              <span
                className="scene-whisper-anchor"
                style={{
                  left: `calc(50% + ${(item.x - item.hit.cx) * scale}px)`,
                  top: `calc(50% + ${(item.y - item.hit.cy) * scale}px)`,
                }}
              >
                <span
                  id={bubbleId}
                  className={`scene-whisper-bubble is-${item.placement ?? 'above'}`}
                >
                  {item.text}
                </span>
              </span>
            </button>
          )
        })}
    </div>
  )
}