const FONT = "'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif"

function label(x, y, value, { size = 14, fill = '#e3d3ba', opacity = 0.82, anchor = 'middle', weight = 600, spacing = 0.6 } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${opacity}" text-anchor="${anchor}" letter-spacing="${spacing}">${value}</text>`
}

function sticky(x, y, w, h, color, rotate = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rotate})">
    <rect width="${w}" height="${h}" rx="1" fill="${color}" opacity=".78"/>
    <path fill="none" d="M0 ${h - 8}H${w}" stroke="#5e4d3b" stroke-opacity=".34" stroke-width="2"/>
  </g>`
}

function cup(x, y, scale = 1, color = '#d8c6ac') {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 0H22L19 28H3Z" fill="${color}" opacity=".72"/>
    <path d="M19 5H27C35 5 35 19 27 20H20" fill="none" stroke="${color}" stroke-opacity=".55" stroke-width="3"/>
    <path fill="none" d="M4 4H18" stroke="#fff2d8" stroke-opacity=".3" stroke-width="2"/>
  </g>`
}

function laptop(x, y, { w = 104, h = 62, accent = '#8fd0d6', rotate = 0, rows = 4 } = {}) {
  const lines = Array.from({ length: rows }, (_, index) => {
    const width = index === 0 ? w - 44 : index === rows - 1 ? w - 54 : w - 30
    return `<path fill="none" d="M16 ${20 + index * 9}H${width}" stroke="${accent}" stroke-opacity="${index === 0 ? 0.55 : 0.28}" stroke-width="2.4"/>`
  }).join('')
  return `<g transform="translate(${x} ${y}) rotate(${rotate})">
    <ellipse cx="${w / 2}" cy="${h + 16}" rx="${w * 0.42}" ry="9" fill="${accent}" opacity=".08"/>
    <rect x="7" width="${w - 14}" height="${h}" rx="4" fill="#141a1f" stroke="#84949a" stroke-opacity=".42"/>
    <rect x="12" y="5" width="${w - 24}" height="${h - 12}" rx="2" fill="#0a1820"/>
    ${lines}
    <path d="M0 ${h}H${w}L${w - 10} ${h + 13}H10Z" fill="#292c2f" stroke="#9b907f" stroke-opacity=".28"/>
  </g>`
}

function tablet(x, y, { w = 126, h = 78, rotate = -4, accent = '#d99c86' } = {}) {
  return `<g transform="translate(${x} ${y}) rotate(${rotate})">
    <rect width="${w}" height="${h}" rx="6" fill="#121920" stroke="#8b979c" stroke-opacity=".45"/>
    <rect x="7" y="7" width="${w - 14}" height="${h - 14}" rx="2" fill="#0d1b23"/>
    <rect x="18" y="17" width="${w - 68}" height="${h - 36}" fill="none" stroke="${accent}" stroke-opacity=".55" stroke-width="2"/>
    <path fill="none" d="M22 ${h - 20}H${w - 58}M22 ${h - 30}H${w - 72}" stroke="${accent}" stroke-opacity=".28" stroke-width="2"/>
    <rect x="${w - 40}" y="16" width="24" height="8" fill="${accent}" opacity=".35"/>
    <rect x="${w - 40}" y="30" width="24" height="8" fill="#8fd0d6" opacity=".28"/>
  </g>
  <g transform="translate(${x + w - 8} ${y + h + 12}) rotate(28)">
    <rect width="7" height="66" rx="3.5" fill="#d7cbb8" opacity=".8"/>
    <path d="M1 66H6L3.5 78Z" fill="#c89a7c"/>
  </g>`
}

function colorFan(x, y, scale = 1, rotate = 0) {
  const colors = ['#c98370', '#d9b178', '#8fb6a0', '#7fb0bd', '#a292b8', '#d7c9b4']
  return `<g transform="translate(${x} ${y}) scale(${scale}) rotate(${rotate})">
    ${colors.map((color, index) => `<path d="M${index * 7} 0H${index * 7 + 6}V46L${index * 7 + 3} 54L${index * 7} 46Z" fill="${color}" opacity=".82"/>`).join('')}
    <circle cx="17" cy="3" r="2.2" fill="#1a1c20"/>
  </g>`
}

function wallClock(x, y, radius = 23, { face = '#d8d0c0', accent = '#6d6458' } = {}) {
  return `<g transform="translate(${x} ${y})">
    <circle r="${radius}" fill="#111820" stroke="${accent}" stroke-opacity=".65" stroke-width="3"/>
    <circle r="${radius - 5}" fill="${face}" opacity=".55"/>
    <path fill="none" d="M0 -${radius - 9}V0L${radius * 0.42} ${radius * 0.26}" stroke="#2d3237" stroke-width="2.6" stroke-linecap="round"/>
    <circle r="2" fill="#2d3237"/>
  </g>`
}

function ivPole(x, y) {
  return `<g transform="translate(${x} ${y})">
    <path fill="none" d="M0 -8V142M-17 142H17M0 -8H13" stroke="#b8c9cc" stroke-opacity=".72" stroke-width="3" stroke-linecap="round"/>
    <rect x="-10" y="6" width="25" height="47" rx="7" fill="#d9eef0" opacity=".4" stroke="#d9eef0" stroke-opacity=".45"/>
    <path fill="none" d="M-2 16V42M4 16V42" stroke="#effafa" stroke-opacity=".4" stroke-width="2"/>
    <path d="M0 54V88Q0 104 22 104H54" fill="none" stroke="#c9e4e6" stroke-opacity=".55" stroke-width="2" stroke-dasharray="3 7"/>
    <circle cx="-13" cy="142" r="5" fill="#1c252a" stroke="#8fa2a7"/>
    <circle cx="13" cy="142" r="5" fill="#1c252a" stroke="#8fa2a7"/>
  </g>`
}

function hospitalBed(x, y, width = 300) {
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="-78" width="12" height="80" rx="4" fill="#3f525a" stroke="#a7b8bc" stroke-opacity=".32"/>
    <rect x="${width - 12}" y="-78" width="12" height="80" rx="4" fill="#3f525a" stroke="#a7b8bc" stroke-opacity=".32"/>
    <rect x="12" y="-40" width="${width - 24}" height="24" rx="10" fill="#dce8e8" opacity=".44"/>
    <path d="M20 -18H${width - 20}V12H20Z" fill="#c9dadb" opacity=".34"/>
    <path d="M20 -18H${width / 2 + 14}V12H20Z" fill="#eef6f4" opacity=".34"/>
    <path d="M30 -34H${width / 2 - 12}V-18H30Z" fill="#f1f6f2" opacity=".52"/>
    <path fill="none" d="M${width - 82} -48H${width - 18}M${width - 82} -48V-16M${width - 48} -48V-16M${width - 18} -48V-16" stroke="#b6c8cb" stroke-width="3"/>
    <path fill="none" d="M42 -33H${width - 26}M42 10H${width - 26}" stroke="#a9bbbe" stroke-opacity=".36" stroke-width="3"/>
    <path fill="none" d="M52 12V46M${width - 52} 12V46M52 46H${width - 52}" stroke="#6d7f85" stroke-width="4"/>
    <circle cx="54" cy="56" r="9" fill="#161d22" stroke="#93a6aa" stroke-width="2"/>
    <circle cx="${width - 54}" cy="56" r="9" fill="#161d22" stroke="#93a6aa" stroke-width="2"/>
  </g>`
}


function studentDesk(x, y, scale = 1, { paper = '#e1d6c1', bag = '#3f514b' } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 0H92L84 12H8Z" fill="#6b5a45" stroke="#c0a37d" stroke-opacity=".3"/>
    <path fill="none" d="M14 12V58M76 12V58" stroke="#292b2c" stroke-width="4"/>
    <path fill="none" d="M8 32H82" stroke="#8a765b" stroke-opacity=".28" stroke-width="2"/>
    <rect x="20" y="-28" width="6" height="28" fill="#2c2e2f"/>
    <rect x="20" y="-42" width="48" height="16" rx="3" fill="${bag}" opacity=".65"/>
    <rect x="30" y="-2" width="46" height="26" rx="2" fill="${paper}" opacity=".7" transform="rotate(-3 53 11)"/>
    <path fill="none" d="M36 8H68M36 15H60" stroke="#7c7262" stroke-opacity=".4" stroke-width="2" transform="rotate(-3 53 11)"/>
    <circle cx="86" cy="40" r="4" fill="#202326" stroke="#8d8170" stroke-opacity=".45"/>
  </g>`
}


function sign(x, y, width, height, value, { accent = '#d9b178', sub = '', icon = '' } = {}) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="${height}" rx="4" fill="#0d161c" stroke="${accent}" stroke-opacity=".55"/>
    <rect x="5" y="5" width="${width - 10}" height="${height - 10}" rx="2" fill="none" stroke="${accent}" stroke-opacity=".18"/>
    ${icon}
    ${label(width / 2, sub ? height / 2 + 1 : height / 2 + 6, value, { size: Math.min(19, height * 0.34), fill: accent, opacity: 0.92 })}
    ${sub ? label(width / 2, height - 9, sub, { size: 9, fill: accent, opacity: 0.55, spacing: 1.4 }) : ''}
  </g>`
}

function monitorScreen(x, y, width, height, inner) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="${height}" rx="5" fill="#101920" stroke="#8fa1a8" stroke-opacity=".4"/>
    <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="2" fill="#09151c"/>
    ${inner}
  </g>`
}

function serverRack(x, y, width, height) {
  const units = 7
  const rows = Array.from({ length: units }, (_, index) => {
    const top = 24 + index * ((height - 40) / units)
    return `<g transform="translate(12 ${top})">
      <rect width="${width - 24}" height="30" rx="2" fill="#111b21" stroke="#7c8d94" stroke-opacity=".28"/>
      <path fill="none" d="M12 9H${width - 52}M12 20H${width - 64}" stroke="#a8bbc1" stroke-opacity=".2" stroke-width="2"/>
      <circle cx="${width - 32}" cy="9" r="3" fill="${index % 2 ? '#8fd0d6' : '#8ec59d'}" opacity=".8"/>
      <circle cx="${width - 22}" cy="20" r="3" fill="${index % 3 ? '#d9b178' : '#d99b93'}" opacity=".65"/>
    </g>`
  }).join('')
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="${height}" rx="5" fill="#0d151a" stroke="#64757d" stroke-opacity=".5"/>
    <rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="#091116" stroke="#3d4d54" stroke-opacity=".5"/>
    ${rows}
    <path fill="none" d="M18 16V${height - 12}M${width - 18} 16V${height - 12}" stroke="#2d3a40" stroke-width="2"/>
  </g>`
}

function designerWall(x, y, width, height) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="${height}" rx="3" fill="#1b1e24" stroke="#8a7c72" stroke-opacity=".32"/>
    <path fill="none" d="M0 ${height * 0.5}H${width}" stroke="#d3c5b1" stroke-opacity=".12"/>
    ${sticky(18, 20, 62, 48, '#d6c9ae', -3)}
    ${sticky(94, 14, 72, 56, '#b9cbc9', 2)}
    ${sticky(180, 24, 58, 50, '#d8b7b0', -1)}
    ${sticky(250, 18, 66, 46, '#c9c0d2', 3)}
    <rect x="22" y="${height * 0.5 + 18}" width="88" height="64" fill="#d8cfbe" opacity=".45" transform="rotate(-2 66 ${height * 0.5 + 50})"/>
    <rect x="124" y="${height * 0.5 + 12}" width="96" height="76" fill="#b7c9c8" opacity=".32" transform="rotate(1 172 ${height * 0.5 + 50})"/>
    <path fill="none" d="M144 ${height * 0.5 + 32}H200M144 ${height * 0.5 + 48}H214M144 ${height * 0.5 + 64}H188" stroke="#566965" stroke-opacity=".5" stroke-width="2"/>
    <circle cx="288" cy="${height * 0.5 + 46}" r="24" fill="none" stroke="#d9b178" stroke-opacity=".5"/>
  </g>`
}

function careerShell(inner, { wash = '#1b1a20', opacity = 0.34, glow = 0.78 } = {}) {
  return `<g clip-path="url(#rightClip)">
    <rect x="806" y="164" width="532" height="502" fill="url(#rightRoom)"/>
    <rect x="806" y="164" width="532" height="502" fill="${wash}" opacity="${opacity}"/>
    <g class="anim glow-drift"><ellipse cx="1110" cy="348" rx="290" ry="268" fill="url(#stageGlow)" opacity="${glow}"/></g>
    <path d="M1080 156H1180L1300 666H884Z" fill="url(#spotlight)" opacity=".7"/>
    <path d="M806 540L1338 504V666H806Z" fill="url(#floor)"/>
    <path fill="none" d="M806 561L1338 523M806 614L1338 567M924 666L1008 524M1150 666L1160 516" stroke="#a392b1" stroke-opacity=".055"/>
    ${inner}
    <rect x="806" y="164" width="532" height="502" fill="url(#glass)" opacity=".12"/>
  </g>`
}

function doctorVariant(variant) {
  if (variant === 1) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="240" fill="#0b2029" opacity=".4"/>
      ${sign(1000, 194, 238, 64, '分 诊', { accent: '#cfe3e4', sub: 'TRIAGE', icon: '<path fill="none" d="M30 32H46M38 24V40" stroke="#d98a86" stroke-width="5" stroke-linecap="round"/>' })}
      <g transform="translate(868 440)">
        <path d="M0 0H396L378 20H18Z" fill="#4d4a44" stroke="#b7a58a" stroke-opacity=".32"/>
        <path d="M18 20H378V106H18Z" fill="#3d3630" opacity=".82"/>
        <path fill="none" d="M36 32H360M36 96H360" stroke="#8f7b62" stroke-opacity=".18" stroke-width="2"/>
        <rect x="44" y="4" width="92" height="54" rx="3" fill="#dce5e2" opacity=".55"/>
        <path fill="none" d="M56 18H120M56 30H104M56 42H112" stroke="#788482" stroke-opacity=".38" stroke-width="2"/>
        <g transform="translate(204 -42)">
          <rect width="100" height="62" rx="4" fill="#111b21" stroke="#8b9ba1" stroke-opacity=".4"/>
          <rect x="6" y="6" width="88" height="42" fill="#0b171d"/>
          ${label(50, 32, 'A037', { size: 17, fill: '#e6bd80', opacity: 0.94, spacing: 1.4 })}
          <path fill="none" d="M50 62V72M32 72H68" stroke="#8b9ba1" stroke-opacity=".35" stroke-width="3"/>
        </g>
      </g>
      `)
  }
  if (variant === 2) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="240" fill="#2a211a" opacity=".36"/>
      ${sign(1004, 192, 236, 58, '值 班 室', { accent: '#e0bc8d', sub: 'ON CALL' })}
      <g transform="translate(824 246)">
        <rect width="164" height="288" rx="4" fill="#18232a" stroke="#79888d" stroke-opacity=".4"/>
        <path fill="none" d="M0 72H164M0 144H164M0 216H164" stroke="#9babad" stroke-opacity=".18" stroke-width="2"/>
        <path fill="none" d="M122 94H142M122 166H142M122 238H142" stroke="#e0bc8d" stroke-opacity=".5" stroke-width="3"/>
      </g>
      <g transform="translate(986 286)">
        <path fill="none" d="M40 -2V-14M16 8L40 -2L64 8" stroke="#c9d5d3" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
        <path d="M18 10H44L60 18L70 34L56 42L48 32V100H18V32L10 42L-4 34L6 18Z" fill="#7fa9a2" opacity=".55" stroke="#c2d4cf" stroke-opacity=".28"/>
        <path fill="none" d="M28 12L38 28L48 12" stroke="#dce7e4" stroke-opacity=".3" stroke-width="2"/>
      </g>
      <g transform="translate(1128 244)">
        <rect width="180" height="284" rx="5" fill="#121c22" stroke="#7d8a8c" stroke-opacity=".45"/>
        <rect x="10" y="12" width="160" height="196" fill="#10252c" stroke="#8fd0d6" stroke-opacity=".22"/>
        <path fill="none" d="M27 52H153M27 90H153M27 128H153" stroke="#8fd0d6" stroke-opacity=".18" stroke-width="3"/>
        <rect x="28" y="36" width="34" height="18" rx="2" fill="#d9b178" opacity=".55"/>
        <rect x="72" y="36" width="34" height="18" rx="2" fill="#c98a80" opacity=".45"/>
        <rect x="116" y="36" width="34" height="18" rx="2" fill="#8fc8c8" opacity=".4"/>
        ${label(90, 226, '咖 啡', { size: 12, fill: '#d9c9ad', opacity: 0.55, spacing: 1.6 })}
      </g>
      <g transform="translate(858 468)">
        <path d="M0 0H244L228 20H16Z" fill="#4a4037" stroke="#b59773" stroke-opacity=".32"/>
        <path fill="none" d="M24 20V96M220 20V96" stroke="#1e1e1f" stroke-width="9"/>
        <path d="M34 4H196L190 20H30Z" fill="#d9d1c0" opacity=".35"/>
      </g>
      <g transform="translate(1004 452)">
        <path fill="none" d="M2 0C2 24 14 34 24 46C34 34 46 24 46 0" stroke="#c3d3d1" stroke-opacity=".55" stroke-width="3"/>
        <path fill="none" d="M24 46V60" stroke="#c3d3d1" stroke-opacity=".45" stroke-width="3"/>
        <circle cx="24" cy="68" r="9" fill="#1b2327" stroke="#a9b9b9" stroke-opacity=".6" stroke-width="2"/>
      </g>
      <g class="anim glow-drift"><ellipse cx="1210" cy="390" rx="120" ry="120" fill="url(#lampGlow)" opacity=".3"/></g>
    `)
  }
  if (variant === 3) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="300" fill="#0a1a24" opacity=".46"/>
      <path fill="none" d="M878 178H1240" stroke="#6e828a" stroke-opacity=".3" stroke-width="5"/>
      <g class="anim blink"><rect x="930" y="188" width="92" height="6" rx="3" fill="#d9edf0" opacity=".3"/></g>
      ${sign(1090, 204, 128, 58, '静', { accent: '#9ccdd2', sub: 'NIGHT WARD' })}
      <g transform="translate(858 236)">
        <path d="M18 22Q42 88 24 226M78 22Q54 96 76 232M150 22Q174 90 156 226M228 22Q204 98 226 232" fill="none" stroke="#a8b9bd" stroke-opacity=".15" stroke-width="13"/>
        ${hospitalBed(54, 198, 198)}
      </g>
      <g transform="translate(1178 292)">
        <rect width="132" height="82" rx="4" fill="#102029" stroke="#89a1a8" stroke-opacity=".4"/>
        <path d="M14 28H36L46 12L58 54L70 32H118" fill="none" stroke="#8fd0d6" stroke-opacity=".7" stroke-width="2.5"/>
        <path fill="none" d="M14 62H118" stroke="#8fd0d6" stroke-opacity=".14"/>
      </g>
      <path fill="none" d="M838 552L1318 526" stroke="#8fa0a5" stroke-opacity=".1" stroke-width="2"/>
    `)
  }
  return ''
}

function teacherVariant(variant) {
  if (variant === 1) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="260" fill="#24301f" opacity=".34"/>
      <rect x="816" y="198" width="212" height="204" rx="3" fill="#1b342b" stroke="#7f8d78" stroke-opacity=".4"/>
      <path fill="none" d="M836 224H1006M836 250H1006M836 276H970M836 324H1006M836 350H982" stroke="#e7e1ca" stroke-opacity=".2" stroke-width="3"/>
      <path d="M852 300C866 280 882 310 898 292" fill="none" stroke="#e7e1ca" stroke-opacity=".24" stroke-width="3"/>
      ${label(1008, 212, '最后一排', { size: 15, fill: '#d9c9ad', opacity: 0.6, anchor: 'end' })}
      <g transform="translate(1040 198)">
        <rect width="286" height="224" rx="3" fill="#0b1720" stroke="#63757d" stroke-opacity=".4"/>
        <path fill="none" d="M0 112H286M143 0V224" stroke="#3c505a" stroke-width="8"/>
        <path fill="none" d="M0 76H286M0 158H286" stroke="#7e9199" stroke-opacity=".1" stroke-width="2"/>
        <g class="anim glow-drift"><ellipse cx="160" cy="120" rx="110" ry="90" fill="url(#stageGlow)" opacity=".32"/></g>
        <path fill="none" d="M30 54H92M176 54H238M30 136H92M176 136H238" stroke="#d8b178" stroke-opacity=".2" stroke-width="2"/>
      </g>
      <path fill="none" d="M842 430H1320" stroke="#8d7b62" stroke-opacity=".22" stroke-width="3"/>
      ${studentDesk(850, 486, 0.95, { bag: '#44552e' })}
      ${studentDesk(960, 480, 0.95, { bag: '#5b4a3e' })}
      ${studentDesk(1070, 474, 0.95, { bag: '#394b50' })}
      ${studentDesk(1180, 468, 0.95, { bag: '#5a4a4a' })}
      ${studentDesk(960, 556, 0.9, { bag: '#4f4432' })}
      ${studentDesk(1070, 550, 0.9, { bag: '#414f45' })}
      <g transform="translate(826 520)">
        <rect width="120" height="46" rx="3" fill="#d8cbb4" opacity=".52" transform="rotate(-3 60 23)"/>
        <path fill="none" d="M12 14H104M12 26H88" stroke="#6d6558" stroke-opacity=".4" stroke-width="2" transform="rotate(-3 60 23)"/>
        <circle cx="126" cy="17" r="10" fill="#b98a72" opacity=".45"/>
      </g>
      <path fill="none" d="M1110 198V224M1130 198V224M1150 198V224" stroke="#d8cfb8" stroke-opacity=".3" stroke-width="7"/>
      <g class="anim blink"><circle cx="1032" cy="282" r="2" fill="#f2ead6" opacity=".55"/><circle cx="1060" cy="340" r="2" fill="#f2ead6" opacity=".4"/><circle cx="906" cy="372" r="2" fill="#f2ead6" opacity=".45"/></g>`)
  }
  if (variant === 2) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="280" fill="#2b2b20" opacity=".34"/>
      ${sign(1040, 190, 220, 56, '教 师 办 公 室', { accent: '#d9c5a2', sub: 'FACULTY ROOM' })}
      <g transform="translate(824 254)">
        <rect width="320" height="178" rx="4" fill="#493b2c" stroke="#a28a68" stroke-opacity=".4"/>
        <rect x="10" y="10" width="300" height="158" fill="#2b261f" stroke="#8d7a5f" stroke-opacity=".22"/>
        ${sticky(28, 26, 68, 52, '#d8c9a9', -3)}
        ${sticky(108, 20, 58, 46, '#b9c9b6', 2)}
        ${sticky(180, 28, 74, 50, '#d7b9ad', -1)}
        <rect x="28" y="96" width="86" height="58" fill="#cfc3ae" opacity=".46" transform="rotate(-2 71 125)"/>
        <path fill="none" d="M38 112H102M38 126H88" stroke="#746a5a" stroke-opacity=".4" stroke-width="2"/>
        <g transform="translate(136 98)">
          <rect width="86" height="58" fill="#c7d0c8" opacity=".38"/>
          <circle cx="22" cy="20" r="8" fill="#8b9b8b" opacity=".5"/>
          <circle cx="48" cy="20" r="8" fill="#a7a18c" opacity=".5"/>
          <circle cx="72" cy="20" r="8" fill="#988d9e" opacity=".5"/>
        </g>
        <path fill="none" d="M238 104H298M238 118H286M238 132H294" stroke="#d5c7af" stroke-opacity=".3" stroke-width="2"/>
        <circle cx="292" cy="32" r="16" fill="none" stroke="#d0b17f" stroke-opacity=".4"/>
      </g>
      <g transform="translate(840 468)">
        <path d="M0 0H470L448 24H18Z" fill="#5a4836" stroke="#b1946d" stroke-opacity=".34"/>
        <path fill="none" d="M28 24V118M440 24V118" stroke="#211f1d" stroke-width="11"/>
        <path d="M40 8H168L162 24H46Z" fill="#e1d7c4" opacity=".7"/>
        <path fill="none" d="M50 16H156M50 28H142M50 40H150" stroke="#786e5e" stroke-opacity=".45" stroke-width="2"/>
        <path d="M166 6H292L286 24H172Z" fill="#d5c9b5" opacity=".62"/>
        <path fill="none" d="M176 14H282M176 26H270" stroke="#776c5c" stroke-opacity=".4" stroke-width="2"/>
        <g transform="translate(316 4)">
          <rect width="94" height="64" rx="3" fill="#d8ccb8" opacity=".6"/>
          <path fill="none" d="M12 14H82M12 28H82M12 42H60" stroke="#766b5b" stroke-opacity=".45" stroke-width="2"/>
          <path d="M58 36L68 46L84 22" fill="none" stroke="#b4685d" stroke-opacity=".7" stroke-width="3"/>
        </g>
        <g transform="translate(426 0)">
          <path d="M0 0H74L68 14H6Z" fill="#3f3124"/>
          <rect x="10" y="14" width="54" height="28" rx="2" fill="#d7c9ad" opacity=".45"/>
          <path fill="none" d="M18 24H56M18 32H44" stroke="#7b6d59" stroke-opacity=".4" stroke-width="2"/>
        </g>
        ${cup(388, 12, 1.15, '#d9c6a9')}
        <g transform="translate(260 12)">
          <rect width="38" height="48" rx="3" fill="#232a2b"/>
          <path fill="none" d="M8 10H30M8 20H26M8 30H18" stroke="#d9c7a8" stroke-opacity=".3" stroke-width="2"/>
        </g>
      </g>
      <g transform="translate(1180 492)">
        <path d="M0 0H118L108 18H8Z" fill="#3e3329"/>
        <path fill="none" d="M18 18V90M98 18V90" stroke="#1f1e1d" stroke-width="8"/>
        <g transform="translate(28 2)">
          <rect width="62" height="78" rx="3" fill="#d4c7b1" opacity=".4"/>
          <path fill="none" d="M10 12H52M10 26H52M10 40H38" stroke="#766b5b" stroke-opacity=".4" stroke-width="2"/>
        </g>
      </g>
      <g transform="translate(1262 210)">
        <rect width="54" height="74" rx="3" fill="#d6c7aa" opacity=".3"/>
        <path fill="none" d="M10 18H44M10 30H44M10 42H34" stroke="#766b5b" stroke-opacity=".4" stroke-width="2"/>
      </g>
      <g class="anim glow-drift"><ellipse cx="1080" cy="430" rx="130" ry="100" fill="url(#lampGlow)" opacity=".3"/></g>`)
  }
  if (variant === 3) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="300" fill="#1d2a23" opacity=".4"/>
      <path d="M806 220L1338 330V666H806Z" fill="#121a17" opacity=".5"/>
      <path fill="none" d="M806 260L1338 354M806 360L1338 420M806 470L1338 492" stroke="#93a39a" stroke-opacity=".1"/>
      <g transform="translate(816 240)">
        <rect width="210" height="260" rx="4" fill="#24312b" stroke="#76867a" stroke-opacity=".42"/>
        <path fill="none" d="M0 86H210M0 172H210" stroke="#9aa89b" stroke-opacity=".16"/>
        <path fill="none" d="M22 18V68M68 18V68M114 18V68M160 18V68" stroke="#59675d" stroke-width="4"/>
        <path fill="none" d="M26 44H64M72 44H110M118 44H156M164 44H196" stroke="#b5c0b2" stroke-opacity=".26" stroke-width="4"/>
        <rect x="108" y="92" width="76" height="44" rx="3" fill="#101a17"/>
        <path fill="none" d="M118 104H174M118 116H158" stroke="#d5c6a8" stroke-opacity=".32" stroke-width="2"/>
      </g>
      <g transform="translate(1036 214)">
        <rect width="284" height="260" rx="4" fill="#223029" stroke="#7d8c80" stroke-opacity=".45"/>
        <rect x="18" y="20" width="248" height="52" rx="2" fill="#d8cfbb" opacity=".65"/>
        ${label(142, 46, '高 一（3）班', { size: 20, fill: '#4d544c', opacity: 0.9, spacing: 2.2 })}
        <path fill="none" d="M24 112H260M24 138H260M24 164H218" stroke="#c9c0aa" stroke-opacity=".24" stroke-width="3"/>
        <path fill="none" d="M24 200H128M150 200H244M24 220H160M182 220H252" stroke="#a9b3a7" stroke-opacity=".2" stroke-width="2"/>
        <g transform="translate(200 88)">
          <rect width="66" height="80" rx="2" fill="#d6c9b3" opacity=".45"/>
          <path fill="none" d="M10 14H56M10 28H56M10 42H44M10 56H52" stroke="#756a59" stroke-opacity=".4" stroke-width="2"/>
          <path fill="none" d="M48 62L54 68L62 56" stroke="#b36a5f" stroke-opacity=".65" stroke-width="2"/>
        </g>
        <rect x="96" y="110" width="10" height="10" rx="2" fill="#8ba8a0" opacity=".7"/>
        <rect x="122" y="110" width="10" height="10" rx="2" fill="#c9a472" opacity=".6"/>
        <path fill="none" d="M12 20V246M264 20V246" stroke="#94a397" stroke-opacity=".2" stroke-width="3"/>
        <circle cx="265" cy="168" r="5" fill="#c9b593" opacity=".6"/>
        <rect x="28" y="230" width="228" height="10" rx="2" fill="#8d9b8d" opacity=".2"/>
        <path fill="none" d="M0 260H284" stroke="#8c9b8d" stroke-opacity=".28" stroke-width="4"/>
      </g>
      <path d="M1036 474H1322L1300 496H1056Z" fill="#394239" stroke="#8f9b8d" stroke-opacity=".28"/>
      <g transform="translate(1082 496)">
        <rect width="158" height="76" rx="3" fill="#1c2621"/>
        <path fill="none" d="M18 18H140M18 32H120M18 46H136" stroke="#d8cfbb" stroke-opacity=".2" stroke-width="2"/>
      </g>
      <path fill="none" d="M824 536H980" stroke="#7d8b80" stroke-opacity=".3" stroke-width="4"/>
      <g transform="translate(888 540)">
        <path d="M0 0H58L52 40H6Z" fill="#3a4640"/>
        <path d="M10 6H48L44 32H14Z" fill="#a9b5a8" opacity=".28"/>
        <path fill="none" d="M58 14L82 0M58 24H84" stroke="#c7b596" stroke-opacity=".32" stroke-width="3"/>
      </g>
      <g transform="translate(1144 412)">
        <path d="M0 0H118L108 18H10Z" fill="#3e382e"/>
        <path fill="none" d="M18 18V74M100 18V74" stroke="#1f211f" stroke-width="7"/>
        <path fill="none" d="M26 4H94" stroke="#b6a98f" stroke-opacity=".3" stroke-width="3"/>
      </g>
      <g class="anim blink"><circle cx="1012" cy="250" r="2" fill="#e6ddc6" opacity=".5"/><circle cx="1262" cy="300" r="2" fill="#e6ddc6" opacity=".4"/></g>`)
  }
  return ''
}

function designerVariant(variant) {
  if (variant === 1) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="276" fill="#261d29" opacity=".38"/>
      ${designerWall(824, 198, 500, 238)}
      <g transform="translate(1068 208)">
        <rect width="112" height="30" rx="2" fill="#d9b178" opacity=".18"/>
        ${label(56, 20, '第 12 版', { size: 15, fill: '#e1c69d', opacity: 0.8, spacing: 1.2 })}
      </g>
      <path d="M846 426H1316L1296 448H866Z" fill="#4a3f38" stroke="#a08a70" stroke-opacity=".28"/>
      <path fill="none" d="M884 448V556M1280 448V556" stroke="#1b1d20" stroke-width="10"/>
      <g transform="translate(900 452)">
        <rect width="164" height="106" rx="4" fill="#101a20" stroke="#7d8b93" stroke-opacity=".4"/>
        <rect x="8" y="8" width="148" height="90" fill="#0b1920"/>
        <path fill="none" d="M24 26H136M24 42H116M24 58H130M24 74H98" stroke="#8fd0d6" stroke-opacity=".24" stroke-width="2"/>
        <rect x="24" y="84" width="22" height="8" fill="#c98370" opacity=".5"/>
        <rect x="52" y="84" width="22" height="8" fill="#8fb6a0" opacity=".45"/>
        <rect x="80" y="84" width="22" height="8" fill="#a292b8" opacity=".4"/>
      </g>
      ${tablet(1102, 468, { w: 142, h: 88, rotate: -3 })}
      ${colorFan(1262, 470, 1.1, 5)}
      ${cup(1030, 486, 1.15, '#d9c5a8')}
      <g transform="translate(872 480) rotate(-5)">
        <rect width="70" height="90" fill="#e0d5c2" opacity=".5"/>
        <path fill="none" d="M10 16H58M10 30H58M10 44H42" stroke="#746c60" stroke-opacity=".4" stroke-width="2"/>
      </g>
      <path fill="none" d="M1228 208V300M1272 210V316" stroke="#8d7a68" stroke-opacity=".3" stroke-width="2"/>
      <g class="anim glow-drift"><ellipse cx="1070" cy="400" rx="160" ry="110" fill="url(#stageGlow)" opacity=".3"/></g>`)
  }
  if (variant === 2) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="300" fill="#101d28" opacity=".48"/>
      <path d="M806 470L1338 452V666H806Z" fill="#0e1216" opacity=".4"/>
      <g class="anim glow-drift"><ellipse cx="1108" cy="330" rx="210" ry="180" fill="url(#stageGlow)" opacity=".5"/></g>
      <g transform="translate(942 214)">
        <rect width="300" height="216" rx="6" fill="#0e171d" stroke="#87979e" stroke-opacity=".45"/>
        <rect x="8" y="8" width="284" height="200" rx="2" fill="#08141a"/>
        <rect x="8" y="8" width="284" height="22" fill="#101f28"/>
        <circle cx="22" cy="19" r="3" fill="#c98370" opacity=".7"/><circle cx="34" cy="19" r="3" fill="#d9b178" opacity=".7"/><circle cx="46" cy="19" r="3" fill="#8fb6a0" opacity=".7"/>
        <rect x="14" y="38" width="26" height="160" fill="#0c1a22"/>
        <path fill="none" d="M20 50H34M20 64H34M20 78H34M20 92H34M20 106H34" stroke="#8fd0d6" stroke-opacity=".25" stroke-width="3"/>
        <rect x="52" y="48" width="158" height="112" fill="#0e2630" stroke="#8fd0d6" stroke-opacity=".3"/>
        <rect x="66" y="62" width="128" height="82" fill="#e0d6c4" opacity=".8"/>
        <path fill="none" d="M78 76H118M78 90H118" stroke="#7d7466" stroke-opacity=".5" stroke-width="2"/>
        <text x="132" y="102" font-family="${FONT}" font-size="28" font-weight="700" fill="#4b4540" fill-opacity=".78">Aa</text>
        <rect x="132" y="112" width="24" height="12" fill="#c98370" opacity=".6"/>
        <rect x="160" y="112" width="16" height="12" fill="#8fb6a0" opacity=".5"/>
        <circle cx="166" cy="132" r="8" fill="#c98370" opacity=".55"/>
        <rect x="222" y="42" width="60" height="164" fill="#0b1820"/>
        <path fill="none" d="M232 56H272M232 70H272M232 84H254M232 110H272M232 124H264" stroke="#d5c8b4" stroke-opacity=".2" stroke-width="2"/>
        <rect x="232" y="144" width="14" height="14" fill="#c98370" opacity=".5"/><rect x="250" y="144" width="14" height="14" fill="#8fd0d6" opacity=".4"/>
        <path fill="none" d="M52 172H212" stroke="#d9b178" stroke-opacity=".35" stroke-width="3"/>
        <circle cx="72" cy="172" r="5" fill="#c98370"/><circle cx="90" cy="172" r="5" fill="#8fb6a0"/><circle cx="108" cy="172" r="5" fill="#8fd0d6"/>
        <path fill="none" d="M1092 430V470M1042 470H1142" stroke="#8b9a9f" stroke-width="4"/>
      </g>
      ${label(1234, 224, '01:12', { size: 18, fill: '#9db6bd', opacity: 0.5, anchor: 'end', spacing: 1 })}
      <path d="M846 486H1318L1298 510H866Z" fill="#403733" stroke="#9b7f66" stroke-opacity=".26"/>
      <path fill="none" d="M884 510V608M1280 510V608" stroke="#191b1e" stroke-width="11"/>
      ${tablet(1000, 500, { w: 132, h: 78, rotate: -2, accent: '#8fd0d6' })}
      ${cup(1188, 500, 1.1, '#c8b79e')}
      <g transform="translate(1208 540) rotate(6)">
        <path d="M0 0L28 8L20 32L-8 24Z" fill="#d9d2c4" opacity=".4"/>
      </g>
      <g transform="translate(900 500) rotate(-8)">
        <path d="M0 0H58L52 42H-6Z" fill="#d9d0c0" opacity=".34"/>
        <path fill="none" d="M8 12H46M8 24H38" stroke="#736b60" stroke-opacity=".35" stroke-width="2"/>
      </g>`)
  }
  if (variant === 3) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="250" fill="#30261e" opacity=".38"/>
      <path fill="none" d="M824 206H1318" stroke="#8d7963" stroke-opacity=".3" stroke-width="4"/>
      ${sticky(842, 224, 74, 60, '#d8c8aa', -3)}
      ${sticky(930, 214, 88, 66, '#b9c9c5', 2)}
      ${sticky(1032, 226, 70, 56, '#d7b8b0', -1)}
      ${sticky(1118, 216, 92, 62, '#cac1d3', 3)}
      <g transform="translate(1238 208)">
        <rect width="76" height="82" rx="2" fill="#d9cfbd" opacity=".42"/>
        <path fill="none" d="M10 14H66M10 28H66M10 42H46M10 56H60" stroke="#756b5b" stroke-opacity=".4" stroke-width="2"/>
      </g>
      <g transform="translate(834 438)">
        <path d="M0 22L410 0L432 76L18 102Z" fill="#4a3d32" stroke="#b1936c" stroke-opacity=".35"/>
        <path d="M18 32L402 13L418 68L34 88Z" fill="#2b2723"/>
        <g transform="translate(88 18) rotate(-2)">
          <rect width="236" height="66" fill="#e2d8c6" opacity=".78"/>
          <path fill="none" d="M18 16H218M18 28H218M18 40H164" stroke="#7d7465" stroke-opacity=".45" stroke-width="2"/>
          <path d="M28 54C52 38 70 62 92 48C112 36 132 60 152 46" fill="none" stroke="#a67560" stroke-opacity=".45" stroke-width="2"/>
          <rect x="188" y="12" width="30" height="18" fill="#c98370" opacity=".5"/>
          <rect x="188" y="34" width="30" height="18" fill="#8fb6a0" opacity=".45"/>
        </g>
        <g transform="translate(336 8)">
          <rect width="18" height="74" fill="#c39a67" transform="rotate(8 9 37)"/>
          <path d="M2 74L0 92L9 88Z" fill="#e1c294"/>
        </g>
        <g transform="translate(360 16)">
          <rect width="15" height="66" fill="#8f6b58" transform="rotate(-6 7 33)"/>
          <path d="M1 66L0 82L8 78Z" fill="#d4ad84"/>
        </g>
        ${colorFan(380, 4, 0.9, 4)}
        <path fill="none" d="M18 32L402 13" stroke="#c4ab86" stroke-opacity=".25" stroke-width="2"/>
        <path fill="none" d="M84 102V162M374 84V144" stroke="#26211d" stroke-width="10"/>
      </g>
      <g transform="translate(856 474)">
        <path d="M0 0H84L76 18H8Z" fill="#3c3128"/>
        <path fill="none" d="M14 18V84M70 18V84" stroke="#201e1c" stroke-width="7"/>
        ${tablet(4, -72, { w: 70, h: 52, rotate: -7, accent: '#8fd0d6' })}
      </g>
      <g transform="translate(1214 418)">
        <rect width="78" height="70" rx="2" fill="#d9cfbd" opacity=".32"/>
        <path fill="none" d="M10 14H68M10 28H68M10 42H44" stroke="#756b5b" stroke-opacity=".4" stroke-width="2"/>
      </g>
      <g class="anim glow-drift"><ellipse cx="1140" cy="402" rx="170" ry="120" fill="url(#lampGlow)" opacity=".32"/></g>`)
  }
  return ''
}

function founderVariant(variant) {
  if (variant === 1) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="280" fill="#2c251b" opacity=".38"/>
      <g transform="translate(830 196)">
        <rect width="454" height="222" rx="4" fill="#d9d7cd" opacity=".78" stroke="#e4e7df" stroke-opacity=".32"/>
        <path fill="none" d="M24 36H424M24 58H424M24 80H352" stroke="#727a73" stroke-opacity=".36" stroke-width="3"/>
        <path d="M48 190L120 168L190 176L260 130L330 108L404 62" fill="none" stroke="#b06e62" stroke-opacity=".75" stroke-width="6" stroke-linecap="round"/>
        <path fill="none" d="M48 190L120 168L190 176L260 130L330 108L404 62" stroke="#e7c7ad" stroke-opacity=".35" stroke-width="2"/>
        ${sticky(42, 94, 82, 54, '#d9b178', -2)}
        ${sticky(138, 88, 76, 52, '#b9cabb', 2)}
        ${sticky(230, 96, 88, 54, '#c9b7ce', -1)}
        ${label(350, 32, '本周', { size: 13, fill: '#626d65', opacity: 0.7, anchor: 'start' })}
        ${label(350, 50, '上线', { size: 13, fill: '#626d65', opacity: 0.7, anchor: 'start' })}
        ${label(350, 68, '复盘', { size: 13, fill: '#626d65', opacity: 0.7, anchor: 'start' })}
        <rect x="34" y="170" width="12" height="36" fill="#d9b178" opacity=".7"/>
        <rect x="52" y="174" width="12" height="32" fill="#b9cabb" opacity=".6"/>
        <rect x="70" y="178" width="12" height="28" fill="#c9b7ce" opacity=".55"/>
      </g>
      <g transform="translate(880 440)">
        <path d="M0 0H470L448 22H18Z" fill="#4e4439" stroke="#ac9372" stroke-opacity=".32"/>
        <path fill="none" d="M26 22V110M442 22V110" stroke="#1e1e1f" stroke-width="10"/>
        ${laptop(38, -62, { w: 108, h: 62, accent: '#8fd0d6', rotate: -3 })}
        ${laptop(184, -60, { w: 108, h: 62, accent: '#d9b178', rotate: 2 })}
        ${laptop(330, -64, { w: 108, h: 62, accent: '#9fc4a5', rotate: -1 })}
        ${cup(154, 2, 1.05, '#d9c5a8')}
        ${cup(304, 4, 1.05, '#cfbca0')}
        <path fill="none" d="M136 6V28M270 8V30" stroke="#8f8270" stroke-opacity=".35" stroke-width="2"/>
      </g>
      <g transform="translate(1188 472)">
        <path d="M0 0H112L104 18H8Z" fill="#3d3832"/>
        <path fill="none" d="M16 18V88M94 18V88" stroke="#1d1e20" stroke-width="8"/>
        <path d="M24 2H90L84 18H30Z" fill="#c9d0c5" opacity=".35"/>
      </g>
      <g transform="translate(832 468)">
        <rect width="42" height="42" rx="3" fill="#1a2a30"/>
        <path fill="none" d="M8 9H34M8 18H34M8 27H26" stroke="#8fd0d6" stroke-opacity=".3" stroke-width="2"/>
        <circle cx="21" cy="37" r="3" fill="#ddb47d" opacity=".7"/>
      </g>
      <g class="anim glow-drift"><ellipse cx="1210" cy="414" rx="100" ry="88" fill="url(#lampGlow)" opacity=".3"/></g>`)
  }
  if (variant === 2) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="310" fill="#15222b" opacity=".42"/>
      <g transform="translate(1042 198)">
        <rect width="286" height="246" rx="3" fill="#0b1720" stroke="#64757d" stroke-opacity=".4"/>
        <path fill="none" d="M0 124H286M143 0V246" stroke="#3c505a" stroke-width="8"/>
        <path fill="none" d="M0 62H286M0 186H286" stroke="#8fa1a8" stroke-opacity=".1"/>
        <g class="anim glow-drift"><ellipse cx="164" cy="130" rx="120" ry="100" fill="url(#stageGlow)" opacity=".28"/></g>
        <path fill="none" d="M28 44H92M190 44H258M28 146H92M190 146H258" stroke="#d9b178" stroke-opacity=".18" stroke-width="2"/>
      </g>
      <g transform="translate(826 210)">
        <rect width="180" height="176" rx="3" fill="#d7d5cb" opacity=".66" stroke="#e3e6df" stroke-opacity=".25"/>
        <path fill="none" d="M18 28H160M18 48H160M18 68H128" stroke="#727a73" stroke-opacity=".34" stroke-width="3"/>
        <path d="M22 140L64 122L106 128L148 88" fill="none" stroke="#b06e62" stroke-opacity=".65" stroke-width="4"/>
        ${sticky(22, 84, 58, 40, '#d9b178', -2)}
        ${sticky(92, 80, 54, 38, '#b9cabb', 2)}
        ${label(106, 164, 'MVP', { size: 14, fill: '#5d665f', opacity: 0.78, weight: 700, spacing: 1.2 })}
        ${label(54, 164, '第 2 周', { size: 11, fill: '#707870', opacity: 0.62 })}
      </g>
      <path d="M860 474H1322L1302 498H880Z" fill="#4c4239" stroke="#a78e6f" stroke-opacity=".3"/>
      <path fill="none" d="M896 498V606M1288 498V606" stroke="#1d1e20" stroke-width="11"/>
      ${laptop(916, 410, { w: 116, h: 68, accent: '#8fd0d6', rotate: -3 })}
      ${laptop(1076, 408, { w: 116, h: 68, accent: '#d9b178', rotate: 2 })}
      ${cup(1036, 466, 1.1, '#d9c5a8')}
      ${cup(1222, 468, 1.1, '#cbb89e')}
      <path d="M1000 486C1024 476 1048 492 1068 482" fill="none" stroke="#9b8c78" stroke-opacity=".3" stroke-width="2"/>
      <g transform="translate(832 492)">
        <path d="M0 0H74L68 16H6Z" fill="#3d3731"/>
        <path fill="none" d="M12 16V68M60 16V68" stroke="#1e1f20" stroke-width="7"/>
        <path fill="none" d="M18 2H54" stroke="#c4b295" stroke-opacity=".3" stroke-width="3"/>
      </g>
      <g transform="translate(1272 420)">
        <path d="M0 0H32V76H0Z" fill="#283238" opacity=".7"/>
        <path fill="none" d="M8 10H24M8 22H24M8 34H24" stroke="#8fd0d6" stroke-opacity=".25" stroke-width="2"/>
      </g>
      <g transform="translate(1192 514)">
        <rect width="72" height="54" rx="2" fill="#665741" stroke="#b1946d" stroke-opacity=".28"/>
        <path fill="none" d="M36 0V54" stroke="#c3aa84" stroke-opacity=".35" stroke-width="3"/>
        <path fill="none" d="M8 16H64M8 24H44" stroke="#3f382e" stroke-opacity=".45" stroke-width="2"/>
        <rect x="52" y="-38" width="58" height="38" rx="2" fill="#75644d" stroke="#b1946d" stroke-opacity=".24"/>
        <path fill="none" d="M81 -38V0" stroke="#c3aa84" stroke-opacity=".28" stroke-width="3"/>
      </g>
      <g class="anim blink"><circle cx="1108" cy="338" r="2" fill="#e6ddc6" opacity=".45"/><circle cx="1200" cy="300" r="2" fill="#e6ddc6" opacity=".4"/></g>`)
  }
  if (variant === 3) {
    return careerShell(`
      <rect x="806" y="164" width="532" height="300" fill="#101d22" opacity=".46"/>
      ${serverRack(824, 202, 176, 332)}
      ${label(912, 194, '机柜 A · 03', { size: 13, fill: '#9db9bd', opacity: 0.58, spacing: 1.2 })}
      <g transform="translate(1028 198)">
        <rect width="264" height="212" rx="4" fill="#d8d6cc" opacity=".72" stroke="#e4e7df" stroke-opacity=".28"/>
        <path fill="none" d="M20 32H242M20 54H242M20 76H198" stroke="#727a73" stroke-opacity=".32" stroke-width="3"/>
        ${label(86, 106, '上线检查', { size: 15, fill: '#5f6a62', opacity: 0.75, anchor: 'start' })}
        <path d="M78 120L86 128L102 108M78 146L86 154L102 134M78 172L86 180L102 160" fill="none" stroke="#a96d61" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
        <path fill="none" d="M120 126H246M120 152H228M120 178H238" stroke="#6d766f" stroke-opacity=".3" stroke-width="2"/>
        ${sticky(210, 92, 46, 34, '#d9b178', 4)}
      </g>
      <path d="M1024 450H1322L1300 472H1044Z" fill="#3f3d38" stroke="#9b8a70" stroke-opacity=".3"/>
      <path fill="none" d="M1054 472V570M1292 472V570" stroke="#1b1d1e" stroke-width="10"/>
      <g transform="translate(1080 438)">
        <rect x="6" width="142" height="82" rx="4" fill="#141a1f" stroke="#84949a" stroke-opacity=".42"/>
        <rect x="12" y="5" width="130" height="70" fill="#081510"/>
        <path fill="none" d="M22 22H66M22 34H112M22 46H88M22 58H120" stroke="#8ec59d" stroke-opacity=".55" stroke-width="2"/>
        <path d="M0 82H164L154 94H10Z" fill="#292c2f"/>
      </g>
      ${cup(1242, 448, 1.05, '#cdbb9f')}
      <path fill="none" d="M1108 452H1160M1180 452H1232" stroke="#8f8270" stroke-opacity=".3" stroke-width="2"/>
      <g transform="translate(844 548)">
        <path d="M0 0H90L82 18H8Z" fill="#383530"/>
        <path fill="none" d="M14 18V76M76 18V76" stroke="#1c1d1f" stroke-width="7"/>
        <path fill="none" d="M22 2H70" stroke="#c6b394" stroke-opacity=".3" stroke-width="3"/>
      </g>
      <g class="anim blink"><circle cx="956" cy="222" r="2" fill="#8fd0d6" opacity=".55"/><circle cx="956" cy="292" r="2" fill="#9fc4a5" opacity=".5"/><circle cx="956" cy="362" r="2" fill="#d9b178" opacity=".5"/></g>`)
  }
  return ''
}

function sceneArt(kind, variant) {
  if (kind === 'doctor') {
    if (variant > 0) return doctorVariant(variant)
    return `
      <rect x="806" y="164" width="532" height="240" fill="#0a222c" opacity=".44"/>
      <g class="anim glow-drift"><ellipse cx="1120" cy="330" rx="150" ry="140" fill="url(#stageGlow)" opacity=".32"/></g>
      ${sign(1118, 198, 112, 122, '急诊', { accent: '#e0a09b', sub: 'ER', icon: '<path fill="none" d="M56 22V40M47 31H65" stroke="#dd9b95" stroke-width="7" stroke-linecap="round"/>' })}
      ${monitorScreen(1152, 344, 140, 88, `
        <path d="M14 56H30L38 32L48 68L58 46L70 56H122" fill="none" stroke="#8fd0d6" stroke-opacity=".8" stroke-width="2.5"/>
      `)}
      <g transform="translate(916 430)">
        ${hospitalBed(0, 40, 280)}
      </g>
      ${ivPole(886, 286)}
      <path fill="none" d="M838 552L1318 526" stroke="#9db1b5" stroke-opacity=".08" stroke-width="2"/>`
  }
  if (kind === 'teacher') {
    if (variant > 0) return teacherVariant(variant)
    return `
      <rect x="806" y="164" width="532" height="270" fill="#203022" opacity=".4"/>
      <g transform="translate(830 198)">
        <rect width="354" height="210" rx="4" fill="#1e3b31" stroke="#8a947d" stroke-opacity=".45"/>
        <rect x="10" y="10" width="334" height="190" fill="#203e34"/>
        <path fill="none" d="M24 32H330M24 58H330M24 84H286" stroke="#e8e1ca" stroke-opacity=".16" stroke-width="3"/>
        ${label(100, 110, 'a² + b² = c²', { size: 19, fill: '#eee6cf', opacity: 0.72, spacing: 1 })}
        ${label(92, 170, '明天默写', { size: 13, fill: '#e4dcc4', opacity: 0.48 })}
        <path d="M244 120L268 104L292 128M268 104V158M292 128V158" fill="none" stroke="#e4dcc4" stroke-opacity=".22" stroke-width="3"/>
        <path fill="none" d="M36 182H132M150 182H210" stroke="#e4dcc4" stroke-opacity=".18" stroke-width="3"/>
        <path fill="none" d="M0 210H354" stroke="#9c825d" stroke-opacity=".6" stroke-width="8"/>
        <path fill="none" d="M0 210H354" stroke="#d7bd91" stroke-opacity=".3" stroke-width="2"/>
      </g>
      <rect x="1184" y="198" width="116" height="40" rx="3" fill="#d9d0bd" opacity=".38"/>
      ${label(1242, 224, '离高考 200 天', { size: 13, fill: '#403d35', opacity: 0.85 })}
      ${wallClock(1276, 286, 25, { face: '#d7cebb' })}
      <path fill="none" d="M860 424H1320" stroke="#8c7b61" stroke-opacity=".22" stroke-width="3"/>
      ${studentDesk(846, 486, 0.94, { bag: '#4d5739' })}
      ${studentDesk(960, 480, 0.94, { bag: '#55413c' })}
      ${studentDesk(1074, 474, 0.94, { bag: '#354d50' })}
      ${studentDesk(1188, 468, 0.94, { bag: '#57484a' })}
      ${studentDesk(960, 552, 0.9, { bag: '#444f3b' })}
      ${studentDesk(1074, 546, 0.9, { bag: '#4a3e3a' })}
      <g transform="translate(836 522)">
        <rect width="126" height="50" rx="3" fill="#d8cbb4" opacity=".55" transform="rotate(-3 63 25)"/>
        <path fill="none" d="M14 16H110M14 28H94" stroke="#6f675a" stroke-opacity=".42" stroke-width="2" transform="rotate(-3 63 25)"/>
        <circle cx="132" cy="18" r="11" fill="#b38367" opacity=".5"/>
      </g>
      <g transform="translate(1116 194)">
        <path fill="none" d="M0 0V24M18 0V24M36 0V24" stroke="#d8cfb8" stroke-opacity=".28" stroke-width="7"/>
      </g>
      <g class="anim blink"><circle cx="936" cy="246" r="2" fill="#f2ead6" opacity=".55"/><circle cx="1040" cy="330" r="2" fill="#f2ead6" opacity=".4"/><circle cx="964" cy="374" r="2" fill="#f2ead6" opacity=".45"/></g>`
  }
  if (kind === 'designer') {
    if (variant > 0) return designerVariant(variant)
    return `
      <rect x="806" y="164" width="532" height="260" fill="#261c2b" opacity=".38"/>
      <g transform="translate(856 198)">
        <rect width="104" height="156" rx="3" fill="#e0d5c2" opacity=".42"/>
        <path fill="none" d="M14 22H90M14 38H90M14 54H66" stroke="#766d60" stroke-opacity=".4" stroke-width="2"/>
        <circle cx="30" cy="96" r="18" fill="#c98370" opacity=".6"/>
        <rect x="58" y="78" width="32" height="32" fill="#8fb6a0" opacity=".55"/>
        <path fill="none" d="M20 132H84" stroke="#8e826f" stroke-opacity=".4" stroke-width="3"/>
      </g>
      <g transform="translate(974 210)">
        <rect width="270" height="202" rx="6" fill="#0e171d" stroke="#87979e" stroke-opacity=".45"/>
        <rect x="8" y="8" width="254" height="186" rx="2" fill="#08141a"/>
        <rect x="8" y="8" width="254" height="20" fill="#101f28"/>
        <circle cx="20" cy="18" r="3" fill="#c98370" opacity=".7"/><circle cx="31" cy="18" r="3" fill="#d9b178" opacity=".7"/><circle cx="42" cy="18" r="3" fill="#8fb6a0" opacity=".7"/>
        <rect x="14" y="36" width="22" height="150" fill="#0c1a22"/>
        <path fill="none" d="M19 48H31M19 60H31M19 72H31M19 84H31M19 96H31" stroke="#8fd0d6" stroke-opacity=".26" stroke-width="3"/>
        <rect x="46" y="44" width="146" height="106" fill="#0d2630" stroke="#8fd0d6" stroke-opacity=".3"/>
        <rect x="58" y="56" width="122" height="80" fill="#dfd5c3" opacity=".86"/>
        <text x="112" y="92" font-family="${FONT}" font-size="30" font-weight="700" fill="#4b4540" fill-opacity=".78">Aa</text>
        <rect x="112" y="106" width="30" height="16" fill="#c98370" opacity=".6"/>
        <rect x="148" y="106" width="18" height="16" fill="#8fb6a0" opacity=".55"/>
        <path fill="none" d="M122 58H172M122 68H162" stroke="#766d60" stroke-opacity=".35" stroke-width="2"/>
        <rect x="202" y="40" width="52" height="150" fill="#0b1820"/>
        <path fill="none" d="M212 54H244M212 68H244M212 82H226M212 104H244M212 118H236" stroke="#d5c8b4" stroke-opacity=".2" stroke-width="2"/>
        <rect x="212" y="138" width="12" height="12" fill="#c98370" opacity=".55"/><rect x="228" y="138" width="12" height="12" fill="#8fd0d6" opacity=".45"/><rect x="244" y="138" width="10" height="12" fill="#d9b178" opacity=".45"/>
        <path fill="none" d="M46 162H194" stroke="#d9b178" stroke-opacity=".35" stroke-width="3"/>
        <circle cx="60" cy="162" r="4" fill="#c98370"/><circle cx="76" cy="162" r="4" fill="#8fb6a0"/><circle cx="92" cy="162" r="4" fill="#8fd0d6"/><circle cx="108" cy="162" r="4" fill="#d9b178"/>
        <path fill="none" d="M1134 412V454M1088 454H1180" stroke="#8b9a9f" stroke-width="4"/>
      </g>
      <path d="M842 486H1320L1300 510H862Z" fill="#493c33" stroke="#a4876b" stroke-opacity=".28"/>
      <path fill="none" d="M878 510V608M1284 510V608" stroke="#1a1c1f" stroke-width="11"/>
      ${tablet(960, 498, { w: 148, h: 82, rotate: -3 })}
      ${colorFan(1188, 496, 1.1, 4)}
      ${cup(1130, 502, 1.1, '#d9c5a8')}
      <g transform="translate(880 500) rotate(-5)">
        <rect width="64" height="86" fill="#e0d5c2" opacity=".48"/>
        <path fill="none" d="M10 14H54M10 28H54M10 42H38" stroke="#746c60" stroke-opacity=".4" stroke-width="2"/>
      </g>
      <path fill="none" d="M1210 202V328M1250 206V344" stroke="#8d7a68" stroke-opacity=".26" stroke-width="2"/>
      <g class="anim glow-drift"><ellipse cx="1110" cy="390" rx="170" ry="120" fill="url(#stageGlow)" opacity=".26"/></g>`
  }
  if (kind === 'founder') {
    if (variant > 0) return founderVariant(variant)
    return `
      <rect x="806" y="164" width="532" height="280" fill="#2d261c" opacity=".36"/>
      <g transform="translate(830 196)">
        <rect width="376" height="202" rx="4" fill="#d9d7cd" opacity=".78" stroke="#e4e7df" stroke-opacity=".32"/>
        <path fill="none" d="M22 34H354M22 56H354M22 78H286" stroke="#727a73" stroke-opacity=".36" stroke-width="3"/>
        <path d="M42 174L104 154L162 160L222 118L288 98L348 54" fill="none" stroke="#b06e62" stroke-opacity=".72" stroke-width="6" stroke-linecap="round"/>
        <path fill="none" d="M42 174L104 154L162 160L222 118L288 98L348 54" stroke="#e7c7ad" stroke-opacity=".3" stroke-width="2"/>
        ${sticky(34, 92, 74, 50, '#d9b178', -2)}
        ${sticky(122, 86, 70, 46, '#b9cabb', 2)}
        ${sticky(204, 92, 80, 48, '#c9b7ce', -1)}
        ${label(322, 32, '第 3 周', { size: 13, fill: '#626d65', opacity: 0.72, anchor: 'start' })}
        ${label(322, 50, 'MVP', { size: 15, fill: '#565f58', opacity: 0.82, weight: 700, anchor: 'start' })}
        ${label(322, 68, '要上线', { size: 13, fill: '#626d65', opacity: 0.72, anchor: 'start' })}
        <circle cx="40" cy="188" r="3" fill="#d9b178" opacity=".7"/>
      </g>
      <g transform="translate(840 440)">
        <path d="M0 0H470L448 22H18Z" fill="#51463a" stroke="#af9571" stroke-opacity=".32"/>
        <path fill="none" d="M26 22V108M442 22V108" stroke="#1e1e1f" stroke-width="10"/>
        ${laptop(34, -64, { w: 112, h: 64, accent: '#8fd0d6', rotate: -3 })}
        ${laptop(184, -62, { w: 112, h: 64, accent: '#d9b178', rotate: 2 })}
        ${laptop(334, -66, { w: 112, h: 64, accent: '#9fc4a5', rotate: -1 })}
        ${cup(156, 0, 1.05, '#d9c5a8')}
        ${cup(306, 2, 1.05, '#cfbca0')}
        <path fill="none" d="M140 8V28M300 10V30" stroke="#8f8270" stroke-opacity=".34" stroke-width="2"/>
      </g>
      <g transform="translate(1192 472)">
        <path d="M0 0H112L104 18H8Z" fill="#3d3832"/>
        <path fill="none" d="M16 18V88M94 18V88" stroke="#1d1e20" stroke-width="8"/>
        <path d="M24 2H90L84 18H30Z" fill="#c9d0c5" opacity=".35"/>
      </g>
      <g transform="translate(826 470)">
        <rect width="46" height="46" rx="3" fill="#1a2a30"/>
        <path fill="none" d="M9 10H37M9 20H37M9 30H28" stroke="#8fd0d6" stroke-opacity=".28" stroke-width="2"/>
        <circle cx="23" cy="40" r="3" fill="#ddb47d" opacity=".7"/>
      </g>
      <g class="anim glow-drift"><ellipse cx="1210" cy="420" rx="110" ry="90" fill="url(#lampGlow)" opacity=".3"/></g>`
  }
  return ''
}

export function careerRoom(kind, variant = 0) {
  return sceneArt(kind, variant)
}
