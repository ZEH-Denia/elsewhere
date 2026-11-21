import { mkdir, writeFile } from 'node:fs/promises'
import { careerRoom } from './career-scenes.mjs'

const outputDirectory = new URL('../public/backgrounds/', import.meta.url)

const scenes = {
  home: { phone: 0.18 },
  incoming: { phone: 0, right: 1.2 },
  opening: { phone: 0.55 },
  connection: { camera: 'center', zoom: 1.1, phone: 0.9, left: 0.85, right: 0.85, rain: 0.36 },
  doubt: { camera: 'left', zoom: 1.26, focus: 'left', motif: 'photo', left: 1.1, right: 0.4, phone: 0.16, rain: 0.28, cool: true },
  music: { focus: 'right', motif: 'music', right: 1.25, left: 0.55 },
  reality: { focus: 'left', motif: 'reality', left: 1.2, right: 0.55 },
  rehearsal: { camera: 'right', zoom: 1.28, focus: 'right', motif: 'sheet', right: 1.15, left: 0.4, phone: 0.1, rain: 0.14, warm: true },
  desk: { focus: 'left', left: 1.22, right: 0.45, motif: 'clock', phone: 0, rain: 0.24, cool: true },
  doctor: { camera: 'right', zoom: 1.2, focus: 'right', career: 'doctor', right: 1.12, left: 0.32, phone: 0, rain: 0.12, cool: true },
  teacher: { camera: 'right', zoom: 1.18, focus: 'right', career: 'teacher', right: 1.1, left: 0.4, phone: 0, rain: 0.18, warm: true },
  designer: { camera: 'right', zoom: 1.16, focus: 'right', career: 'designer', right: 1.12, left: 0.3, phone: 0, rain: 0.1, cool: true },
  founder: { camera: 'right', zoom: 1.15, focus: 'right', career: 'founder', right: 1.12, left: 0.38, phone: 0, rain: 0.35, cool: true },
  'doctor-triage': { camera: 'right', zoom: 1.12, focus: 'right', career: 'doctor', careerVariant: 1, right: 1.1, left: 0.3, phone: 0, rain: 0.08, cool: true },
  'doctor-break': { camera: 'right', zoom: 1.2, focus: 'right', career: 'doctor', careerVariant: 2, right: 1.12, left: 0.26, phone: 0, rain: 0.16, warm: true },
  'doctor-night': { camera: 'right', zoom: 1.14, focus: 'right', career: 'doctor', careerVariant: 3, right: 1.12, left: 0.28, phone: 0, rain: 0.4, cool: true },
  'teacher-window': { camera: 'right', zoom: 1.16, focus: 'right', career: 'teacher', careerVariant: 1, right: 1.1, left: 0.34, phone: 0, rain: 0.24, warm: true },
  'teacher-office': { camera: 'right', zoom: 1.2, focus: 'right', career: 'teacher', careerVariant: 2, right: 1.12, left: 0.3, phone: 0, rain: 0.12, warm: true },
  'teacher-corridor': { camera: 'right', zoom: 1.14, focus: 'right', career: 'teacher', careerVariant: 3, right: 1.1, left: 0.32, phone: 0, rain: 0.18, cool: true },
  'designer-wall': { camera: 'right', zoom: 1.14, focus: 'right', career: 'designer', careerVariant: 1, right: 1.1, left: 0.28, phone: 0, rain: 0.08, cool: true },
  'designer-night': { camera: 'right', zoom: 1.18, focus: 'right', career: 'designer', careerVariant: 2, right: 1.12, left: 0.26, phone: 0, rain: 0.34, cool: true },
  'designer-sketch': { camera: 'right', zoom: 1.22, focus: 'right', career: 'designer', careerVariant: 3, right: 1.12, left: 0.24, phone: 0, rain: 0.1, warm: true },
  'founder-meeting': { camera: 'right', zoom: 1.14, focus: 'right', career: 'founder', careerVariant: 1, right: 1.1, left: 0.34, phone: 0, rain: 0.16, cool: true },
  'founder-window': { camera: 'right', zoom: 1.16, focus: 'right', career: 'founder', careerVariant: 2, right: 1.1, left: 0.3, phone: 0, rain: 0.46, cool: true },
  'founder-server': { camera: 'right', zoom: 1.18, focus: 'right', career: 'founder', careerVariant: 3, right: 1.12, left: 0.28, phone: 0, rain: 0.12, cool: true },
  question: { split: true, motif: 'voice', phone: 0.6, left: 0.95, right: 0.95, rain: 0.18 },
  'first-choice': { split: true, phone: 0.15 },
  regret: { focus: 'right', motif: 'guitar', right: 0.9, left: 0.4, rain: 0.38, cool: true },
  'regret-quiet': { camera: 'right', zoom: 1.24, focus: 'right', right: 0.92, left: 0.25, phone: 0.12, rain: 0.46, cool: true },
  cherish: { focus: 'left', motif: 'lamp', left: 1.3, right: 0.55, warm: true },
  'cherish-morning': { camera: 'left', zoom: 1.2, focus: 'left', motif: 'lamp', left: 1.15, right: 0.4, dawn: true, rain: 0.08, warm: true },
  'second-choice': { split: true, motif: 'paths', left: 0.9, right: 0.9 },
  'make-space': { focus: 'right', motif: 'space', right: 1.15, left: 0.55 },
  'reach-out': { motif: 'reach', left: 1.05, right: 0.9, warm: true },
  closing: { motif: 'wave', phone: 0.28, left: 0.95, right: 0.95, rain: 0.08 },
  farewell: { dawn: true, phone: 0.18, left: 1.05, right: 1.05 },
  'ending-regret-space': { dawn: true, motif: 'space', focus: 'right', cool: true },
  'ending-regret-reach': { dawn: true, motif: 'reach', cool: true },
  'ending-cherish-space': { dawn: true, motif: 'space', focus: 'left', warm: true },
  'ending-cherish-reach': { dawn: true, motif: 'reach', warm: true },
}

const uiLift = 60

function randomGenerator(initialSeed) {
  let seed = initialSeed
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function rainLines(count, opacity, seed, width = 1500, height = 1080) {
  const random = randomGenerator(seed)
  const lines = Array.from({ length: count }, () => {
    const x = random() * (width + 60) - 30
    const y = random() * height - 90
    const length = 10 + random() * 28
    return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - length * 0.24).toFixed(1)}" y2="${(y + length).toFixed(1)}" stroke-width="${(0.6 + random()).toFixed(1)}" opacity="${(0.2 + random() * 0.65).toFixed(2)}"/>`
  }).join('')
  return `<g class="anim rain-drift" stroke="#c5d8e5" stroke-linecap="round" opacity="${(opacity * 0.72).toFixed(3)}">${lines}</g>`
}

function dustMotes(count, seed, tone = '#efd6ad') {
  const random = randomGenerator(seed)
  const motes = Array.from({ length: count }, () => {
    const x = 130 + random() * 1180
    const y = 150 + random() * 430
    const radius = 0.7 + random() * 1.7
    const duration = (11 + random() * 9).toFixed(1)
    const delay = (-random() * duration).toFixed(1)
    return `<circle class="anim mote" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" style="animation-duration:${duration}s;animation-delay:${delay}s"/>`
  }).join('')
  return `<g fill="${tone}" opacity=".37">${motes}</g>`
}

function cameraTransform(kind, zoom) {
  const [anchorX, anchorY] = kind === 'left' ? [368, 430] : kind === 'right' ? [1072, 430] : [720, 430]
  const [targetX, targetY] = kind === 'left' ? [560, 430] : kind === 'right' ? [880, 430] : [720, 430]
  return `translate(${(targetX - anchorX * zoom).toFixed(1)} ${(targetY - anchorY * zoom).toFixed(1)}) scale(${zoom})`
}

const motionStyle = `<style>
  .rain-drift { animation: rain-drift 11s ease-in-out infinite; }
  .mote { animation-name: mote-rise; animation-duration: 12s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; opacity: 0; }
  .glow-drift { animation: glow-drift 14s ease-in-out infinite; }
  .sway { animation: sway 11s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
  .drift { animation: drift 15s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
  .spin { animation: spin 34s linear infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  .pulse { animation: pulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  .ring { animation: ring 6.4s ease-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
  .rise { animation: rise 7s ease-in-out infinite; }
  .flow { animation: flow 7s linear infinite; }
  .blink { animation: blink 1.3s steps(2, start) infinite; }
  .signal-flow { animation: signal-flow 6s linear infinite; }
  @keyframes rain-drift { 0%, 100% { transform: translate(0px, 0px); } 50% { transform: translate(-14px, 24px); } }
  @keyframes mote-rise { 0% { opacity: 0; transform: translate(0px, 0px); } 16% { opacity: .5; } 62% { opacity: .26; } 100% { opacity: 0; transform: translate(-10px, -54px); } }
  @keyframes glow-drift { 0%, 100% { transform: translate(0px, 0px); } 50% { transform: translate(7px, -6px); } }
  @keyframes sway { 0%, 100% { transform: rotate(-1.4deg) translateY(0px); } 50% { transform: rotate(1.4deg) translateY(-4px); } }
  @keyframes drift { 0%, 100% { transform: translate(0px, 0px); } 50% { transform: translate(6px, -8px); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { transform: scaleY(.32); } 50% { transform: scaleY(1); } }
  @keyframes ring { 0% { transform: scale(.5); opacity: .4; } 68% { opacity: .1; } 100% { transform: scale(2.4); opacity: 0; } }
  @keyframes rise { 0% { opacity: 0; transform: translateY(6px); } 35% { opacity: .55; } 100% { opacity: 0; transform: translateY(-16px); } }
  @keyframes flow { to { stroke-dashoffset: -120; } }
  @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
  @keyframes signal-flow { to { stroke-dashoffset: -96; } }
  @media (prefers-reduced-motion: reduce) { .anim { animation: none !important; } }
</style>`

function guitar(x = 0, y = 0, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale}) rotate(-12 70 130)">
    <path d="M72 14V144" stroke="#9a6c45" stroke-width="15" stroke-linecap="round"/>
    <path d="M66 14H78V72H66Z" fill="#4d3429"/>
    <path d="M65 20H77M65 31H77M65 42H77M65 53H77" stroke="#c5a67e" stroke-width="2"/>
    <path d="M72 113C43 102 25 124 35 150C8 173 27 218 69 221C113 224 135 181 110 153C122 125 100 104 72 113Z" fill="#9c6744" stroke="#d4a276" stroke-opacity=".5" stroke-width="3"/>
    <path d="M72 120C51 114 40 130 47 150C28 171 43 204 71 207C100 207 115 176 98 153C107 132 92 116 72 120Z" fill="#b87b50" opacity=".65"/>
    <ellipse cx="72" cy="158" rx="15" ry="18" fill="#211b1b"/>
    <ellipse cx="72" cy="158" rx="10" ry="13" fill="#0b1119"/>
    <path d="M69 18V199M73 18V199M77 18V199" stroke="#e3d0aa" stroke-opacity=".65"/>
    <rect x="52" y="185" width="42" height="6" rx="2" fill="#50362b"/>
  </g>`
}

function phone(opacity) {
  if (!opacity) return ''
  return `<g opacity="${opacity}">
    <path d="M624 362C672 312 695 306 720 306C745 306 772 315 816 362" fill="none" stroke="#76d4d3" stroke-opacity=".16" stroke-width="20" filter="url(#blur8)"/>
    <path class="anim signal-flow" d="M624 362C672 312 695 306 720 306C745 306 772 315 816 362" fill="none" stroke="#8ad7d6" stroke-opacity=".75" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/>
    <circle cx="624" cy="362" r="5" fill="#d6c49e"/><circle cx="816" cy="362" r="5" fill="#c2a4da"/>
    <circle class="anim glow-drift" cx="720" cy="306" r="52" fill="#82d9d5" opacity=".1" filter="url(#blur8)"/>
    <circle cx="720" cy="306" r="35" fill="#0b1821" stroke="#8ad7d6" stroke-opacity=".75"/>
    <circle cx="720" cy="306" r="28" fill="#10242c" stroke="#d1f2eb" stroke-opacity=".12"/>
    <path d="M707 293L714 303L708 308C711 314 715 318 721 320L725 314L735 320L733 327C732 330 729 331 726 330C711 326 701 316 697 301C696 297 698 294 701 293Z" fill="none" stroke="#c7eeea" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M741 284C749 287 754 293 756 301M744 275C757 279 765 289 768 302" fill="none" stroke="#91d8d4" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
  </g>`
}

function motif(kind) {
  if (kind === 'music') return `<g class="anim drift"><g transform="translate(594 112)" fill="none" stroke="#d8b8ed" stroke-opacity=".38" stroke-width="3">
    <path d="M0 28H252M0 46H252M0 64H252M0 82H252M0 100H252"/>
    <path d="M72 28V82L46 91M164 12V70L136 79M72 40L164 25"/>
    <ellipse cx="38" cy="92" rx="15" ry="10" fill="#b890d0" fill-opacity=".25" transform="rotate(-16 38 92)"/>
    <ellipse cx="128" cy="80" rx="15" ry="10" fill="#b890d0" fill-opacity=".25" transform="rotate(-16 128 80)"/>
  </g></g>`
  if (kind === 'reality') return `<g class="anim drift"><g transform="translate(590 108)">
    <rect width="264" height="132" rx="12" fill="#0d1b28" fill-opacity=".64" stroke="#7ea8b7" stroke-opacity=".24"/>
    <circle cx="22" cy="20" r="3" fill="#c79b68"/><circle cx="34" cy="20" r="3" fill="#6f9ea7"/><circle cx="46" cy="20" r="3" fill="#687a91"/>
    <path d="M26 50H90M104 50H154M42 70H106M120 70H218M42 90H78M92 90H162M26 110H70M84 110H132" stroke="#8ac4c3" stroke-opacity=".44" stroke-width="5" stroke-linecap="round"/>
    <path d="M164 50H218M174 90H224M144 110H196" stroke="#d0a674" stroke-opacity=".42" stroke-width="5" stroke-linecap="round"/>
    <rect class="anim blink" x="138" y="104" width="6" height="11" rx="1" fill="#8ac4c3" opacity=".7"/>
  </g></g>`
  if (kind === 'guitar') return `<g class="anim drift"><ellipse cx="724" cy="440" rx="180" ry="230" fill="url(#stageGlow)"/>${guitar(650, 280, 1.05)}</g>`
  if (kind === 'lamp') return `<g class="anim drift"><g transform="translate(610 258)">
    <ellipse cx="112" cy="150" rx="190" ry="200" fill="url(#lampGlow)"/>
    <path d="M110 170L158 62M158 62L122 32" stroke="#76716a" stroke-width="10" stroke-linecap="round"/>
    <path d="M78 12Q124 -4 154 36L128 80Q92 66 78 12Z" fill="#c69b65" stroke="#f2d29f" stroke-opacity=".5" stroke-width="3"/>
    <path d="M92 76L0 282H242L132 76Z" fill="#f5c57e" opacity=".07"/>
    <ellipse cx="110" cy="182" rx="58" ry="12" fill="#80715d"/><ellipse cx="110" cy="178" rx="40" ry="7" fill="#e0bf86" opacity=".6"/>
  </g></g>`
  if (kind === 'paths') return `<g fill="none" stroke-linecap="round">
    <path d="M720 640C682 520 548 466 480 354" stroke="#e2bd82" stroke-opacity=".35" stroke-width="3"/>
    <path d="M720 640C760 520 890 462 962 354" stroke="#c5a2df" stroke-opacity=".35" stroke-width="3"/>
    <path d="M720 640C682 520 548 466 480 354M720 640C760 520 890 462 962 354" stroke="#d9ece7" stroke-opacity=".35" stroke-width="12" filter="url(#blur8)"/>
    <path class="anim flow" d="M720 640C682 520 548 466 480 354M720 640C760 520 890 462 962 354" stroke="#e9fbf6" stroke-opacity=".5" stroke-width="2" stroke-dasharray="5 19"/>
    <circle cx="720" cy="640" r="7" fill="#a5d9d2" fill-opacity=".65"/>
  </g>`
  if (kind === 'space') return `<g class="anim drift"><ellipse cx="720" cy="424" rx="210" ry="248" fill="url(#stageGlow)"/>${guitar(644, 266, 1.02)}
    <g transform="translate(802 276)"><circle r="45" fill="#0d1721" fill-opacity=".72" stroke="#dbc49d" stroke-opacity=".48" stroke-width="2"/><circle r="34" fill="none" stroke="#dbc49d" stroke-opacity=".2"/><path d="M0 -25V0L18 12" fill="none" stroke="#eed8b4" stroke-opacity=".72" stroke-width="3" stroke-linecap="round"/><g class="anim spin" style="animation-duration:26s"><line x1="0" y1="0" x2="0" y2="-30" stroke="#eed8b4" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/></g><circle r="4" fill="#eed8b4"/></g></g>`
  if (kind === 'reach') return `<g transform="translate(594 310)">
    <ellipse cx="126" cy="140" rx="230" ry="180" fill="url(#lampGlow)" opacity=".7"/>
    <path d="M40 94H102L96 154Q72 172 48 154Z" fill="#b8a184" fill-opacity=".72" stroke="#eed8b7" stroke-opacity=".45" stroke-width="2"/>
    <path d="M102 106Q132 104 124 130Q118 144 98 140" fill="none" stroke="#d6bea0" stroke-opacity=".6" stroke-width="7"/>
    <path d="M158 94H220L214 154Q190 172 166 154Z" fill="#8d779e" fill-opacity=".76" stroke="#d6bce8" stroke-opacity=".45" stroke-width="2"/>
    <path d="M220 106Q250 104 242 130Q236 144 216 140" fill="none" stroke="#bfa4cf" stroke-opacity=".6" stroke-width="7"/>
    <g class="anim rise" style="animation-duration:8s"><path d="M58 72C46 58 68 50 56 34M82 72C70 58 92 50 80 34M176 72C164 58 186 50 174 34M200 72C188 58 210 50 198 34" fill="none" stroke="#e8ddd1" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/></g>
    <path d="M0 176H260" stroke="#c3ad93" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>
  </g>`
  if (kind === 'photo') return `<g transform="translate(636 330) scale(.84)">
    <g class="anim sway" style="animation-duration:12s"><g transform="rotate(-6 -18 20)">
      <rect x="-74" y="-90" width="112" height="140" rx="4" fill="#e7dcc8" opacity=".84" stroke="#f4ead7" stroke-opacity=".45"/>
      <rect x="-64" y="-80" width="92" height="98" fill="#283743"/>
      <path d="M-64 -36L-28 -74L-8 -52L18 -70L28 18H-64Z" fill="#3c5464" opacity=".85"/>
      <circle cx="8" cy="-58" r="9" fill="#b08a63" opacity=".7"/>
      <rect x="-74" y="30" width="112" height="20" fill="#f0e6d4" opacity=".7"/>
      <path d="M-52 14h62" stroke="#9a8a73" stroke-width="3" opacity=".4" stroke-linecap="round"/>
    </g></g>
    <g class="anim sway" style="animation-duration:14s;animation-delay:-5s"><g transform="translate(92 26) rotate(5 20 10)">
      <rect x="-64" y="-78" width="100" height="126" rx="4" fill="#ded2c0" opacity=".8"/>
      <rect x="-54" y="-68" width="80" height="86" fill="#3a2836"/>
      <path d="M-54 18V-16L-22 -46L2 -20L26 -44V18Z" fill="#5b4358" opacity=".88"/>
      <circle cx="14" cy="-42" r="8" fill="#d7b07b" opacity=".65"/>
      <path d="M20 -54L34 -62M26 -50L40 -58" stroke="#e7cfa8" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>
    </g></g>
    <path d="M-56 92Q36 128 132 92" fill="none" stroke="#d9c3a4" stroke-opacity=".32" stroke-width="2"/>
  </g>`
  if (kind === 'clock') return `<g transform="translate(720 238)">
    <g class="anim drift"><circle r="58" fill="#101923" fill-opacity=".8" stroke="#d9c19a" stroke-opacity=".42" stroke-width="2"/>
    <circle r="48" fill="none" stroke="#d9c19a" stroke-opacity=".14"/>
    <path d="M0 -42V-36M30 -30L26 -25M42 0H36M30 30L26 25M0 42V36M-30 30L-26 25M-42 0H-36M-30 -30L-26 -25" stroke="#e7d5b2" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>
    <path d="M0 0V-26M0 0L14 10" stroke="#f0dfbf" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/></g>
    <g class="anim spin" style="animation-duration:30s"><line x1="0" y1="0" x2="0" y2="-34" stroke="#e0a86e" stroke-opacity=".72" stroke-width="1.6" stroke-linecap="round"/></g>
    <circle r="3" fill="#f0dfbf"/>
  </g>`
  if (kind === 'sheet') return `<g transform="translate(648 300)">
    <g class="anim sway" style="animation-duration:10s"><g transform="rotate(-3)">
      <rect x="-96" y="-64" width="192" height="128" rx="4" fill="#eadfca" opacity=".9" stroke="#f5ecd9" stroke-opacity=".4"/>
      <path d="M-76 -40H76M-76 -26H76M-76 -12H76M-76 2H76M-76 16H76M-76 30H76" stroke="#8a7a64" stroke-opacity=".4" stroke-width="1.6"/>
      <path d="M-42 24V-30M-30 28V-26M16 20V-34M28 24V-30" stroke="#5a544e" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="-48" cy="26" rx="9" ry="6" fill="#5a544e" opacity=".55" transform="rotate(-16 -48 26)"/>
      <ellipse cx="-24" cy="30" rx="9" ry="6" fill="#5a544e" opacity=".55" transform="rotate(-16 -24 30)"/>
      <ellipse cx="10" cy="22" rx="9" ry="6" fill="#5a544e" opacity=".55" transform="rotate(-16 10 22)"/>
      <ellipse cx="34" cy="26" rx="9" ry="6" fill="#5a544e" opacity=".55" transform="rotate(-16 34 26)"/>
      <path d="M-74 46H6" stroke="#c99b70" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
    </g></g>
    <g transform="translate(84 58) rotate(24)"><rect x="0" y="0" width="8" height="76" rx="2" fill="#c8a06c"/><path d="M8 0L8 10L-2 6Z" fill="#f0dcc0"/></g>
  </g>`
  if (kind === 'voice') return `<g transform="translate(600 470)">
    <ellipse cx="120" cy="20" rx="190" ry="70" fill="url(#stageGlow)" opacity=".5" class="anim glow-drift"/>
    <g fill="#a9ddd6">${[16, 34, 58, 84, 104, 78, 54, 32, 42, 64, 40, 22].map((height, index) => `<rect class="anim pulse" x="${index * 19}" y="${-height}" width="8" height="${height}" rx="4" style="animation-duration:${(1.6 + (index % 4) * 0.36).toFixed(2)}s;animation-delay:-${(index * 0.27).toFixed(2)}s" opacity=".55"/>`).join('')}</g>
  </g>`
  if (kind === 'wave') return `<g transform="translate(720 366)">
    <circle class="anim ring" r="54" fill="none" stroke="#8ad7d6" stroke-opacity=".5" stroke-width="2" style="animation-duration:6.4s"/>
    <circle class="anim ring" r="54" fill="none" stroke="#8ad7d6" stroke-opacity=".5" stroke-width="2" style="animation-duration:6.4s;animation-delay:-2.1s"/>
    <circle class="anim ring" r="54" fill="none" stroke="#8ad7d6" stroke-opacity=".5" stroke-width="2" style="animation-duration:6.4s;animation-delay:-4.2s"/>
    <circle r="5" fill="#bde9e4" opacity=".6"/>
  </g>`
  return ''
}

function deskLamp() {
  return `<g class="anim glow-drift"><ellipse cx="490" cy="470" rx="176" ry="172" fill="url(#lampGlow)"/></g>
    <path d="M493 423L530 340M530 340L500 318" stroke="#5b5e60" stroke-width="8" stroke-linecap="round"/>
    <path d="M470 304Q501 286 529 315L511 348Q484 340 470 304Z" fill="#c59b63"/>
    <path d="M476 308Q499 297 520 316" stroke="#ffe0a4" stroke-opacity=".65" stroke-width="3"/>
    <ellipse cx="493" cy="428" rx="46" ry="9" fill="#6c6558"/><ellipse cx="493" cy="426" rx="34" ry="5" fill="#d3b785" opacity=".55"/>
    <path d="M481 348L405 523H581L514 348Z" fill="#f2bd78" opacity=".065"/>`
}

function wallScore() {
  return `<rect x="846" y="246" width="112" height="150" rx="3" fill="#171822" stroke="#76677f" stroke-opacity=".32"/><rect x="858" y="258" width="88" height="126" fill="#d6cdbc" opacity=".72"/>
    <path d="M870 278H930M870 291H930M870 304H930M870 317H930M870 330H930M870 343H930M870 356H930" stroke="#554f55" stroke-opacity=".65" stroke-width="2"/>
    <g fill="#4a4350" opacity=".8"><ellipse cx="885" cy="287" rx="5" ry="3"/><ellipse cx="915" cy="313" rx="5" ry="3"/><ellipse cx="891" cy="340" rx="5" ry="3"/><path d="M889 286V270M919 312V294M895 339V321" stroke="#4a4350" stroke-width="2"/></g>`
}

function leftRoom({ showLamp = true } = {}) {
  return `<g clip-path="url(#leftClip)">
    <rect x="102" y="164" width="532" height="502" fill="url(#leftRoom)"/>
    <ellipse cx="444" cy="440" rx="250" ry="240" fill="url(#lampGlow)" opacity=".38"/>
    <path d="M102 540L634 498V666H102Z" fill="url(#floor)"/>
    <path d="M102 550L634 508M102 603L634 552M210 666L328 520M420 666L448 514" stroke="#80909a" stroke-opacity=".06"/>
    <rect x="126" y="192" width="188" height="266" rx="3" fill="#080e16" stroke="#4b5d6b" stroke-opacity=".5"/>
    <rect x="132" y="198" width="176" height="254" fill="#0d1a28"/>
    <ellipse cx="202" cy="258" rx="142" ry="124" fill="#345574" opacity=".14"/>
    <path d="M120 410V332H151V366H178V294H211V350H242V270H270V324H310V462H120Z" fill="#080f19"/>
    <path d="M151 350H158V360H151ZM188 318H195V329H188ZM249 294H256V305H249ZM277 346H284V357H277ZM188 374H195V385H188ZM249 338H256V349H249Z" fill="#d5b878" opacity=".48"/>
    <rect x="132" y="198" width="176" height="254" fill="url(#glass)"/>
    <path d="M220 198V452M132 326H308" stroke="#334652" stroke-width="8"/>
    <path d="M220 198V452M132 326H308" stroke="#8295a1" stroke-opacity=".12" stroke-width="2"/>
    <rect x="344" y="236" width="218" height="10" rx="2" fill="#29343e"/>
    <path d="M360 202H374V236H360ZM378 196H396V236H378ZM400 207H412V236H400ZM417 190H439V236H417Z" fill="#58606a"/>
    <rect x="446" y="204" width="92" height="28" rx="2" fill="#1a252f" stroke="#83919a" stroke-opacity=".15"/>
    <path d="M458 211H522M458 218H506M458 225H516" stroke="#8b9ba3" stroke-opacity=".22" stroke-width="3"/>
    ${showLamp ? deskLamp() : ''}
    <path d="M138 560L590 532L632 566L110 602Z" fill="#463e35"/><path d="M110 602L632 566V584L110 622Z" fill="#24252a"/>
    <path d="M154 614L150 666M574 586L584 666" stroke="#1a1d23" stroke-width="17"/>
    <path d="M138 560L590 532" stroke="#b49670" stroke-opacity=".35" stroke-width="3"/>
    <rect x="247" y="408" width="190" height="132" rx="7" fill="#080d12" stroke="#4c5b64" stroke-width="3" transform="rotate(-3 342 474)"/>
    <rect x="259" y="420" width="166" height="106" rx="2" fill="#102633" transform="rotate(-3 342 474)"/>
    <g transform="rotate(-3 342 474)" stroke-linecap="round"><path d="M276 441H323M334 441H368M276 455H305M315 455H391M290 470H351M362 470H401M290 485H325M335 485H377M276 501H312M325 501H357" stroke="#75b6b6" stroke-opacity=".65" stroke-width="4"/><path d="M374 441H403M320 470H344M367 485H397" stroke="#d1aa72" stroke-opacity=".7" stroke-width="4"/></g>
    <path d="M222 548L452 535L480 551L206 568Z" fill="#293138"/><path d="M206 568L480 551V558L208 576Z" fill="#12181d"/>
    <rect x="158" y="526" width="66" height="12" rx="2" fill="#5f5142" transform="rotate(-3 191 532)"/><rect x="164" y="511" width="58" height="13" rx="2" fill="#344b56" transform="rotate(-3 193 518)"/>
    <path d="M534 506V541" stroke="#b28a55" stroke-width="4"/><path d="M526 505H542L539 524H529Z" fill="#d2c2a1" opacity=".75"/>
    <path d="M322 582Q350 566 382 578L398 650H306Z" fill="#11171e" opacity=".88"/>
  </g>`
}

function rightRoom({ showSheet = true, showGuitar = true } = {}) {
  return `<g clip-path="url(#rightClip)">
    <rect x="806" y="164" width="532" height="502" fill="url(#rightRoom)"/>
    <g class="anim glow-drift"><ellipse cx="1110" cy="348" rx="290" ry="268" fill="url(#musicGlow)"/></g>
    <g opacity=".32"><path d="M838 194H894V450H838ZM906 194H962V450H906ZM974 194H1030V450H974ZM1042 194H1098V450H1042ZM1110 194H1166V450H1110ZM1178 194H1234V450H1178ZM1246 194H1302V450H1246Z" fill="#40344f"/><path d="M850 194V450M918 194V450M986 194V450M1054 194V450M1122 194V450M1190 194V450M1258 194V450" stroke="#9a82aa" stroke-opacity=".18"/></g>
    <path d="M1080 156H1180L1300 666H884Z" fill="url(#musicSpot)"/>
    <ellipse cx="1115" cy="626" rx="218" ry="44" fill="#c5a0dc" opacity=".07" filter="url(#blur8)"/>
    <path d="M806 540L1338 504V666H806Z" fill="url(#floor)"/>
    <path d="M806 561L1338 523M806 614L1338 567M924 666L1008 524M1150 666L1160 516" stroke="#a392b1" stroke-opacity=".055"/>
    ${showSheet ? wallScore() : ''}
    <path d="M1100 356V602M1100 584L1048 630M1100 584L1150 630" stroke="#151720" stroke-width="8" stroke-linecap="round"/><path d="M1100 360V588M1100 584L1048 630M1100 584L1150 630" stroke="#85828d" stroke-opacity=".55" stroke-width="2"/>
    <path d="M1098 374L1162 344" stroke="#777482" stroke-width="5" stroke-linecap="round"/><rect x="1152" y="323" width="18" height="42" rx="9" fill="#171922" stroke="#a29baa" stroke-opacity=".65" transform="rotate(58 1161 344)"/>
    ${showGuitar ? guitar(900, 378) : ''}
    <g transform="translate(1142 500)"><path d="M0 22L154 12L174 40L-12 54Z" fill="#191b25" stroke="#6d6879" stroke-opacity=".5"/><path d="M8 25L147 17L154 32L2 42Z" fill="#d3d0ca" opacity=".82"/><path d="M24 24L25 40M42 23L43 39M60 22L61 38M78 21L79 37M96 20L97 36M114 19L115 35M132 18L133 34" stroke="#36333e" stroke-width="2"/><path d="M34 23L34 32M70 21L70 30M88 20L88 29M124 18L124 27" stroke="#171820" stroke-width="7"/><path d="M20 52L4 128M146 42L164 120" stroke="#252630" stroke-width="8"/></g>
    <rect x="806" y="164" width="532" height="502" fill="url(#glass)" opacity=".42"/>
  </g>`
}


const sceneDefs = `  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#120d0c"/><stop offset=".46" stop-color="#2b1c1c"/><stop offset="1" stop-color="#160f0e"/></linearGradient>
    <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e2a276" stop-opacity=".36"/><stop offset=".48" stop-color="#8b5e5e" stop-opacity=".15"/><stop offset="1" stop-color="#17110f" stop-opacity="0"/></linearGradient>
    <linearGradient id="warmWash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dca066" stop-opacity=".11"/><stop offset=".55" stop-color="#887480" stop-opacity=".045"/><stop offset="1" stop-color="#7495af" stop-opacity=".12"/></linearGradient>
    <linearGradient id="leftRoom" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#3b2c24"/><stop offset=".55" stop-color="#2a211d"/><stop offset="1" stop-color="#15100e"/></linearGradient>
    <linearGradient id="rightRoom" x1=".2" y1="0" x2=".8" y2="1"><stop stop-color="#273847"/><stop offset=".58" stop-color="#222d38"/><stop offset="1" stop-color="#151821"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#261c18"/><stop offset="1" stop-color="#0e0b0a"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d5b497" stop-opacity=".13"/><stop offset=".42" stop-color="#62483f" stop-opacity=".05"/><stop offset=".48" stop-color="#f4d7b6" stop-opacity=".13"/><stop offset="1" stop-color="#211512" stop-opacity=".03"/></linearGradient>
    <linearGradient id="spotlight" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe0b6" stop-opacity=".27"/><stop offset="1" stop-color="#d9a18b" stop-opacity="0"/></linearGradient>
    <linearGradient id="musicSpot" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c1d7e2" stop-opacity=".3"/><stop offset="1" stop-color="#7697b9" stop-opacity="0"/></linearGradient>
    <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#100b10" stop-opacity="0"/><stop offset=".48" stop-color="#100b10" stop-opacity=".47"/><stop offset="1" stop-color="#0a080d" stop-opacity=".91"/></linearGradient>
    <radialGradient id="lampGlow"><stop stop-color="#ffe0a8" stop-opacity=".78"/><stop offset=".26" stop-color="#f4bd78" stop-opacity=".3"/><stop offset="1" stop-color="#e6a053" stop-opacity="0"/></radialGradient>
    <radialGradient id="stageGlow"><stop stop-color="#ffd8bd" stop-opacity=".48"/><stop offset=".35" stop-color="#dda088" stop-opacity=".18"/><stop offset="1" stop-color="#aa6e63" stop-opacity="0"/></radialGradient>
    <radialGradient id="musicGlow"><stop stop-color="#abd5e9" stop-opacity=".53"/><stop offset=".4" stop-color="#7da7c5" stop-opacity=".24"/><stop offset="1" stop-color="#617c9d" stop-opacity="0"/></radialGradient>
    <radialGradient id="careerFocus"><stop stop-color="#d5e3df" stop-opacity=".27"/><stop offset=".44" stop-color="#a2c3cb" stop-opacity=".095"/><stop offset="1" stop-color="#8aa4b8" stop-opacity="0"/></radialGradient>
    <radialGradient id="vignette" cx=".5" cy=".43" r=".73"><stop offset=".39" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".63"/></radialGradient>
    <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="27" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .075"/></feComponentTransfer></filter>
    <clipPath id="leftClip"><rect x="102" y="164" width="532" height="502" rx="3"/></clipPath><clipPath id="rightClip"><rect x="806" y="164" width="532" height="502" rx="3"/></clipPath>
  </defs>`

function renderScene(name, config) {
  if (name === 'home') return renderStandaloneScene('home', '雨夜里，两扇亮着的窗由一根电话线连接。', homeBody(), { rain: 0.3, warm: true })
  if (name === 'incoming') return renderStandaloneScene('incoming', '两台电话在两个世界里同时响起。', incomingBody(), { rain: 0.34, cool: true })
  const left = config.left ?? 1
  const right = config.right ?? 1
  const dawn = config.dawn ? `<rect width="1440" height="900" fill="url(#dawn)"/><path d="M0 248C280 210 480 268 720 226C970 182 1160 244 1440 196V0H0Z" fill="#e5a18a" opacity=".07"/><ellipse cx="720" cy="210" rx="380" ry="100" fill="#efb493" opacity=".1" filter="url(#blur24)"/>` : ''
  const focusShade = config.focus === 'left'
    ? '<rect x="704" y="112" width="736" height="642" fill="#02050b" opacity=".32"/>'
    : config.focus === 'right'
      ? '<rect y="112" width="704" height="642" fill="#02050b" opacity=".34"/>'
      : ''
  const tint = config.cool
    ? '<rect width="1440" height="900" fill="#52758e" opacity=".06"/>'
    : config.warm
      ? '<rect width="1440" height="900" fill="#9b6946" opacity=".09"/>'
      : ''
  const motifLift = config.motif === 'music' || config.motif === 'reality' ? uiLift : 0
  const motifHasScore = config.motif === 'sheet' || config.motif === 'music'
  const motifHasGuitar = config.motif === 'guitar' || config.motif === 'space'
  const motifHasLamp = config.motif === 'lamp'
  const split = config.split ? '<path d="M720 112V754" stroke="#b2d9d7" stroke-opacity=".1" stroke-width="2" stroke-dasharray="2 14"/>' : ''
  const camera = config.camera ? cameraTransform(config.camera, config.zoom ?? 1.15) : ''
  const roomLift = config.career ? uiLift + 24 : uiLift
  const rightDividerX = config.career ? 1296 : 1072
  const rightDividerY = config.career ? 563 : 328
  const mullions = `M368 158V672M98 328H640M${rightDividerX} 158V672M802 ${rightDividerY}H1344`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="title desc">
  <title id="title">Elsewhere 雨夜双城 · ${name}</title><desc id="desc">工程书桌与音乐排练室在雨夜中由来电信号连接。</desc>
  ${motionStyle}
${sceneDefs}
  <rect width="1440" height="900" fill="url(#night)"/>
  <ellipse cx="360" cy="340" rx="460" ry="370" fill="#b47b58" opacity=".12"/><ellipse cx="1100" cy="330" rx="440" ry="360" fill="#688eac" opacity=".1"/>
${dawn}
  <g transform="translate(0 -${roomLift}) ${camera}">
  <path d="M0 112H1440V754H0Z" fill="#080d15" opacity=".9"/><path d="M0 112H1440M0 754H1440" stroke="#6d8296" stroke-opacity=".14"/>
  <g filter="url(#shadow)"><rect x="72" y="134" width="592" height="562" rx="8" fill="#05090f" stroke="#344250" stroke-opacity=".55"/><rect x="92" y="154" width="552" height="522" rx="4" fill="#111923" stroke="#637484" stroke-opacity=".18"/><rect x="776" y="134" width="592" height="562" rx="8" fill="#05090f" stroke="#454057" stroke-opacity=".58"/><rect x="796" y="154" width="552" height="522" rx="4" fill="#171522" stroke="#756887" stroke-opacity=".18"/></g>
  <g opacity="${left}">${leftRoom({ showLamp: !motifHasLamp })}</g><g opacity="${right}">${config.career ? careerRoom(config.career, config.careerVariant ?? 0) : rightRoom({ showSheet: !motifHasScore, showGuitar: !motifHasGuitar })}</g>
  <rect x="102" y="164" width="532" height="502" fill="url(#glass)" opacity=".32"/>
  <path d="${mullions}" stroke="#080d14" stroke-width="15"/><path d="${mullions}" stroke="#607080" stroke-opacity=".12" stroke-width="2"/>
  <rect x="102" y="164" width="532" height="502" rx="3" fill="none" stroke="#9aabba" stroke-opacity=".12"/><rect x="806" y="164" width="532" height="502" rx="3" fill="none" stroke="#aa9bb8" stroke-opacity=".12"/>
  </g>
  ${rainLines(150, config.rain ?? 0.2, 27)}
  ${dustMotes(22, 61)}
${`  <g transform="translate(0 -${uiLift}) ${camera}">${focusShade}${split}${phone(config.phone ?? 0)}<g transform="translate(0 ${motifLift})">${motif(config.motif)}</g></g>${tint}`.trimEnd()}
  <rect width="1440" height="900" fill="url(#warmWash)"/>
  <rect y="563" width="1440" height="337" fill="url(#bottomShade)"/><rect width="1440" height="900" fill="url(#vignette)"/><rect width="1440" height="900" filter="url(#grain)" opacity=".38"/>
</svg>
`
}


function phoneGlyph(x, y, scale = 1, accent = '#8ad7d6') {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <circle r="30" fill="#0b1821" stroke="${accent}" stroke-opacity=".5" stroke-width="1.5"/>
    <path d="M-12 -9L-4 1L-10 7C-6 13 -2 17 4 19L8 13L18 19L16 26C15 29 12 30 9 29C-6 25 -16 15 -20 0C-21 -4 -19 -7 -16 -8Z" fill="none" stroke="#c7eeea" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 -18C32 -15 37 -9 39 -1" fill="none" stroke="${accent}" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
    <path d="M27 -27C40 -23 48 -13 51 0" fill="none" stroke="${accent}" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
  </g>`
}

function landlinePhone(x, y, accent = '#8ad7d6') {
  return `<g transform="translate(${x} ${y})">
    <ellipse cx="115" cy="176" rx="122" ry="16" fill="#070b0d" opacity=".55"/>
    <path d="M14 100H220L238 164H-6Z" fill="#303a3e" stroke="#aab6b7" stroke-opacity=".55" stroke-width="2"/>
    <rect x="26" y="70" width="182" height="36" rx="18" fill="#4a575b" stroke="#d0d8d8" stroke-opacity=".4" stroke-width="2"/>
    <path fill="none" d="M40 82H190" stroke="#d8dfdf" stroke-opacity=".18" stroke-width="2"/>
    <circle cx="42" cy="88" r="11" fill="#1a2226" stroke="#b4c1c2" stroke-opacity=".55"/>
    <circle cx="192" cy="88" r="11" fill="#1a2226" stroke="#b4c1c2" stroke-opacity=".55"/>
    <circle cx="115" cy="132" r="30" fill="#1a2226" stroke="#8d9da0" stroke-opacity=".7" stroke-width="2"/>
    <circle cx="115" cy="132" r="7" fill="#0a1114" stroke="#b1c0c2" stroke-opacity=".55"/>
    <path fill="none" d="M88 120H142M78 146H98M132 146H152M88 158H98M132 158H152" stroke="#b1c0c2" stroke-opacity=".3" stroke-width="2"/>
    <path fill="none" d="M220 128C270 146 252 196 212 202" stroke="#a4b2b4" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
    <circle class="anim blink" cx="230" cy="112" r="4" fill="${accent}" opacity=".85"/>
    <circle class="anim ring" cx="115" cy="88" r="42" fill="none" stroke="${accent}" stroke-opacity=".24" stroke-width="2"/>
    <circle class="anim ring" cx="115" cy="88" r="50" fill="none" stroke="${accent}" stroke-opacity=".14" stroke-width="2" style="animation-delay:-2.2s"/>
    <circle class="anim ring" cx="115" cy="88" r="62" fill="none" stroke="${accent}" stroke-opacity=".08" stroke-width="2" style="animation-delay:-4.4s"/>
  </g>`
}

function renderStandaloneScene(name, description, body, { rain = 0.3, cool = false, warm = true } = {}) {
  const tint = cool
    ? '<rect width="1440" height="900" fill="#52758e" opacity=".06"/>'
    : warm
      ? '<rect width="1440" height="900" fill="#9b6946" opacity=".09"/>'
      : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="title desc">
  <title id="title">Elsewhere 雨夜双城 · ${name}</title><desc id="desc">${description}</desc>
  ${motionStyle}
  ${sceneDefs}
  <rect width="1440" height="900" fill="url(#night)"/>
  <ellipse cx="360" cy="340" rx="460" ry="370" fill="#b47b58" opacity=".12"/><ellipse cx="1100" cy="330" rx="440" ry="360" fill="#688eac" opacity=".1"/>
  ${body}
  ${rainLines(150, rain, 31)}
  ${dustMotes(22, 67)}
  ${tint}
  <rect width="1440" height="900" fill="url(#warmWash)"/>
  <rect y="606" width="1440" height="294" fill="url(#bottomShade)"/><rect width="1440" height="900" fill="url(#vignette)"/><rect width="1440" height="900" filter="url(#grain)" opacity=".38"/>
</svg>
`
}

function homeBody() {
  return `<rect y="112" width="1440" height="642" fill="#191314"/>
  <path d="M0 556H1440M0 630H1440" stroke="#3a2a24" stroke-opacity=".32" stroke-width="2"/>
  <g stroke="#8a6b58" stroke-opacity=".08"><path d="M0 280H1440M0 410H1440M0 520H1440"/></g>
  <g transform="translate(150 176)">
    <rect width="430" height="386" rx="12" fill="#060b10" stroke="#49545b" stroke-width="10"/>
    <rect x="12" y="12" width="406" height="362" rx="6" fill="#39281e"/>
    <ellipse cx="210" cy="210" rx="190" ry="170" fill="url(#lampGlow)" opacity=".57"/>
    <path d="M40 92H340" stroke="#6d5945" stroke-width="4"/>
    <path d="M50 70H70V92H50ZM78 58H96V92H78ZM104 66H120V92H104Z" fill="#5f4b3b" opacity=".8"/>
    <path d="M22 300H390L374 320H36Z" fill="#46362b" stroke="#8f7459" stroke-opacity=".5"/>
    <path fill="none" d="M48 320V374M354 320V374" stroke="#211c18" stroke-width="7"/>
    <rect x="54" y="210" width="142" height="90" rx="4" fill="#0b151b" stroke="#586a72" stroke-opacity=".5"/>
    <path fill="none" d="M66 228H182M66 244H182M66 260H156" stroke="#7fb9b8" stroke-opacity=".36" stroke-width="3"/>
    <path fill="none" d="M125 300V280" stroke="#586a72" stroke-opacity=".5" stroke-width="4"/>
    <path fill="none" d="M300 160V300M284 300H316" stroke="#b08a5e" stroke-opacity=".55" stroke-width="4"/>
    <ellipse cx="300" cy="288" rx="48" ry="14" fill="url(#lampGlow)" opacity=".5"/>
    <path fill="none" d="M215 12V374M12 194H418" stroke="#070b0d" stroke-width="12"/>
    <rect x="12" y="12" width="406" height="362" fill="url(#glass)" opacity=".18"/>
  </g>
  <g transform="translate(860 176)">
    <rect width="430" height="386" rx="12" fill="#060b10" stroke="#49545b" stroke-width="10"/>
    <rect x="12" y="12" width="406" height="362" rx="6" fill="#213444"/>
    <ellipse cx="210" cy="210" rx="190" ry="170" fill="url(#musicGlow)" opacity=".68"/>
    <rect x="36" y="270" width="100" height="84" rx="4" fill="#171b20" stroke="#7d7b86" stroke-opacity=".4"/>
    <path fill="none" d="M46 286H126M46 300H126M46 314H126" stroke="#a7a0ad" stroke-opacity=".22" stroke-width="2"/>
    ${guitar(150, 96, 0.72)}
    <path fill="none" d="M330 270V370M300 370H360M330 270L300 248M330 270L360 246" stroke="#9c8d99" stroke-opacity=".45" stroke-width="3"/>
    <rect x="294" y="104" width="76" height="88" fill="#d8ccb8" opacity=".5" transform="rotate(4 332 148)"/>
    <path fill="none" d="M306 124H354M306 140H354M306 156H336" stroke="#70685c" stroke-opacity=".4" stroke-width="2" transform="rotate(4 332 148)"/>
    <path fill="none" d="M215 12V374M12 194H418" stroke="#070b0d" stroke-width="12"/>
    <rect x="12" y="12" width="406" height="362" fill="url(#glass)" opacity=".18"/>
  </g>
  <path d="M132 566H598V580H132Z" fill="#2b1e18" stroke="#6f5745" stroke-opacity=".24"/>
  <path d="M842 566H1308V580H842Z" fill="#2b1e18" stroke="#6f5745" stroke-opacity=".24"/>
  <path d="M580 530C650 590 790 590 860 530" fill="none" stroke="#b18b62" stroke-opacity=".5" stroke-width="4"/>
  <path class="anim signal-flow" d="M580 530C650 590 790 590 860 530" fill="none" stroke="#8ad7d6" stroke-opacity=".65" stroke-width="2" stroke-dasharray="2 10"/>
  ${phoneGlyph(720, 528, 0.78)}`
}

function incomingBody() {
  return `<rect y="112" width="1440" height="642" fill="#141014"/>
  <g transform="translate(96 150)">
    <rect width="1248" height="420" rx="8" fill="#070d12" stroke="#4a5459" stroke-width="10"/>
    <rect x="12" y="12" width="1224" height="396" fill="#0d1a24"/>
    <ellipse cx="310" cy="210" rx="285" ry="195" fill="url(#lampGlow)" opacity=".42"/>
    <ellipse cx="936" cy="210" rx="285" ry="195" fill="url(#musicGlow)" opacity=".54"/>
    <g fill="#d9b178" opacity=".34">
      <rect x="118" y="250" width="10" height="12"/><rect x="146" y="226" width="8" height="10"/><rect x="210" y="270" width="7" height="9"/>
      <rect x="276" y="238" width="9" height="11"/><rect x="356" y="260" width="8" height="8"/><rect x="900" y="236" width="9" height="11"/>
      <rect x="960" y="262" width="8" height="9"/><rect x="1040" y="230" width="10" height="12"/><rect x="1118" y="268" width="7" height="8"/>
    </g>
    <g fill="#9fd8d8" opacity=".18">
      <rect x="172" y="320" width="8" height="72"/><rect x="194" y="340" width="6" height="52"/><rect x="236" y="300" width="10" height="92"/>
      <rect x="1018" y="310" width="8" height="82"/><rect x="1052" y="334" width="6" height="58"/><rect x="1090" y="296" width="10" height="96"/>
    </g>
    <path fill="none" d="M624 12V408M12 210H1236" stroke="#070b0d" stroke-width="14"/>
    <path fill="none" d="M624 12V408M12 210H1236" stroke="#71868e" stroke-opacity=".12" stroke-width="2"/>
    <rect x="12" y="12" width="1224" height="396" fill="url(#glass)" opacity=".16"/>
  </g>
  <path d="M0 560H1440V900H0Z" fill="#1a1311"/>
  <path fill="none" d="M0 560H1440" stroke="#6b5644" stroke-opacity=".4" stroke-width="3"/>
  ${landlinePhone(170, 420, '#d9b178')}
  ${landlinePhone(1000, 420, '#8ad7d6')}
  <path class="anim signal-flow" d="M410 520H1000" fill="none" stroke="#8ad7d6" stroke-opacity=".5" stroke-width="2" stroke-dasharray="2 12"/>
  <g transform="translate(720 525)">
    <circle class="anim ring" r="44" fill="none" stroke="#8ad7d6" stroke-opacity=".28" stroke-width="2"/>
    <circle class="anim ring" r="58" fill="none" stroke="#8ad7d6" stroke-opacity=".16" stroke-width="2" style="animation-delay:-2.2s"/>
    <circle class="anim ring" r="72" fill="none" stroke="#8ad7d6" stroke-opacity=".1" stroke-width="2" style="animation-delay:-4.4s"/>
    ${phoneGlyph(0, 0, 0.75)}
  </g>`
}

await mkdir(outputDirectory, { recursive: true })
for (const [name, config] of Object.entries(scenes)) {
  const svg = renderScene(name, config).replace(/[ \t]+$/gm, '')
  await writeFile(new URL(`${name}.svg`, outputDirectory), svg)
}
console.log(`Generated ${Object.keys(scenes).length} local SVG backgrounds.`)
