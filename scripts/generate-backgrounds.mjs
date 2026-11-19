import { mkdir, writeFile } from 'node:fs/promises'

const outputDirectory = new URL('../public/backgrounds/', import.meta.url)

const scenes = {
  home: { phone: 0.18 },
  incoming: { phone: 0, right: 1.2 },
  opening: { phone: 0.55 },
  music: { focus: 'right', motif: 'music', right: 1.25, left: 0.55 },
  reality: { focus: 'left', motif: 'reality', left: 1.2, right: 0.55 },
  'first-choice': { split: true, phone: 0.15 },
  regret: { focus: 'right', motif: 'guitar', right: 0.9, left: 0.4, rain: 0.38, cool: true },
  cherish: { focus: 'left', motif: 'lamp', left: 1.3, right: 0.55, warm: true },
  'second-choice': { split: true, motif: 'paths', left: 0.9, right: 0.9 },
  'make-space': { focus: 'right', motif: 'space', right: 1.15, left: 0.55 },
  'reach-out': { motif: 'reach', left: 1.05, right: 0.9, warm: true },
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

function rainLines(count, opacity, seed, width = 1440, height = 820) {
  const random = randomGenerator(seed)
  return Array.from({ length: count }, () => {
    const x = random() * (width + 60) - 30
    const y = random() * height
    const length = 10 + random() * 28
    return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - length * 0.24).toFixed(1)}" y2="${(y + length).toFixed(1)}" stroke-width="${(0.6 + random()).toFixed(1)}" opacity="${(0.2 + random() * 0.65).toFixed(2)}"/>`
  }).join('').replace(/^/, `<g stroke="#c5d8e5" stroke-linecap="round" opacity="${opacity}">`).concat('</g>')
}

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
    <path d="M624 362C672 312 695 306 720 306C745 306 772 315 816 362" fill="none" stroke="#8ad7d6" stroke-opacity=".75" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/>
    <circle cx="624" cy="362" r="5" fill="#d6c49e"/><circle cx="816" cy="362" r="5" fill="#c2a4da"/>
    <circle cx="720" cy="306" r="52" fill="#82d9d5" opacity=".1" filter="url(#blur8)"/>
    <circle cx="720" cy="306" r="35" fill="#0b1821" stroke="#8ad7d6" stroke-opacity=".75"/>
    <circle cx="720" cy="306" r="28" fill="#10242c" stroke="#d1f2eb" stroke-opacity=".12"/>
    <path d="M707 293L714 303L708 308C711 314 715 318 721 320L725 314L735 320L733 327C732 330 729 331 726 330C711 326 701 316 697 301C696 297 698 294 701 293Z" fill="none" stroke="#c7eeea" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M741 284C749 287 754 293 756 301M744 275C757 279 765 289 768 302" fill="none" stroke="#91d8d4" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
  </g>`
}

function motif(kind) {
  if (kind === 'music') return `<g transform="translate(594 112)" fill="none" stroke="#d8b8ed" stroke-opacity=".38" stroke-width="3">
    <path d="M0 28H252M0 46H252M0 64H252M0 82H252M0 100H252"/>
    <path d="M72 28V82L46 91M164 12V70L136 79M72 40L164 25"/>
    <ellipse cx="38" cy="92" rx="15" ry="10" fill="#b890d0" fill-opacity=".25" transform="rotate(-16 38 92)"/>
    <ellipse cx="128" cy="80" rx="15" ry="10" fill="#b890d0" fill-opacity=".25" transform="rotate(-16 128 80)"/>
  </g>`
  if (kind === 'reality') return `<g transform="translate(590 108)">
    <rect width="264" height="132" rx="12" fill="#0d1b28" fill-opacity=".64" stroke="#7ea8b7" stroke-opacity=".24"/>
    <circle cx="22" cy="20" r="3" fill="#c79b68"/><circle cx="34" cy="20" r="3" fill="#6f9ea7"/><circle cx="46" cy="20" r="3" fill="#687a91"/>
    <path d="M26 50H90M104 50H154M42 70H106M120 70H218M42 90H78M92 90H162M26 110H70M84 110H132" stroke="#8ac4c3" stroke-opacity=".44" stroke-width="5" stroke-linecap="round"/>
    <path d="M164 50H218M174 90H224M144 110H196" stroke="#d0a674" stroke-opacity=".42" stroke-width="5" stroke-linecap="round"/>
  </g>`
  if (kind === 'guitar') return `<ellipse cx="724" cy="440" rx="180" ry="230" fill="url(#stageGlow)"/>${guitar(650, 280, 1.05)}`
  if (kind === 'lamp') return `<g transform="translate(610 258)">
    <ellipse cx="112" cy="150" rx="190" ry="200" fill="url(#lampGlow)"/>
    <path d="M110 170L158 62M158 62L122 32" stroke="#76716a" stroke-width="10" stroke-linecap="round"/>
    <path d="M78 12Q124 -4 154 36L128 80Q92 66 78 12Z" fill="#c69b65" stroke="#f2d29f" stroke-opacity=".5" stroke-width="3"/>
    <path d="M92 76L0 282H242L132 76Z" fill="#f5c57e" opacity=".07"/>
    <ellipse cx="110" cy="182" rx="58" ry="12" fill="#80715d"/><ellipse cx="110" cy="178" rx="40" ry="7" fill="#e0bf86" opacity=".6"/>
  </g>`
  if (kind === 'paths') return `<g fill="none" stroke-linecap="round">
    <path d="M720 640C682 520 548 466 480 354" stroke="#e2bd82" stroke-opacity=".35" stroke-width="3"/>
    <path d="M720 640C760 520 890 462 962 354" stroke="#c5a2df" stroke-opacity=".35" stroke-width="3"/>
    <path d="M720 640C682 520 548 466 480 354M720 640C760 520 890 462 962 354" stroke="#d9ece7" stroke-opacity=".35" stroke-width="12" filter="url(#blur8)"/>
    <circle cx="720" cy="640" r="7" fill="#a5d9d2" fill-opacity=".65"/>
  </g>`
  if (kind === 'space') return `<ellipse cx="720" cy="424" rx="210" ry="248" fill="url(#stageGlow)"/>${guitar(644, 266, 1.02)}
    <g transform="translate(802 276)"><circle r="45" fill="#0d1721" fill-opacity=".72" stroke="#dbc49d" stroke-opacity=".48" stroke-width="2"/><circle r="34" fill="none" stroke="#dbc49d" stroke-opacity=".2"/><path d="M0 -25V0L18 12" fill="none" stroke="#eed8b4" stroke-opacity=".72" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="#eed8b4"/></g>`
  if (kind === 'reach') return `<g transform="translate(594 310)">
    <ellipse cx="126" cy="140" rx="230" ry="180" fill="url(#lampGlow)" opacity=".7"/>
    <path d="M40 94H102L96 154Q72 172 48 154Z" fill="#b8a184" fill-opacity=".72" stroke="#eed8b7" stroke-opacity=".45" stroke-width="2"/>
    <path d="M102 106Q132 104 124 130Q118 144 98 140" fill="none" stroke="#d6bea0" stroke-opacity=".6" stroke-width="7"/>
    <path d="M158 94H220L214 154Q190 172 166 154Z" fill="#8d779e" fill-opacity=".76" stroke="#d6bce8" stroke-opacity=".45" stroke-width="2"/>
    <path d="M220 106Q250 104 242 130Q236 144 216 140" fill="none" stroke="#bfa4cf" stroke-opacity=".6" stroke-width="7"/>
    <path d="M58 72C46 58 68 50 56 34M82 72C70 58 92 50 80 34M176 72C164 58 186 50 174 34M200 72C188 58 210 50 198 34" fill="none" stroke="#e8ddd1" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>
    <path d="M0 176H260" stroke="#c3ad93" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>
  </g>`
  return ''
}

function leftRoom() {
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
    <ellipse cx="490" cy="470" rx="176" ry="172" fill="url(#lampGlow)"/>
    <path d="M493 423L530 340M530 340L500 318" stroke="#5b5e60" stroke-width="8" stroke-linecap="round"/>
    <path d="M470 304Q501 286 529 315L511 348Q484 340 470 304Z" fill="#c59b63"/>
    <path d="M476 308Q499 297 520 316" stroke="#ffe0a4" stroke-opacity=".65" stroke-width="3"/>
    <ellipse cx="493" cy="428" rx="46" ry="9" fill="#6c6558"/><ellipse cx="493" cy="426" rx="34" ry="5" fill="#d3b785" opacity=".55"/>
    <path d="M481 348L405 523H581L514 348Z" fill="#f2bd78" opacity=".065"/>
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

function rightRoom() {
  return `<g clip-path="url(#rightClip)">
    <rect x="806" y="164" width="532" height="502" fill="url(#rightRoom)"/>
    <ellipse cx="1110" cy="348" rx="290" ry="268" fill="url(#stageGlow)"/>
    <g opacity=".32"><path d="M838 194H894V450H838ZM906 194H962V450H906ZM974 194H1030V450H974ZM1042 194H1098V450H1042ZM1110 194H1166V450H1110ZM1178 194H1234V450H1178ZM1246 194H1302V450H1246Z" fill="#40344f"/><path d="M850 194V450M918 194V450M986 194V450M1054 194V450M1122 194V450M1190 194V450M1258 194V450" stroke="#9a82aa" stroke-opacity=".18"/></g>
    <path d="M1080 156H1180L1300 666H884Z" fill="url(#spotlight)"/>
    <ellipse cx="1115" cy="626" rx="218" ry="44" fill="#c5a0dc" opacity=".07" filter="url(#blur8)"/>
    <path d="M806 540L1338 504V666H806Z" fill="url(#floor)"/>
    <path d="M806 561L1338 523M806 614L1338 567M924 666L1008 524M1150 666L1160 516" stroke="#a392b1" stroke-opacity=".055"/>
    <rect x="846" y="246" width="112" height="150" rx="3" fill="#171822" stroke="#76677f" stroke-opacity=".32"/><rect x="858" y="258" width="88" height="126" fill="#d6cdbc" opacity=".72"/>
    <path d="M870 278H930M870 291H930M870 304H930M870 317H930M870 330H930M870 343H930M870 356H930" stroke="#554f55" stroke-opacity=".65" stroke-width="2"/>
    <g fill="#4a4350" opacity=".8"><ellipse cx="885" cy="287" rx="5" ry="3"/><ellipse cx="915" cy="313" rx="5" ry="3"/><ellipse cx="891" cy="340" rx="5" ry="3"/><path d="M889 286V270M919 312V294M895 339V321" stroke="#4a4350" stroke-width="2"/></g>
    <path d="M1100 356V602M1100 584L1048 630M1100 584L1150 630" stroke="#151720" stroke-width="8" stroke-linecap="round"/><path d="M1100 360V588M1100 584L1048 630M1100 584L1150 630" stroke="#85828d" stroke-opacity=".55" stroke-width="2"/>
    <path d="M1098 374L1162 344" stroke="#777482" stroke-width="5" stroke-linecap="round"/><rect x="1152" y="323" width="18" height="42" rx="9" fill="#171922" stroke="#a29baa" stroke-opacity=".65" transform="rotate(58 1161 344)"/>
    ${guitar(900, 378)}
    <g transform="translate(1142 500)"><path d="M0 22L154 12L174 40L-12 54Z" fill="#191b25" stroke="#6d6879" stroke-opacity=".5"/><path d="M8 25L147 17L154 32L2 42Z" fill="#d3d0ca" opacity=".82"/><path d="M24 24L25 40M42 23L43 39M60 22L61 38M78 21L79 37M96 20L97 36M114 19L115 35M132 18L133 34" stroke="#36333e" stroke-width="2"/><path d="M34 23L34 32M70 21L70 30M88 20L88 29M124 18L124 27" stroke="#171820" stroke-width="7"/><path d="M20 52L4 128M146 42L164 120" stroke="#252630" stroke-width="8"/></g>
    <rect x="806" y="164" width="532" height="502" fill="url(#glass)" opacity=".42"/>
  </g>`
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
  const split = config.split ? '<path d="M720 112V754" stroke="#b2d9d7" stroke-opacity=".1" stroke-width="2" stroke-dasharray="2 14"/>' : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="title desc">
  <title id="title">Elsewhere 雨夜双城 · ${name}</title><desc id="desc">工程书桌与音乐排练室在雨夜中由来电信号连接。</desc>
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
  <g transform="translate(0 -${uiLift})">
  <path d="M0 112H1440V754H0Z" fill="#080d15" opacity=".9"/><path d="M0 112H1440M0 754H1440" stroke="#6d8296" stroke-opacity=".14"/>
  <g filter="url(#shadow)"><rect x="72" y="134" width="592" height="562" rx="8" fill="#05090f" stroke="#344250" stroke-opacity=".55"/><rect x="92" y="154" width="552" height="522" rx="4" fill="#111923" stroke="#637484" stroke-opacity=".18"/><rect x="776" y="134" width="592" height="562" rx="8" fill="#05090f" stroke="#454057" stroke-opacity=".58"/><rect x="796" y="154" width="552" height="522" rx="4" fill="#171522" stroke="#756887" stroke-opacity=".18"/></g>
  <g opacity="${left}">${leftRoom()}</g><g opacity="${right}">${rightRoom()}</g>
  <rect x="102" y="164" width="532" height="502" fill="url(#glass)" opacity=".32"/>
  <path d="M368 158V672M98 328H640M1072 158V672M802 328H1344" stroke="#080d14" stroke-width="15"/><path d="M368 158V672M98 328H640M1072 158V672M802 328H1344" stroke="#607080" stroke-opacity=".12" stroke-width="2"/>
  <rect x="102" y="164" width="532" height="502" rx="3" fill="none" stroke="#9aabba" stroke-opacity=".12"/><rect x="806" y="164" width="532" height="502" rx="3" fill="none" stroke="#aa9bb8" stroke-opacity=".12"/>
  </g>
  ${rainLines(150, config.rain ?? 0.2, 27)}
${`  <g transform="translate(0 -${uiLift})">${focusShade}${split}${phone(config.phone ?? 0)}<g transform="translate(0 ${motifLift})">${motif(config.motif)}</g></g>${tint}`.trimEnd()}
  <rect width="1440" height="900" fill="url(#warmWash)"/>
  <rect y="606" width="1440" height="294" fill="url(#bottomShade)"/><rect width="1440" height="900" fill="url(#vignette)"/><rect width="1440" height="900" filter="url(#grain)" opacity=".38"/>
</svg>
`
}

await mkdir(outputDirectory, { recursive: true })
for (const [name, config] of Object.entries(scenes)) {
  await writeFile(new URL(`${name}.svg`, outputDirectory), renderScene(name, config))
}
console.log(`Generated ${Object.keys(scenes).length} local SVG backgrounds.`)
