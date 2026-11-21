import { Fragment, useEffect, useRef, useState } from 'react'
import type { SceneName } from './SceneBackground'

type Halo = { cx: number; cy: number; rx: number; ry: number }
type Hit = { cx: number; cy: number; w: number; h: number }
type EdgeMask = { x: number; y: number; w: number; h: number; x1: number; y1: number; x2: number; y2: number }

type WhisperEdge = {
  transform: string
  mask: EdgeMask
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

const HOVER_DELAY = 150

const whispers: Partial<Record<SceneName, Whisper[]>> = {
  'home-hero': [{
    id: 'guitar',
    x: 1290,
    y: 458,
    text: '琴弦上还留着当年的指印。',
    hit: { cx: 1285, cy: 421, w: 160, h: 360 },
    halo: { cx: 1285, cy: 494, rx: 102, ry: 141 },
  }],
  home: [{
    id: 'guitar',
    x: 1066,
    y: 318,
    text: '琴弦上还留着当年的指印。',
    hit: { cx: 1065, cy: 314, w: 108, h: 182 },
    halo: { cx: 1064, cy: 315, rx: 75, ry: 103 },
    edge: {
      transform: 'translate(0 -60) translate(860 176) translate(150 96) scale(0.72) rotate(-12 70 130)',
      mask: { x: -10, y: -10, w: 170, h: 250, x1: 20, y1: 0, x2: 140, y2: 230 },
    },
  }],
  connection: [{
    id: 'phone',
    x: 831,
    y: 508,
    text: '信号只够传过来声音。',
    hit: { cx: 825, cy: 510, w: 185, h: 108 },
    halo: { cx: 825, cy: 510, rx: 95, ry: 54 },
  }],
  doubt: [{
    id: 'photo',
    x: 1056,
    y: 416,
    text: '两张照片，背面写着同一天。',
    hit: { cx: 1056, cy: 426, w: 465, h: 274 },
    halo: { cx: 1056, cy: 426, rx: 230, ry: 130 },
  }],
  rehearsal: [{
    id: 'sheet',
    x: 555,
    y: 374,
    text: '第三小节，改了很多次。',
    hit: { cx: 550, cy: 375, w: 345, h: 310 },
    halo: { cx: 550, cy: 375, rx: 172, ry: 155 },
  }],
  desk: [{
    id: 'clock',
    x: 824,
    y: 317,
    text: '秒针走得很慢，像在等回答。',
    placement: 'below',
    hit: { cx: 819, cy: 306, w: 226, h: 240 },
    halo: { cx: 819, cy: 306, rx: 102, ry: 115 },
  }],
  question: [{
    id: 'voice',
    x: 860,
    y: 354,
    text: '有句话，被杂音轻轻吞掉了。',
    hit: { cx: 854, cy: 355, w: 214, h: 157 },
    halo: { cx: 854, cy: 355, rx: 98, ry: 67 },
  }],
  'regret-quiet': [{
    id: 'guitar',
    x: 875,
    y: 426,
    text: '最旧的那根弦，一直没换。',
    hit: { cx: 875, cy: 426, w: 490, h: 275 },
    halo: { cx: 875, cy: 426, rx: 230, ry: 128 },
  }],
  closing: [{
    id: 'rings',
    x: 834,
    y: 413,
    text: '波纹散开，又回到原处。',
    placement: 'below',
    hit: { cx: 834, cy: 413, w: 420, h: 126 },
    halo: { cx: 834, cy: 413, rx: 210, ry: 60 },
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

export function SceneWhispers({ scene, layoutKey }: { scene: SceneName; layoutKey: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<number | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0, dockTop: 0 })
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
    const dock = host.parentElement?.querySelector('.call-dock, .prelude-dock')
    const measure = () => {
      const rect = host.getBoundingClientRect()
      const dockTop = dock ? dock.getBoundingClientRect().top - rect.top : rect.height
      setSize((current) => current.width === rect.width && current.height === rect.height && current.dockTop === dockTop
        ? current
        : { width: rect.width, height: rect.height, dockTop })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    if (dock) observer.observe(dock)
    return () => observer.disconnect()
  }, [layoutKey])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (hoverTimer.current !== null) {
        window.clearTimeout(hoverTimer.current)
        hoverTimer.current = null
      }
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
    const next = pinnedId === id ? null : id
    setPinnedId(next)
    setHoveredId(next)
  }

  useEffect(() => () => clearTimer(), [])

  const [imageWidth, imageHeight] = scene === 'home' ? [1440, 900] : [1672, 941]
  const scale = size.width > 0 && size.height > 0 ? Math.max(size.width / imageWidth, size.height / imageHeight) : 0
  const offsetX = (size.width - imageWidth * scale) / 2
  const offsetY = (size.height - imageHeight * scale) * 0.46
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
                    <feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="dilate" />
                    <feComposite in="SourceAlpha" in2="dilate" operator="out" result="ring" />
                    <feGaussianBlur in="ring" stdDeviation="2.4" result="soft" />
                    <feFlood floodColor="#ffd7a2" floodOpacity="1" result="color" />
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
                    <GuitarSilhouette />
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
          const anchorX = offsetX + item.x * scale
          const anchorY = offsetY + item.y * scale
          const bubbleX = Math.max(124, Math.min(size.width - 124, anchorX))
          const bubbleY = Math.min(anchorY, size.dockTop - 16)
          const placement = item.placement === 'below' && bubbleY + 52 < size.dockTop ? 'below' : 'above'
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
              aria-expanded={active}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse' || event.pointerType === 'pen') showSoon(item.id)
              }}
              onPointerLeave={() => hide(item.id)}
              onFocus={() => showNow(item.id)}
              onBlur={() => hide(item.id)}
              onClick={(event) => {
                if (event.detail > 1) return
                togglePin(item.id)
              }}
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
                  className={`scene-whisper-bubble is-${placement}`}
                  style={{
                    left: bubbleX - anchorX,
                    top: placement === 'below' ? bubbleY - anchorY + 9 : 'auto',
                    bottom: placement === 'above' ? anchorY - bubbleY + 9 : 'auto',
                  }}
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
