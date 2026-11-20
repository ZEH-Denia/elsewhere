import { mkdir, writeFile } from 'node:fs/promises'

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
  return `<g class="anim rain-drift" stroke="#c5d8e5" stroke-linecap="round" opacity="${opacity}">${lines}</g>`
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
  return `<g fill="${tone}" opacity=".55">${motes}</g>`
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
  @keyframes ring { 0% { transform: scale(.5); opacity: .55; } 68% { opacity: .14; } 100% { transform: scale(2.4); opacity: 0; } }
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
    <ellipse cx="444" cy="440" rx="250" ry="240" fill="url(#lampGlow)" opacity=".26"/>
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
    <g class="anim glow-drift"><ellipse cx="1110" cy="348" rx="290" ry="268" fill="url(#stageGlow)"/></g>
    <g opacity=".32"><path d="M838 194H894V450H838ZM906 194H962V450H906ZM974 194H1030V450H974ZM1042 194H1098V450H1042ZM1110 194H1166V450H1110ZM1178 194H1234V450H1178ZM1246 194H1302V450H1246Z" fill="#40344f"/><path d="M850 194V450M918 194V450M986 194V450M1054 194V450M1122 194V450M1190 194V450M1258 194V450" stroke="#9a82aa" stroke-opacity=".18"/></g>
    <path d="M1080 156H1180L1300 666H884Z" fill="url(#spotlight)"/>
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


function careerVariantProps(kind, variant) {
  if (kind === 'doctor' && variant === 1) return `
    <rect x="846" y="208" width="286" height="152" rx="4" fill="#0e1d26" stroke="#5b7280" stroke-opacity=".4"/>
    <path d="M868 232H1108M868 256H1108M868 280H1060M868 304H1092M868 328H1008" stroke="#9db4bd" stroke-opacity=".12" stroke-width="2"/>
    <rect x="1146" y="238" width="152" height="118" rx="7" fill="#14232b" stroke="#7d8990" stroke-opacity=".32"/>
    <path d="M1160 256H1280M1160 272H1258M1160 288H1274M1160 304H1242" stroke="#d2b07d" stroke-opacity=".3" stroke-width="4"/>
    <circle cx="1172" cy="330" r="5" fill="#d79a9a" opacity=".55"/><circle cx="1188" cy="330" r="5" fill="#8fc8c8" opacity=".55"/>
    <g transform="translate(866 478)">
      <path d="M0 0H322L306 22H16Z" fill="#343135" stroke="#9a846d" stroke-opacity=".3"/>
      <path d="M24 22V104M296 22V104" stroke="#1b1e22" stroke-width="9"/>
      <rect x="48" y="4" width="74" height="48" rx="4" fill="#c9d8d9" opacity=".5"/>
      <path d="M58 16H112M58 28H102" stroke="#6d7a7c" stroke-opacity=".4" stroke-width="2"/>
      <rect x="206" y="8" width="54" height="42" rx="4" fill="#d9d3c4" opacity=".5"/>
      <path d="M216 20H252M216 30H244" stroke="#777164" stroke-opacity=".38" stroke-width="2"/>
    </g>
    <g transform="translate(1140 480)">
      <path d="M28 8A24 24 0 1 1 27 9" fill="none" stroke="#b7c6c8" stroke-opacity=".5" stroke-width="3"/>
      <path d="M6 26H50M10 26V48M46 26V48" stroke="#8fa2a7" stroke-width="3"/>
      <circle cx="12" cy="52" r="7" fill="#1a2228" stroke="#82959a"/><circle cx="44" cy="52" r="7" fill="#1a2228" stroke="#82959a"/>
    </g>`
  if (kind === 'doctor' && variant === 2) return `
    <g transform="translate(840 224)">
      <rect x="0" y="0" width="118" height="252" rx="4" fill="#15242c" stroke="#61727a" stroke-opacity=".35"/>
      <path d="M0 48H118M0 96H118M0 144H118M0 192H118" stroke="#88a0a8" stroke-opacity=".14"/>
      <circle cx="100" cy="24" r="3" fill="#e0be8e" opacity=".7"/><circle cx="100" cy="72" r="3" fill="#e0be8e" opacity=".7"/>
    </g>
    <g transform="translate(1000 330)">
      <rect width="86" height="166" rx="5" fill="#15252e" stroke="#5d7682" stroke-opacity=".4"/>
      <rect x="8" y="12" width="70" height="60" fill="#0b171d"/>
      <rect x="8" y="82" width="70" height="70" fill="#0a1419"/>
      <path d="M18 96H68M18 112H68M18 128H48" stroke="#8fc8c8" stroke-opacity=".24" stroke-width="2"/>
      <circle cx="24" cy="136" r="5" fill="#d9b178" opacity=".8"/>
    </g>
    <g transform="translate(878 508)">
      <path d="M0 0H260L248 18H12Z" fill="#c9c0ad" opacity=".28" stroke="#a89578" stroke-opacity=".4"/>
      <path d="M22 18V72M238 18V72" stroke="#191c20" stroke-width="8"/>
      <path d="M52 2C48 -18 78 -26 92 -10C104 -22 124 -8 116 8Z" fill="#d9e4e3" opacity=".35"/>
      <path d="M34 10C28 -12 58 -22 70 -6C82 -18 102 -4 94 12Z" fill="#c7d8d9" opacity=".3"/>
      <circle cx="44" cy="42" r="4" fill="#d0ae7a" opacity=".65"/><circle cx="210" cy="36" r="4" fill="#8fc8c8" opacity=".5"/>
    </g>
    <rect x="1116" y="212" width="174" height="174" rx="3" fill="#0d1820" stroke="#5e6c75" stroke-opacity=".4"/>
    <path d="M1136 232H1272M1136 258H1272M1136 284H1272M1136 310H1272M1136 336H1272M1136 362H1272" stroke="#a2b4bb" stroke-opacity=".08"/>
    <path d="M1116 322H1290M1203 212V386" stroke="#3e515b" stroke-width="8"/>`
  if (kind === 'doctor' && variant === 3) return `
    <rect x="842" y="208" width="306" height="222" rx="3" fill="#0b1720" stroke="#50636e" stroke-opacity=".45"/>
    <path d="M842 314H1148M994 208V430" stroke="#3b4d58" stroke-width="8"/>
    <path d="M860 240H980M860 264H980M860 288H940M1010 240H1128M1010 264H1128" stroke="#8fb4c0" stroke-opacity=".12" stroke-width="3"/>
    <g class="anim glow-drift"><ellipse cx="1200" cy="344" rx="150" ry="150" fill="url(#stageGlow)" opacity=".55"/></g>
    <g transform="translate(1180 204)">
      <rect width="142" height="42" rx="5" fill="#3a2024" stroke="#a86c6c" stroke-opacity=".45"/>
      <path d="M24 20H118" stroke="#d79a9a" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g transform="translate(1166 468)">
      <path d="M0 22L176 10L190 36L-12 50Z" fill="#131b23" stroke="#6f7e8a" stroke-opacity=".4"/>
      <path d="M10 24H170L176 34H4Z" fill="#9bb3ba" opacity=".25"/>
      <path d="M34 40V76M154 32V68" stroke="#7d8d96" stroke-width="4"/>
      <circle cx="32" cy="80" r="6" fill="#1a2228" stroke="#8ba0a8"/><circle cx="156" cy="72" r="6" fill="#1a2228" stroke="#8ba0a8"/>
    </g>
    <path d="M1120 430H1320" stroke="#6c818c" stroke-opacity=".3" stroke-width="3"/>`
  if (kind === 'teacher' && variant === 1) return `
    <rect x="958" y="204" width="294" height="226" rx="3" fill="#0c1720" stroke="#63747d" stroke-opacity=".42"/>
    <path d="M978 236H1232M978 270H1232M978 304H1232M978 338H1232M978 372H1150" stroke="#a4b9c1" stroke-opacity=".1"/>
    <path d="M958 306H1252M1104 204V430" stroke="#3d505a" stroke-width="8"/>
    <path d="M960 210Q1000 260 960 360M1250 210Q1210 280 1250 390" fill="none" stroke="#d8cbb4" stroke-opacity=".18" stroke-width="8"/>
    <g transform="translate(852 500)">
      <path d="M0 0H300L286 20H14Z" fill="#3a3028" stroke="#9c8063" stroke-opacity=".3"/>
      <path d="M24 20V104M274 20V104" stroke="#1b1d21" stroke-width="9"/>
      <rect x="34" y="2" width="80" height="42" rx="3" fill="#e0d6c3" opacity=".66" transform="rotate(-3 74 23)"/>
      <rect x="160" y="4" width="92" height="40" rx="3" fill="#d5c7b4" opacity=".52" transform="rotate(2 206 24)"/>
      <path d="M50 14H96M50 24H88M176 16H232M176 26H216" stroke="#766b5a" stroke-opacity=".45" stroke-width="2"/>
    </g>
    <g transform="translate(888 552)"><path d="M0 0H84L94 44H-10Z" fill="#171a1d"/><path d="M10 6H74L80 28H4Z" fill="#bfb29d" opacity=".35"/></g>`
  if (kind === 'teacher' && variant === 2) return `
    <g transform="translate(848 218)">
      <rect width="152" height="238" rx="4" fill="#1b2524" stroke="#6b776d" stroke-opacity=".4"/>
      <path d="M0 58H152M0 116H152M0 174H152" stroke="#97a092" stroke-opacity=".14"/>
      <rect x="66" y="142" width="84" height="88" rx="2" fill="#0d1718"/>
      <path d="M80 158H134M80 172H134M80 186H118" stroke="#d2c7ae" stroke-opacity=".28" stroke-width="2"/>
    </g>
    <path d="M1034 212H1322M1034 246H1322M1034 280H1270M1034 314H1300" stroke="#8f8272" stroke-opacity=".18" stroke-width="3"/>
    <rect x="1120" y="342" width="178" height="112" rx="4" fill="#e0d3bd" opacity=".22" stroke="#c8b89e" stroke-opacity=".35"/>
    <g transform="translate(870 480)">
      <path d="M0 0H360L344 22H16Z" fill="#3d3027" stroke="#a08365" stroke-opacity=".3"/>
      <path d="M24 22V112M320 22V112" stroke="#1b1d20" stroke-width="9"/>
      <rect x="36" y="2" width="92" height="56" rx="4" fill="#d8cdbb" opacity=".65"/>
      <rect x="146" y="6" width="84" height="50" rx="4" fill="#c9bda9" opacity=".52"/>
      <path d="M52 16H116M52 30H104M162 18H214M162 32H200" stroke="#74695a" stroke-opacity=".4" stroke-width="2"/>
      <g transform="translate(256 4)"><rect width="52" height="48" rx="3" fill="#d9c9ad" opacity=".52"/><path d="M10 14H42M10 26H36" stroke="#7b6e59" stroke-opacity=".4" stroke-width="2"/></g>
    </g>
    <g transform="translate(846 554)"><path d="M0 0H112L102 18H10Z" fill="#25201d"/><path d="M14 18V64M96 18V64" stroke="#1b1a1a" stroke-width="7"/></g>`
  if (kind === 'teacher' && variant === 3) return `
    <rect x="846" y="206" width="220" height="250" rx="4" fill="#1c2c28" stroke="#68766b" stroke-opacity=".35"/>
    <path d="M846 288H1066M926 206V456" stroke="#4a5a52" stroke-width="7"/>
    <path d="M876 228H1038M876 252H1038M876 276H1000M876 316H1038M876 340H1020" stroke="#e9e1cb" stroke-opacity=".1" stroke-width="2"/>
    <g transform="translate(1094 258)">
      <rect width="112" height="190" rx="5" fill="#202827" stroke="#6e786c" stroke-opacity=".4"/>
      <rect x="12" y="16" width="88" height="80" rx="2" fill="#d8ccb6" opacity=".62"/>
      <path d="M22 28H90M22 40H90M22 52H74M22 64H86" stroke="#776b59" stroke-opacity=".45" stroke-width="2"/>
      <circle cx="88" cy="84" r="4" fill="#b58b62" opacity=".7"/>
    </g>
    <g transform="translate(1108 500)">
      <path d="M0 0H160L148 20H12Z" fill="#35312e" stroke="#9c8063" stroke-opacity=".3"/>
      <path d="M24 20V96M136 20V96" stroke="#1c1e21" stroke-width="8"/>
      <path d="M52 2H88V38H52Z" fill="#3d4944"/><path d="M62 12H78M62 22H78" stroke="#d7c6aa" stroke-opacity=".35" stroke-width="2"/>
      <rect x="104" y="4" width="32" height="30" rx="3" fill="#c9bda8" opacity=".4"/>
    </g>
    <path d="M846 458H1320" stroke="#8d7b62" stroke-opacity=".25" stroke-width="3"/>
    <g transform="translate(862 550)"><path d="M0 0H54L62 38H-8Z" fill="#2d3031"/><path d="M10 6H44L48 26H6Z" fill="#afa38f" opacity=".35"/></g>`
  if (kind === 'designer' && variant === 1) return `
    <rect x="844" y="206" width="282" height="238" rx="4" fill="#1e2027" stroke="#77727c" stroke-opacity=".35"/>
    <path d="M866 230H1104M866 288H1104M866 346H1040" stroke="#c8c1b3" stroke-opacity=".12" stroke-width="2"/>
    <g transform="translate(870 244) rotate(-3)"><rect width="72" height="54" fill="#ddd2c1" opacity=".55"/><path d="M10 12H62M10 24H62M10 36H44" stroke="#6e695f" stroke-opacity=".4" stroke-width="2"/></g>
    <g transform="translate(952 250) rotate(2)"><rect width="66" height="50" fill="#c9d2d0" opacity=".45"/><path d="M8 12H58M8 24H58M8 36H38" stroke="#5f6b69" stroke-opacity=".35" stroke-width="2"/></g>
    <g transform="translate(1028 238) rotate(-1)"><rect width="58" height="68" fill="#d8c5c5" opacity=".38"/><path d="M10 14H48M10 26H48M10 38H34" stroke="#77646a" stroke-opacity=".35" stroke-width="2"/></g>
    <g transform="translate(1180 244)">
      <rect width="128" height="210" rx="3" fill="#141b22" stroke="#667077" stroke-opacity=".35"/>
      <path d="M16 24H112M16 48H112M16 72H112M16 96H94M16 120H112M16 144H104" stroke="#d4c7b3" stroke-opacity=".16" stroke-width="2"/>
      <rect x="16" y="164" width="28" height="28" fill="#c59072" opacity=".5"/><rect x="50" y="164" width="28" height="28" fill="#8fc8c8" opacity=".4"/><rect x="84" y="164" width="28" height="28" fill="#b7a3c8" opacity=".4"/>
    </g>
    <path d="M842 478H1322L1300 498H858Z" fill="#2d2826" stroke="#9a7e64" stroke-opacity=".25"/>
    <path d="M878 498V604M1278 498V604" stroke="#1a1b1e" stroke-width="11"/>
    <path d="M1000 470V602M1080 470V602" stroke="#14161a" stroke-width="7"/>`
  if (kind === 'designer' && variant === 2) return `
    <rect x="850" y="204" width="250" height="226" rx="3" fill="#0b1620" stroke="#596a75" stroke-opacity=".4"/>
    <path d="M850 306H1100M978 204V430" stroke="#3e515b" stroke-width="8"/>
    <path d="M872 232H1078M872 260H1078M872 288H1030M872 344H1078M872 372H1040" stroke="#a6b8c0" stroke-opacity=".1" stroke-width="3"/>
    <g class="anim glow-drift"><ellipse cx="1190" cy="330" rx="160" ry="160" fill="url(#stageGlow)" opacity=".5"/></g>
    <g transform="translate(1120 456)">
      <path d="M0 0H184L168 24H16Z" fill="#2b2726" stroke="#9a7e64" stroke-opacity=".25"/>
      <path d="M26 24V94M158 24V94" stroke="#191b1e" stroke-width="9"/>
      <rect x="36" y="4" width="46" height="34" rx="3" fill="#d6c6b0" opacity=".48" transform="rotate(-4 59 21)"/>
      <rect x="96" y="2" width="42" height="38" rx="3" fill="#c3d0ce" opacity=".38" transform="rotate(3 117 21)"/>
      <path d="M42 14H76M42 24H70M102 12H130M102 22H118" stroke="#6b675d" stroke-opacity=".4" stroke-width="2"/>
    </g>
    <g transform="translate(1180 500)">
      <ellipse cx="26" cy="32" rx="24" ry="5" fill="#0f1114"/>
      <path d="M6 30C0 18 14 8 26 12C40 8 52 22 46 32Z" fill="#435a4c" stroke="#9aab9b" stroke-opacity=".28"/>
      <path d="M26 12V0M20 8C14 -4 8 2 8 2M32 8C38 -6 44 0 44 0" stroke="#7e9b84" stroke-width="2" stroke-linecap="round"/>
    </g>
    <rect x="1116" y="204" width="154" height="210" rx="3" fill="#0c171d" stroke="#5c6a71" stroke-opacity=".3"/>
    <path d="M1116 306H1270M1193 204V414" stroke="#3c4d56" stroke-width="7"/>`
  if (kind === 'designer' && variant === 3) return `
    <rect x="842" y="206" width="304" height="176" rx="4" fill="#202229" stroke="#7c7680" stroke-opacity=".3"/>
    <path d="M866 230H1122M866 274H1122M866 318H1044" stroke="#d7cec0" stroke-opacity=".14" stroke-width="2"/>
    <g transform="translate(860 484)">
      <path d="M0 0H480L456 24H20Z" fill="#332b28" stroke="#a18163" stroke-opacity=".3"/>
      <path d="M28 24V118M436 24V118" stroke="#1a1c1f" stroke-width="11"/>
      <g transform="translate(52 2) rotate(-4)">
        <rect width="216" height="150" rx="5" fill="#e3d7c4" opacity=".72"/>
        <path d="M18 26H198M18 50H198M18 74H164" stroke="#8a7c68" stroke-opacity=".45" stroke-width="2"/>
        <path d="M28 112C56 82 84 124 112 94C138 70 162 112 188 86" fill="none" stroke="#9b6f5d" stroke-opacity=".4" stroke-width="3"/>
      </g>
      <g transform="translate(292 20)"><rect width="14" height="120" fill="#c59b6b" transform="rotate(8 7 60)"/><path d="M4 118L0 140L10 136Z" fill="#e6c69b"/></g>
      <g transform="translate(330 34)"><rect width="12" height="108" fill="#8f6b58" transform="rotate(-6 6 54)"/><path d="M2 106L0 126L9 122Z" fill="#d7b28a"/></g>
      <g transform="translate(374 20)"><rect width="20" height="20" fill="#c59072" opacity=".6"/><rect x="28" width="20" height="20" fill="#8fc8c8" opacity=".5"/><rect x="56" width="20" height="20" fill="#b7a3c8" opacity=".5"/></g>
      <g transform="translate(338 70)"><rect width="56" height="28" rx="3" fill="#cdbfa9" opacity=".5"/><path d="M8 9H48M8 19H38" stroke="#756b5c" stroke-opacity=".4" stroke-width="2"/></g>
    </g>
    <rect x="866" y="238" width="168" height="110" rx="4" fill="#102c39" opacity=".55" stroke="#6d8f9c" stroke-opacity=".3"/>
    <path d="M884 262H1010M884 282H1010M884 302H984" stroke="#8bc8d1" stroke-opacity=".3" stroke-width="4"/>`
  if (kind === 'founder' && variant === 1) return `
    <rect x="846" y="206" width="306" height="190" rx="4" fill="#d6d2c7" opacity=".7" stroke="#dce1dc" stroke-opacity=".3"/>
    <path d="M874 238H1124M874 268H1124M874 298H1062" stroke="#6f7772" stroke-opacity=".35" stroke-width="3"/>
    <g transform="translate(890 316)"><rect width="46" height="38" fill="#d7b07b" opacity=".65" transform="rotate(-2 23 19)"/><rect x="54" width="42" height="34" fill="#b5c8bb" opacity=".58"/><rect x="104" width="52" height="40" fill="#c7b1c9" opacity=".55"/></g>
    <g transform="translate(1184 232)">
      <rect width="118" height="154" rx="4" fill="#18232a" stroke="#68737b" stroke-opacity=".3"/>
      <path d="M14 20H104M14 44H104M14 68H104M14 92H84M14 116H104" stroke="#c8bda9" stroke-opacity=".18" stroke-width="2"/>
    </g>
    <g transform="translate(884 486)">
      <path d="M0 0H440L418 22H20Z" fill="#353133" stroke="#95826b" stroke-opacity=".3"/>
      <path d="M30 22V104M418 22V104" stroke="#1b1d20" stroke-width="10"/>
      <ellipse cx="138" cy="12" rx="54" ry="12" fill="#c8d0c6" opacity=".28"/>
      <path d="M98 18V62M178 18V62" stroke="#5b6760" stroke-width="4"/>
      <rect x="238" y="2" width="72" height="42" rx="3" fill="#d8cbb8" opacity=".42" transform="rotate(2 274 23)"/>
      <circle cx="340" cy="18" r="13" fill="#d9c7a6" opacity=".18"/>
    </g>
    <g transform="translate(1188 470)"><path d="M0 0H92L84 20H8Z" fill="#2e2c2e"/><path d="M16 20V68M76 20V68" stroke="#1a1c1f" stroke-width="7"/><rect x="22" y="2" width="50" height="34" rx="3" fill="#cfc4b1" opacity=".4"/></g>`
  if (kind === 'founder' && variant === 2) return `
    <rect x="852" y="204" width="222" height="222" rx="3" fill="#0b161f" stroke="#566974" stroke-opacity=".4"/>
    <path d="M852 314H1074M963 204V426" stroke="#3c505a" stroke-width="8"/>
    <path d="M874 232H1052M874 260H1052M874 288H1004M874 344H1052M874 372H1030" stroke="#9cb4bd" stroke-opacity=".1" stroke-width="3"/>
    <g class="anim glow-drift"><ellipse cx="1190" cy="360" rx="160" ry="150" fill="url(#stageGlow)" opacity=".42"/></g>
    <g transform="translate(1110 492)">
      <path d="M0 0H132L122 20H10Z" fill="#343235" stroke="#91816c" stroke-opacity=".3"/>
      <path d="M18 20V84M114 20V84" stroke="#1c1e22" stroke-width="8"/>
      <rect x="24" y="2" width="74" height="34" rx="3" fill="#d2c6b3" opacity=".46" transform="rotate(-2 61 19)"/>
    </g>
    <g transform="translate(1268 486)">
      <path d="M0 0H58L52 18H6Z" fill="#343235" stroke="#91816c" stroke-opacity=".3"/>
      <path d="M12 18V72M46 18V72" stroke="#1c1e22" stroke-width="7"/>
      <rect x="16" y="2" width="30" height="28" rx="2" fill="#bfc7bd" opacity=".4"/>
    </g>
    <g transform="translate(1160 410)">
      <ellipse cx="30" cy="58" rx="30" ry="6" fill="#0e1013"/>
      <path d="M8 56C0 40 18 24 34 30C50 24 62 42 52 56Z" fill="#425a4d" stroke="#9cb09b" stroke-opacity=".28"/>
      <path d="M30 30V14M22 24C16 10 8 16 8 16M38 24C44 8 52 14 52 14" stroke="#7e9b84" stroke-width="2" stroke-linecap="round"/>
      <circle cx="54" cy="16" r="12" fill="#d9c7a6" opacity=".16"/>
    </g>
    <path d="M1088 450L1226 432" stroke="#b09a7e" stroke-opacity=".2" stroke-width="4"/>
    <rect x="1180" y="212" width="120" height="86" rx="3" fill="#29312e" opacity=".5" stroke="#8e9a90" stroke-opacity=".25"/>
    <path d="M1196 228H1284M1196 244H1284M1196 260H1260" stroke="#d5c8b3" stroke-opacity=".2" stroke-width="2"/>`
  if (kind === 'founder' && variant === 3) return `
    <g transform="translate(846 210)">
      <rect width="112" height="300" rx="5" fill="#151b20" stroke="#5b666e" stroke-opacity=".42"/>
      <path d="M14 24H98M14 48H98M14 72H98M14 96H98M14 120H98M14 144H98M14 168H98M14 192H98M14 216H98M14 240H98" stroke="#9db0b8" stroke-opacity=".12" stroke-width="2"/>
      <circle cx="30" cy="34" r="4" fill="#8fc8c8" opacity=".6"/><circle cx="30" cy="58" r="4" fill="#d9b178" opacity=".6"/><circle cx="30" cy="82" r="4" fill="#8fc8c8" opacity=".45"/>
      <path d="M74 24V280M86 24V280" stroke="#2f3b42" stroke-width="3"/>
    </g>
    <g transform="translate(1000 460)">
      <path d="M0 0H260L246 20H14Z" fill="#2e2d30" stroke="#92816b" stroke-opacity=".3"/>
      <path d="M24 20V104M238 20V104" stroke="#1a1c20" stroke-width="9"/>
      <g transform="translate(44 4) rotate(-2)"><rect width="94" height="56" rx="3" fill="#111b23" stroke="#7e8b92" stroke-opacity=".4"/><path d="M12 14H82M12 26H82M12 38H64" stroke="#8fc8c8" stroke-opacity=".22" stroke-width="2"/></g>
      <rect x="160" y="2" width="66" height="52" rx="3" fill="#d8ccb9" opacity=".5" transform="rotate(2 193 28)"/>
      <path d="M172 16H216M172 28H206" stroke="#776c5c" stroke-opacity=".4" stroke-width="2"/>
    </g>
    <g transform="translate(1128 330)">
      <rect width="154" height="144" rx="4" fill="#111a21" stroke="#5e6a72" stroke-opacity=".35"/>
      <path d="M20 24H134M20 46H134M20 68H112M20 90H134" stroke="#d5c7b2" stroke-opacity=".14" stroke-width="3"/>
      <rect x="20" y="108" width="34" height="20" fill="#d7b07b" opacity=".55"/><rect x="62" y="108" width="34" height="20" fill="#b5c8bb" opacity=".45"/>
    </g>
    <path d="M1000 602H1320" stroke="#6e7c84" stroke-opacity=".22" stroke-width="3"/>`
  return ''
}

function careerRoom(kind, variant = 0) {
  const shell = (inner) => `<g clip-path="url(#rightClip)">
    <rect x="806" y="164" width="532" height="502" fill="url(#rightRoom)"/>
    <g class="anim glow-drift"><ellipse cx="1110" cy="348" rx="290" ry="268" fill="url(#stageGlow)"/></g>
    <path d="M1080 156H1180L1300 666H884Z" fill="url(#spotlight)"/>
    <path d="M806 540L1338 504V666H806Z" fill="url(#floor)"/>
    <path d="M806 561L1338 523M806 614L1338 567M924 666L1008 524M1150 666L1160 516" stroke="#a392b1" stroke-opacity=".055"/>
    ${inner}
    <rect x="806" y="164" width="532" height="502" fill="url(#glass)" opacity=".26"/>
  </g>`

  if (variant > 0) return shell(careerVariantProps(kind, variant))

  if (kind === 'doctor') return shell(`
    <rect x="838" y="198" width="252" height="224" rx="3" fill="#0b151d" stroke="#506474" stroke-opacity=".45"/>
    <path d="M860 220H1068M860 250H1068M860 280H1068M860 310H1068M860 340H1068M860 370H1068" stroke="#8b9ba3" stroke-opacity=".08"/>
    <path d="M838 310H1090M964 198V422" stroke="#3c5260" stroke-width="8"/>
    <circle cx="1212" cy="270" r="31" fill="none" stroke="#d79a9a" stroke-opacity=".5" stroke-width="2"/>
    <path d="M1212 251V289M1193 270H1231" stroke="#d79a9a" stroke-opacity=".66" stroke-width="6" stroke-linecap="round"/>
    <g class="anim blink"><rect x="1144" y="204" width="158" height="8" rx="4" fill="#d6eef0" opacity=".32"/></g>
    <path d="M1110 454H1322" stroke="#9bb0b8" stroke-opacity=".28" stroke-width="3"/>
    <path d="M1120 164V666M1250 164V666" stroke="#6e7c88" stroke-opacity=".24" stroke-width="5"/>
    <path d="M1120 470Q1160 450 1200 470T1280 470T1340 470" fill="none" stroke="#d8e5e6" stroke-opacity=".12" stroke-width="18"/>
    <g transform="translate(970 504)">
      <rect width="264" height="44" rx="14" fill="#c9dde1" opacity=".58"/>
      <rect x="12" y="9" width="238" height="10" rx="5" fill="#f1f8f7" opacity=".24"/>
      <rect x="18" y="18" width="54" height="22" rx="8" fill="#eef7f5" opacity=".42"/>
      <path d="M18 44V82M244 44V82M18 82H34M228 82H244" stroke="#9fb4b9" stroke-width="4" stroke-linecap="round"/>
      <circle cx="26" cy="86" r="7" fill="#1b252b" stroke="#8da2a8"/><circle cx="236" cy="86" r="7" fill="#1b252b" stroke="#8da2a8"/>
    </g>
    <g transform="translate(920 364)">
      <path d="M20 0V202M2 202H38" stroke="#aabec5" stroke-width="4" stroke-linecap="round"/>
      <rect x="6" y="18" width="28" height="54" rx="7" fill="#d8ecef" opacity=".46" stroke="#d8ecef" stroke-opacity=".24"/>
      <path d="M20 72V122" stroke="#c5e3e7" stroke-opacity=".5" stroke-width="2" stroke-dasharray="2 8"/>
    </g>
    <g transform="translate(824 374)">
      <rect width="76" height="158" rx="6" fill="#13232d" stroke="#5c7684" stroke-opacity=".42"/>
      <rect x="8" y="10" width="60" height="58" rx="3" fill="#0b1821"/>
      <path d="M16 24H60M16 36H60M16 48H46" stroke="#e0b982" stroke-opacity=".3" stroke-width="2"/>
      <rect x="8" y="78" width="60" height="58" rx="3" fill="#0a1318"/>
      <path d="M20 92H50M20 108H50" stroke="#8fc8c8" stroke-opacity=".24" stroke-width="2"/>
      <circle cx="24" cy="126" r="5" fill="#e1be8f" opacity=".74"/>
      <path d="M54 126H66" stroke="#8fc8c8" stroke-opacity=".34" stroke-width="2"/>
    </g>`)

  if (kind === 'teacher') return shell(`
    <rect x="838" y="206" width="300" height="192" rx="4" fill="#1b302b" stroke="#687d6f" stroke-opacity=".5"/>
    <path d="M860 232H1114M860 254H1114M860 276H1114M860 298H1114M860 320H1114" stroke="#e8e0c8" stroke-opacity=".19" stroke-width="2"/>
    <path d="M880 350C900 322 918 360 936 332M960 350C982 318 1000 356 1020 330" fill="none" stroke="#e8e0c8" stroke-opacity=".22" stroke-width="3"/>
    <path d="M1040 236H1090V266H1040Z" fill="none" stroke="#e8e0c8" stroke-opacity=".2" stroke-width="2"/>
    <rect x="1160" y="206" width="158" height="218" rx="3" fill="#0d1720" stroke="#6e7883" stroke-opacity=".45"/>
    <path d="M1178 224H1300M1178 248H1300M1178 272H1300M1178 296H1300M1178 320H1300" stroke="#9fb4bd" stroke-opacity=".1"/>
    <path d="M1160 316H1318M1239 206V424" stroke="#40525c" stroke-width="8"/>
    <g class="anim glow-drift"><ellipse cx="1216" cy="402" rx="92" ry="70" fill="url(#lampGlow)" opacity=".34"/></g>
    <g transform="translate(848 516)">
      <path d="M0 0H460L438 18H16Z" fill="#3a3028" stroke="#9c8063" stroke-opacity=".26"/>
      <path d="M20 18V96M420 18V96" stroke="#24211f" stroke-width="9"/>
      <path d="M24 54H416" stroke="#8f775d" stroke-opacity=".24" stroke-width="2"/>
      <rect x="40" y="0" width="88" height="46" rx="4" fill="#e2d9c7" opacity=".84" transform="rotate(-3 84 23)"/>
      <rect x="180" y="2" width="82" height="42" rx="4" fill="#d7cbb8" opacity=".7" transform="rotate(2 221 23)"/>
      <path d="M56 14H112M56 24H104M196 16H244M196 26H236" stroke="#766d5e" stroke-opacity=".55" stroke-width="2"/>
      <path d="M330 8H394V36H330Z" fill="#3a4a44" opacity=".55"/>
      <path d="M338 16H386M338 24H374" stroke="#d8c7a8" stroke-opacity=".4" stroke-width="2"/>
    </g>
    <rect x="1160" y="424" width="132" height="88" rx="5" fill="#132029" stroke="#66727b" stroke-opacity=".35" transform="rotate(2 1226 468)"/>
    <path d="M1176 442H1276M1176 456H1276M1176 470H1276" stroke="#c8b99f" stroke-opacity=".25" stroke-width="2" transform="rotate(2 1226 468)"/>
    <g transform="translate(1148 500)"><path d="M0 0H104L112 48H-8Z" fill="#2b2623"/><path d="M8 6H96L100 30H4Z" fill="#d0c4ae" opacity=".58"/><path d="M18 8V30M46 7V29M74 6V28" stroke="#7f735f" stroke-opacity=".5" stroke-width="2"/></g>`)

  if (kind === 'designer') return shell(`
    <g class="anim glow-drift"><ellipse cx="1020" cy="342" rx="210" ry="170" fill="url(#stageGlow)" opacity=".42"/></g>
    <rect x="882" y="224" width="266" height="166" rx="7" fill="#0c1722" stroke="#566b7c" stroke-opacity=".45"/>
    <rect x="894" y="236" width="242" height="142" rx="3" fill="#102d3a"/>
    <path d="M912 258H1090M912 274H1114M912 290H1074M912 306H1122M912 322H984" stroke="#8bc8d1" stroke-opacity=".28" stroke-width="4" stroke-linecap="round"/>
    <path d="M912 340H960M974 340H1040" stroke="#d8ae7a" stroke-opacity=".34" stroke-width="4" stroke-linecap="round"/>
    <path d="M1014 390V470M964 470H1064" stroke="#8497a3" stroke-width="5" stroke-linecap="round"/>
    <path d="M838 506H1324L1304 530H858Z" fill="#2b2626" stroke="#9b8069" stroke-opacity=".3"/>
    <path d="M884 530V620M1280 530V620" stroke="#1b1c20" stroke-width="12"/>
    <g transform="translate(1160 244) rotate(4)">
      <rect width="86" height="110" rx="3" fill="#e3d9c8" opacity=".5"/>
      <path d="M10 18H76M10 32H76M10 46H76M10 60H64" stroke="#7b7467" stroke-opacity=".35" stroke-width="2"/>
      <path d="M16 82C28 66 42 86 52 72" fill="none" stroke="#9b6f5d" stroke-opacity=".34" stroke-width="3"/>
    </g>
    <g transform="translate(1260 258) rotate(-5)">
      <rect width="58" height="74" rx="3" fill="#d5cab8" opacity=".4"/>
      <path d="M10 16H48M10 28H48M10 40H36" stroke="#7b7467" stroke-opacity=".3" stroke-width="2"/>
    </g>
    <g transform="translate(860 468)">
      <path d="M0 0H72L80 44H-8Z" fill="#191b20"/>
      <path d="M10 6H62L66 30H6Z" fill="#d7d0c1" opacity=".65"/>
      <path d="M26 4V30" stroke="#8d7f6a" stroke-opacity=".4" stroke-width="2"/>
    </g>
    <g transform="translate(1110 472)">
      <ellipse cx="30" cy="52" rx="34" ry="7" fill="#111317"/>
      <path d="M8 50C2 38 16 26 30 30C46 25 60 40 52 52Z" fill="#4f655e" stroke="#9aab9d" stroke-opacity=".3"/>
      <path d="M30 30V18M24 24C18 12 12 18 12 18M36 24C42 10 48 16 48 16" stroke="#86a28e" stroke-width="2" stroke-linecap="round"/>
      <circle cx="54" cy="18" r="13" fill="#d9c7a6" opacity=".18"/>
    </g>`)

  if (kind === 'founder') return shell(`
    <rect x="846" y="204" width="282" height="176" rx="4" fill="#d7d1c5" opacity=".74" stroke="#dfe4df" stroke-opacity=".32"/>
    <path d="M870 236H1090M870 262H1090M870 288H1050" stroke="#6c7470" stroke-opacity=".35" stroke-width="3"/>
    <rect x="876" y="306" width="48" height="38" fill="#d7b07b" opacity=".7" transform="rotate(-2 900 325)"/>
    <rect x="934" y="314" width="42" height="32" fill="#b5c8bb" opacity=".6" transform="rotate(2 955 330)"/>
    <rect x="990" y="306" width="46" height="36" fill="#c7b1c9" opacity=".6"/>
    <rect x="1160" y="204" width="158" height="216" rx="3" fill="#0c1720" stroke="#5d6c78" stroke-opacity=".42"/>
    <path d="M1178 222H1300M1178 246H1300M1178 270H1300M1178 294H1300M1178 318H1300" stroke="#9cb4bf" stroke-opacity=".1"/>
    <path d="M1160 312H1318M1239 204V420" stroke="#40525c" stroke-width="8"/>
    <g class="anim glow-drift"><ellipse cx="1256" cy="450" rx="92" ry="78" fill="url(#lampGlow)" opacity=".3"/></g>
    <g transform="translate(850 500)">
      <path d="M0 0H142L132 18H10Z" fill="#343335" stroke="#91816c" stroke-opacity=".3"/>
      <path d="M20 18V92M118 18V92" stroke="#1d1e22" stroke-width="8"/>
      <rect x="24" y="2" width="84" height="38" rx="3" fill="#d6ccbb" opacity=".58" transform="rotate(-2 66 21)"/>
      <path d="M36 14H94M36 24H80" stroke="#6e6b60" stroke-opacity=".34" stroke-width="2"/>
    </g>
    <g transform="translate(1040 500)">
      <path d="M0 0H142L132 18H10Z" fill="#343335" stroke="#91816c" stroke-opacity=".3"/>
      <path d="M20 18V92M118 18V92" stroke="#1d1e22" stroke-width="8"/>
      <rect x="28" y="2" width="72" height="40" rx="3" fill="#c9d0c5" opacity=".5" transform="rotate(2 64 22)"/>
      <path d="M42 14H84M42 24H72" stroke="#5f685f" stroke-opacity=".4" stroke-width="2"/>
    </g>
    <g transform="translate(1218 500)">
      <path d="M0 0H94L86 18H8Z" fill="#343335" stroke="#91816c" stroke-opacity=".3"/>
      <path d="M18 18V92M78 18V92" stroke="#1d1e22" stroke-width="8"/>
      <rect x="22" y="2" width="54" height="34" rx="3" fill="#d5c8b4" opacity=".46"/>
    </g>
    <g transform="translate(1264 430)">
      <rect width="42" height="48" rx="3" fill="#1b2a30"/>
      <path d="M8 10H34M8 20H34M8 30H26" stroke="#8fc8c8" stroke-opacity=".3" stroke-width="2"/>
      <circle cx="21" cy="41" r="3" fill="#e0b982" opacity=".7"/>
    </g>
    <g transform="translate(1132 458)">
      <ellipse cx="30" cy="58" rx="30" ry="6" fill="#0e1013"/>
      <path d="M8 56C0 40 18 24 34 30C50 24 62 42 52 56Z" fill="#425a4d" stroke="#9cb09b" stroke-opacity=".28"/>
      <path d="M30 30V14M22 24C16 10 8 16 8 16M38 24C44 8 52 14 52 14" stroke="#7e9b84" stroke-width="2" stroke-linecap="round"/>
    </g>`)

  return ''
}

function renderScene(name, config) {
  const left = config.left ?? 1
  const right = config.right ?? 1
  const dawn = config.dawn ? `<rect width="1440" height="900" fill="url(#dawn)"/><path d="M0 248C280 210 480 268 720 226C970 182 1160 244 1440 196V0H0Z" fill="#e5a18a" opacity=".07"/><ellipse cx="720" cy="210" rx="380" ry="100" fill="#efb493" opacity=".1" filter="url(#blur24)"/>` : ''
  const focusShade = config.focus === 'left'
    ? '<rect x="704" y="112" width="736" height="642" fill="#02050b" opacity=".32"/>'
    : config.focus === 'right'
      ? '<rect y="112" width="704" height="642" fill="#02050b" opacity=".34"/>'
      : ''
  const tint = config.cool
    ? '<rect width="1440" height="900" fill="#6d5360" opacity=".09"/>'
    : config.warm
      ? '<rect width="1440" height="900" fill="#9b6946" opacity=".09"/>'
      : ''
  const motifLift = config.motif === 'music' || config.motif === 'reality' ? uiLift : 0
  const motifHasScore = config.motif === 'sheet' || config.motif === 'music'
  const motifHasGuitar = config.motif === 'guitar' || config.motif === 'space'
  const motifHasLamp = config.motif === 'lamp'
  const split = config.split ? '<path d="M720 112V754" stroke="#b2d9d7" stroke-opacity=".1" stroke-width="2" stroke-dasharray="2 14"/>' : ''
  const camera = config.camera ? cameraTransform(config.camera, config.zoom ?? 1.15) : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="title desc">
  <title id="title">Elsewhere 雨夜双城 · ${name}</title><desc id="desc">工程书桌与音乐排练室在雨夜中由来电信号连接。</desc>
  ${motionStyle}
  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#120d0c"/><stop offset=".46" stop-color="#2b1c1c"/><stop offset="1" stop-color="#160f0e"/></linearGradient>
    <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e2a276" stop-opacity=".36"/><stop offset=".48" stop-color="#8b5e5e" stop-opacity=".15"/><stop offset="1" stop-color="#17110f" stop-opacity="0"/></linearGradient>
    <linearGradient id="warmWash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efb77d" stop-opacity=".2"/><stop offset=".5" stop-color="#dca18c" stop-opacity=".13"/><stop offset="1" stop-color="#c98370" stop-opacity=".18"/></linearGradient>
    <linearGradient id="leftRoom" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#3b2c24"/><stop offset=".55" stop-color="#2a211d"/><stop offset="1" stop-color="#15100e"/></linearGradient>
    <linearGradient id="rightRoom" x1=".2" y1="0" x2=".8" y2="1"><stop stop-color="#3b292c"/><stop offset=".58" stop-color="#2b2025"/><stop offset="1" stop-color="#171114"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#261c18"/><stop offset="1" stop-color="#0e0b0a"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d5b497" stop-opacity=".13"/><stop offset=".42" stop-color="#62483f" stop-opacity=".05"/><stop offset=".48" stop-color="#f4d7b6" stop-opacity=".13"/><stop offset="1" stop-color="#211512" stop-opacity=".03"/></linearGradient>
    <linearGradient id="spotlight" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe0b6" stop-opacity=".27"/><stop offset="1" stop-color="#d9a18b" stop-opacity="0"/></linearGradient>
    <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#100b09" stop-opacity="0"/><stop offset=".56" stop-color="#100b09" stop-opacity=".46"/><stop offset="1" stop-color="#0b0807" stop-opacity=".94"/></linearGradient>
    <radialGradient id="lampGlow"><stop stop-color="#ffe0a8" stop-opacity=".78"/><stop offset=".26" stop-color="#f4bd78" stop-opacity=".3"/><stop offset="1" stop-color="#e6a053" stop-opacity="0"/></radialGradient>
    <radialGradient id="stageGlow"><stop stop-color="#ffd8bd" stop-opacity=".48"/><stop offset=".35" stop-color="#dda088" stop-opacity=".18"/><stop offset="1" stop-color="#aa6e63" stop-opacity="0"/></radialGradient>
    <radialGradient id="vignette" cx=".5" cy=".45" r=".72"><stop offset=".42" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".66"/></radialGradient>
    <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="27" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .075"/></feComponentTransfer></filter>
    <clipPath id="leftClip"><rect x="102" y="164" width="532" height="502" rx="3"/></clipPath><clipPath id="rightClip"><rect x="806" y="164" width="532" height="502" rx="3"/></clipPath>
  </defs>
  <rect width="1440" height="900" fill="url(#night)"/>
  <ellipse cx="360" cy="340" rx="460" ry="370" fill="#b47b58" opacity=".09"/><ellipse cx="1100" cy="330" rx="440" ry="360" fill="#a86c6c" opacity=".1"/>
${dawn}
  <g transform="translate(0 -${uiLift}) ${camera}">
  <path d="M0 112H1440V754H0Z" fill="#080d15" opacity=".9"/><path d="M0 112H1440M0 754H1440" stroke="#6d8296" stroke-opacity=".14"/>
  <g filter="url(#shadow)"><rect x="72" y="134" width="592" height="562" rx="8" fill="#05090f" stroke="#344250" stroke-opacity=".55"/><rect x="92" y="154" width="552" height="522" rx="4" fill="#111923" stroke="#637484" stroke-opacity=".18"/><rect x="776" y="134" width="592" height="562" rx="8" fill="#05090f" stroke="#454057" stroke-opacity=".58"/><rect x="796" y="154" width="552" height="522" rx="4" fill="#171522" stroke="#756887" stroke-opacity=".18"/></g>
  <g opacity="${left}">${leftRoom({ showLamp: !motifHasLamp })}</g><g opacity="${right}">${config.career ? careerRoom(config.career, config.careerVariant ?? 0) : rightRoom({ showSheet: !motifHasScore, showGuitar: !motifHasGuitar })}</g>
  <rect x="102" y="164" width="532" height="502" fill="url(#glass)" opacity=".32"/>
  <path d="M368 158V672M98 328H640M1072 158V672M802 328H1344" stroke="#080d14" stroke-width="15"/><path d="M368 158V672M98 328H640M1072 158V672M802 328H1344" stroke="#607080" stroke-opacity=".12" stroke-width="2"/>
  <rect x="102" y="164" width="532" height="502" rx="3" fill="none" stroke="#9aabba" stroke-opacity=".12"/><rect x="806" y="164" width="532" height="502" rx="3" fill="none" stroke="#aa9bb8" stroke-opacity=".12"/>
  </g>
  ${rainLines(150, config.rain ?? 0.2, 27)}
  ${dustMotes(22, 61)}
${`  <g transform="translate(0 -${uiLift}) ${camera}">${focusShade}${split}${phone(config.phone ?? 0)}<g transform="translate(0 ${motifLift})">${motif(config.motif)}</g></g>${tint}`.trimEnd()}
  <rect width="1440" height="900" fill="url(#warmWash)"/>
  <rect y="606" width="1440" height="294" fill="url(#bottomShade)"/><rect width="1440" height="900" fill="url(#vignette)"/><rect width="1440" height="900" filter="url(#grain)" opacity=".38"/>
</svg>
`
}

await mkdir(outputDirectory, { recursive: true })
for (const [name, config] of Object.entries(scenes)) {
  const svg = renderScene(name, config).replace(/[ \t]+$/gm, '')
  await writeFile(new URL(`${name}.svg`, outputDirectory), svg)
}
console.log(`Generated ${Object.keys(scenes).length} local SVG backgrounds.`)
