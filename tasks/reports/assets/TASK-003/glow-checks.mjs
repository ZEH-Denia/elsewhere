import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const cdpPort = process.env.CDP_PORT || '9224'
const pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json()
const target = pages.find((page) => page.type === 'page' && (page.url === 'about:blank' || page.url.startsWith('http://127.0.0.1:4173/')))
  ?? pages.find((page) => page.type === 'page')
assert.ok(target, 'Edge page target is available')

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 0
const pending = new Map()
const failures = []
const consoleEvents = []
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.id) {
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(`${request.method}: ${JSON.stringify(message.error)}`))
    else request.resolve(message.result)
    return
  }
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    failures.push({ status: message.params.response.status, url: message.params.response.url })
  }
  if (message.method === 'Network.loadingFailed') failures.push({ loadingFailed: message.params.errorText })
  if (message.method === 'Runtime.exceptionThrown') consoleEvents.push({ exception: message.params.exceptionDetails.text })
  if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
    consoleEvents.push({ type: message.params.type, text: message.params.args.map((arg) => arg.value ?? arg.description).join(' ') })
  }
})

function send(method, params = {}) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method })
    socket.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}

const settle = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(expression, timeout = 6000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await settle(50)
  }
  throw new Error(`Timed out: ${expression}`)
}

async function setViewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await settle(180)
}

async function navigateHome() {
  await send('Page.navigate', { url: `http://127.0.0.1:4173/?t=${Date.now()}` })
  await waitFor("document.querySelector('h1')?.textContent.includes('未接来电')")
  await waitFor("document.querySelector('.scene-current')?.naturalWidth > 0")
  await settle(400)
}

async function elementPoint(selector, text = '') {
  const point = await evaluate(`(() => {
    const wanted = ${JSON.stringify(text)}.replace(/\\s+/g, '')
    const element = [...document.querySelectorAll(${JSON.stringify(selector)})].find((candidate) => {
      const rect = candidate.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && candidate.textContent.replace(/\\s+/g, '').includes(wanted)
    })
    if (!element) return null
    element.scrollIntoView({ block: 'center' })
    const rect = element.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })()`)
  assert.ok(point, `element exists: ${selector} ${text}`)
  await settle(40)
  return point
}

async function click(selector, text = '') {
  const point = await elementPoint(selector, text)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
}

async function moveTo(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
}

async function whisperState() {
  return evaluate(`(() => {
    const host = document.querySelector('.scene-whispers')
    const button = document.querySelector('.scene-whisper')
    const bubble = button?.querySelector('.scene-whisper-bubble')
    const art = document.querySelector('.scene-whisper-art')
    const halos = [...document.querySelectorAll('.scene-whisper-halo')]
    const rims = [...document.querySelectorAll('.scene-whisper-edge-rim')]
    if (!button || !bubble) return null
    const rect = button.getBoundingClientRect()
    const bubbleRect = bubble.getBoundingClientRect()
    const style = getComputedStyle(bubble)
    const haloStyle = halos[0] ? getComputedStyle(halos[0]) : null
    const rimStyle = rims[0] ? getComputedStyle(rims[0]) : null
    const focusRing = button.querySelector('.scene-whisper-anchor')
    return {
      label: button.getAttribute('aria-label'),
      descriptionId: button.getAttribute('aria-describedby'),
      open: button.classList.contains('is-open'),
      text: bubble.textContent,
      button: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height },
      buttonZ: getComputedStyle(button).zIndex,
      hostClass: host ? host.className : null,
      art: Boolean(art),
      artZ: art ? getComputedStyle(art).zIndex : null,
      artBlend: art ? getComputedStyle(art).mixBlendMode : null,
      halos: halos.length,
      rims: rims.length,
      haloOpacity: haloStyle ? Number.parseFloat(haloStyle.opacity) : null,
      haloAnimation: haloStyle ? haloStyle.animationName : null,
      rimOpacity: rimStyle ? Number.parseFloat(rimStyle.opacity) : null,
      rimAnimation: rimStyle ? rimStyle.animationName : null,
      dots: document.querySelectorAll('.scene-whisper-dot').length,
      opacity: Number.parseFloat(style.opacity),
      visibility: style.visibility,
      transitionDuration: style.transitionDuration,
      focusRingOpacity: focusRing ? Number.parseFloat(getComputedStyle(focusRing, '::before').opacity) : null,
      bubbleInScene: (() => {
        const scene = document.querySelector('.scene-whispers').getBoundingClientRect()
        return bubbleRect.left >= scene.left - 1 && bubbleRect.right <= scene.right + 1 &&
          bubbleRect.top >= scene.top - 1 && bubbleRect.bottom <= scene.bottom + 1
      })(),
      bubblePanelOverlap: [...document.querySelectorAll('.dialogue-panel, .prelude-panel')].some((panel) => {
        const bound = panel.getBoundingClientRect()
        return bubbleRect.left < bound.right - 2 && bubbleRect.right > bound.left + 2 &&
          bubbleRect.top < bound.bottom - 2 && bubbleRect.bottom > bound.top + 2
      }),
      hit: (() => {
        const element = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        return Boolean(element && (element.closest('.scene-whisper') === button))
      })(),
      panelOverlap: [...document.querySelectorAll('.dialogue-panel, .prelude-panel')].some((panel) => {
        const bound = panel.getBoundingClientRect()
        return rect.left < bound.right - 2 && rect.right > bound.left + 2 &&
          rect.top < bound.bottom - 2 && rect.bottom > bound.top + 2
      }),
    }
  })()`)
}

async function screenshot(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const width = Math.ceil(metrics.cssLayoutViewport.clientWidth)
  const height = Math.ceil(metrics.cssLayoutViewport.clientHeight)
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width, height, scale: 1 } })
  const file = new URL(`glow-${name}.png`, import.meta.url)
  await writeFile(file, Buffer.from(result.data, 'base64'))
  return file.pathname
}

async function advanceToDoubt() {
  let guard = 0
  while (guard < 10) {
    const src = await evaluate("document.querySelector('.scene-current')?.getAttribute('src')")
    if (src?.includes('/doubt.svg')) return
    assert.ok(await evaluate("Boolean(document.querySelector('.dialogue-continue'))"), 'dialogue continue is available')
    await click('.dialogue-continue')
    await settle(420)
    guard += 1
  }
  throw new Error('doubt scene was not reached')
}

async function advanceToFirstChoice() {
  let guard = 0
  while (guard < 14) {
    if (await evaluate("Boolean(document.querySelector('.choice-option'))")) return
    assert.ok(await evaluate("Boolean(document.querySelector('.dialogue-continue'))"), 'dialogue continue is available before first choice')
    await click('.dialogue-continue')
    await settle(460)
    guard += 1
  }
  throw new Error('first choice was not reached')
}

async function choose(optionIndex) {
  const points = await evaluate(`[...document.querySelectorAll('.choice-option')].map((el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })`)
  assert.ok(points[optionIndex], `choice option ${optionIndex} exists`)
  const point = points[optionIndex]
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
}

async function advanceUntilScene(scene) {
  let guard = 0
  while (guard < 16) {
    const src = await evaluate("document.querySelector('.scene-current')?.getAttribute('src')")
    if (src?.includes(`/${scene}.svg`)) return
    if (await evaluate("Boolean(document.querySelector('.choice-option'))")) throw new Error(`hit a choice before ${scene}`)
    assert.ok(await evaluate("Boolean(document.querySelector('.dialogue-continue'))"), `dialogue continue is available before ${scene}`)
    await click('.dialogue-continue')
    await settle(460)
    guard += 1
  }
  throw new Error(`${scene} was not reached`)
}

const report = { viewport: '1440x900 / 1024x768 / 390x844', checks: [], shots: [], failures, consoleEvents }
const sweepTexts = {
  connection: '信号只够传过来声音。',
  doubt: '两张照片，背面写着同一天。',
  rehearsal: '第三小节，改了很多次。',
  desk: '秒针走得很慢，像在等回答。',
  question: '有句话，被杂音轻轻吞掉了。',
  'regret-quiet': '最旧的那根弦，一直没换。',
  closing: '波纹散开，又回到原处。',
}
const edgeScenes = new Set(['home', 'rehearsal', 'regret-quiet'])
const seen = []

async function openWithPointer(scene) {
  const item = await whisperState()
  assert.ok(item, `whisper exists on ${scene}`)
  assert.equal(item.text, sweepTexts[scene])
  const x = item.button.x + item.button.width * 0.22
  const y = item.button.y + item.button.height * 0.18
  await moveTo(x, y)
  await settle(600)
  await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
  const opened = await whisperState()
  assert.equal(opened.open, true, `${scene}: offset hover opens the note`)
  assert.ok(opened.bubbleInScene, `${scene}: bubble stays inside the frame`)
  assert.equal(opened.bubblePanelOverlap, false, `${scene}: bubble stays clear of the reading panel`)
  assert.ok(opened.hit, `${scene}: hotspot is clickable`)
  assert.equal(opened.panelOverlap, false, `${scene}: expanded target stays clear of the reading panel`)
  assert.equal(opened.dots, 0, `${scene}: no dot affordance remains`)
  assert.ok(opened.art, `${scene}: glow art is rendered`)
  assert.equal(opened.artZ, '5', `${scene}: glow art is below the content layer`)
  assert.equal(opened.artBlend, 'screen', `${scene}: glow blends with the scene`)
  assert.ok(opened.button.width > 44 && opened.button.height > 44, `${scene}: target is larger than the old dot`)
  assert.ok(opened.halos >= 1, `${scene}: breathing halo is rendered`)
  assert.ok(opened.haloOpacity > 0, `${scene}: halo is visible at rest`)
  assert.equal(opened.rims, edgeScenes.has(scene) ? 1 : 0, `${scene}: edge light matches the approved object list`)
  if (edgeScenes.has(scene)) assert.ok(opened.rimOpacity > 0, `${scene}: edge light is visible`)
  report.checks.push({ name: `scene-${scene}`, ...opened })
  report.shots.push(await screenshot(`${scene}-hover-1440`))
  await moveTo(2, 2)
  await settle(240)
  seen.push(scene)
}

await send('Network.enable')
await send('Runtime.enable')
await setViewport(1440, 900)
await navigateHome()

const initial = await whisperState()
assert.ok(initial, 'home scene exposes one whisper hotspot')
assert.equal(initial.text, '琴弦上还留着当年的指印。')
assert.ok(initial.descriptionId, 'hotspot is described by its note')
assert.equal(initial.open, false)
assert.equal(initial.opacity, 0)
assert.ok(initial.button.width >= 44 && initial.button.height >= 44, 'expanded target is at least 44px')
assert.ok(initial.hit, 'hotspot is the topmost element at its centre')
assert.equal(initial.panelOverlap, false, 'home target stays clear of the reading panel')
assert.equal(initial.bubblePanelOverlap, false, 'home note stays clear of the reading panel')
assert.equal(initial.dots, 0, 'no dot affordance remains')
assert.equal(initial.halos, 1, 'home guitar has one breathing halo')
assert.equal(initial.rims, 1, 'home guitar has an edge light')
assert.equal(initial.artZ, '5', 'glow layer sits between scene art and content')
assert.equal(initial.buttonZ, '21', 'interaction layer sits above content')
assert.ok(initial.haloAnimation.includes('whisper-halo-breathe'), 'halo breathes')
assert.ok(initial.rimAnimation.includes('whisper-edge-breathe'), 'edge light breathes')
report.checks.push({ name: 'home-initial', ...initial })
report.shots.push(await screenshot('home-idle-1440'))

await send('Accessibility.enable')
const domRoot = await send('DOM.getDocument', { depth: 0 })
const whisperNode = await send('DOM.querySelector', { nodeId: domRoot.root.nodeId, selector: '.scene-whisper' })
assert.ok(whisperNode.nodeId, 'whisper node is present in the DOM tree')
const axTree = await send('Accessibility.getPartialAXTree', { nodeId: whisperNode.nodeId, fetchRelatives: false })
const axButton = axTree.nodes.find((node) => node.role?.value === 'button')
assert.ok(axButton, 'whisper is exposed as a button')
assert.equal(axButton.name?.value, '画面细节')
assert.equal(axButton.description?.value, '琴弦上还留着当年的指印。')
report.checks.push({ name: 'accessibility-tree', role: axButton.role.value, accessibleName: axButton.name.value, description: axButton.description.value })

const edgePoint = {
  x: initial.button.x + initial.button.width * 0.3,
  y: initial.button.y + initial.button.height * 0.26,
}
await moveTo(edgePoint.x, edgePoint.y)
await settle(70)
const early = await whisperState()
assert.equal(early.opacity, 0, 'note waits briefly for intent even inside the expanded glow')
await settle(140)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const hovered = await whisperState()
assert.equal(hovered.open, true)
assert.equal(hovered.visibility, 'visible')
assert.ok(hovered.opacity >= 0.99)
assert.ok(hovered.bubbleInScene, 'bubble stays inside the scene frame')
assert.ok(hovered.haloOpacity > initial.haloOpacity, 'hover slightly strengthens the glow')
report.checks.push({ name: 'home-hover-intent', ...hovered })
report.shots.push(await screenshot('home-hover-1440'))

await moveTo(2, 2)
await settle(260)
const left = await whisperState()
assert.equal(left.opacity, 0, 'bubble closes after the pointer leaves')

await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
await settle(120)
const firstTab = await evaluate(`(() => {
  const element = document.activeElement
  return { className: element ? element.className : null, text: element ? element.textContent.trim() : null }
})()`)
assert.ok(firstTab.className.includes('primary-action'), 'Tab reaches the primary action first')
assert.ok(firstTab.text.includes('开始体验'))

await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
await settle(120)
const tabbed = await evaluate(`(() => {
  const element = document.activeElement
  return {
    className: element ? element.className : null,
    focusVisible: element ? element.matches(':focus-visible') : false,
  }
})()`)
assert.ok(tabbed.className.includes('scene-whisper'), 'Tab reaches the hotspot after the main action')
assert.equal(tabbed.focusVisible, true, 'keyboard focus shows the visible focus ring')
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const focused = await whisperState()
assert.equal(focused.open, true, 'keyboard focus opens the whisper immediately')
assert.ok(focused.opacity >= 0.99, 'focused bubble is fully visible')
assert.ok(focused.focusRingOpacity > 0, 'focused hotspot draws a visible focus ring')
report.checks.push({ name: 'home-keyboard-focus', ...focused, focusVisible: tabbed.focusVisible, firstFocus: firstTab.className })
report.shots.push(await screenshot('home-keyboard-1440'))

await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 })
await settle(120)
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
await settle(260)
const keyPinned = await whisperState()
assert.ok(keyPinned.opacity >= 0.99, 'Enter pins the whisper after keyboard focus moves away')
assert.equal(keyPinned.open, true)
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 })
await settle(240)
const keyClosed = await whisperState()
assert.equal(keyClosed.open, false, 'Escape closes the keyboard-pinned whisper')
report.checks.push({ name: 'home-keyboard-pin-escape', afterEnterTab: keyPinned.opacity, afterEscape: keyClosed.opacity })

await moveTo(focused.button.x, focused.button.y)
await settle(520)
await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...focused.button, button: 'left', clickCount: 1 })
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...focused.button, button: 'left', clickCount: 1 })
await moveTo(2, 2)
await settle(300)
const pinned = await whisperState()
assert.ok(pinned.opacity >= 0.99, 'click pins the whisper after the pointer leaves')
assert.equal(pinned.open, true)
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 })
await settle(240)
const escaped = await whisperState()
assert.equal(escaped.opacity, 0, 'Escape closes a pinned whisper')
report.checks.push({ name: 'home-pin-escape', pinnedAfterLeave: pinned.opacity, afterEscape: escaped.opacity })

await click('button', '开始体验')
await settle(400)
await click('button', '进入来电')
await settle(500)
await click('button', '接听')
await settle(600)

const connection = await whisperState()
assert.ok(connection, 'call opening exposes a whisper hotspot')
assert.equal(connection.text, sweepTexts.connection)
assert.equal(connection.halos, 1)
assert.equal(connection.rims, 0)
await moveTo(connection.button.x + connection.button.width * 0.3, connection.button.y + connection.button.height * 0.25)
await settle(600)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const connectionOpen = await whisperState()
assert.equal(connectionOpen.open, true)
assert.ok(connectionOpen.bubbleInScene && connectionOpen.hit)
assert.equal(connectionOpen.panelOverlap, false, 'call hotspot stays clear of the dialogue panel')
assert.equal(connectionOpen.bubblePanelOverlap, false, 'call note stays clear of the dialogue panel')
report.checks.push({ name: 'connection-hover', ...connectionOpen })
report.shots.push(await screenshot('connection-hover-1440'))
await moveTo(2, 2)
await settle(240)

await advanceToDoubt()
await settle(500)
const doubt = await whisperState()
assert.ok(doubt, 'doubt scene exposes a whisper hotspot')
assert.equal(doubt.text, sweepTexts.doubt)
assert.ok(doubt.hit, 'doubt hotspot is hittable above the artwork')
await moveTo(doubt.button.x + doubt.button.width * 0.22, doubt.button.y + doubt.button.height * 0.2)
await settle(560)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const doubtHovered = await whisperState()
assert.ok(doubtHovered.opacity >= 0.99)
assert.ok(doubtHovered.bubbleInScene, 'right-side bubble is not clipped')
assert.equal(doubtHovered.panelOverlap, false, 'doubt target stays clear of the dialogue panel')
report.checks.push({ name: 'doubt-hover', ...doubtHovered })
report.shots.push(await screenshot('doubt-hover-1440'))

await moveTo(2, 2)
await settle(260)
let guard = 0
while (guard < 12 && !(await evaluate("Boolean(document.querySelector('.choice-option'))"))) {
  const state = await evaluate(`(() => {
    const image = document.querySelector('.scene-current')
    return { scene: image ? image.getAttribute('src').split('/').pop().replace('.svg', '') : null }
  })()`)
  if (state.scene && sweepTexts[state.scene] && !seen.includes(state.scene)) {
    await openWithPointer(state.scene)
  }
  await click('.dialogue-continue')
  await settle(500)
  guard += 1
}
assert.ok(await evaluate("Boolean(document.querySelector('.choice-option'))"), 'first choice is reached')
await settle(300)
const option = await elementPoint('.choice-option')
await moveTo(option.x, option.y)
await settle(500)
assert.equal(await evaluate("document.querySelectorAll('.scene-whispers').length"), 0, 'whispers pause during option preview')
await moveTo(2, 2)
await settle(500)
assert.equal(await evaluate("document.querySelectorAll('.scene-whispers').length"), 1, 'whispers return after preview')
report.checks.push({ name: 'preview-pause', paused: true, resumed: true })

let sweepGuard = 0
while (sweepGuard < 30) {
  const state = await evaluate(`(() => {
    const image = document.querySelector('.scene-current')
    return {
      scene: image ? image.getAttribute('src').split('/').pop().replace('.svg', '') : null,
      hasContinue: Boolean(document.querySelector('.dialogue-continue')),
      hasChoice: Boolean(document.querySelector('.choice-option')),
    }
  })()`)
  if (state.scene && sweepTexts[state.scene] && !seen.includes(state.scene)) {
    await openWithPointer(state.scene)
  }
  if (!state.hasContinue && !state.hasChoice) break
  if (state.hasChoice) await choose(0)
  else await click('.dialogue-continue')
  await settle(500)
  sweepGuard += 1
}
assert.deepEqual(seen, ['doubt', 'rehearsal', 'desk', 'question', 'regret-quiet', 'closing'], 'every mapped story scene was visited')

await setViewport(1024, 768)
await navigateHome()
const compact = await whisperState()
assert.ok(compact, 'compact desktop keeps a hotspot')
assert.equal(compact.panelOverlap, false, 'home target stays clear of the panel at 1024x768')
await moveTo(compact.button.x + compact.button.width * 0.22, compact.button.y + compact.button.height * 0.2)
await settle(600)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
report.shots.push(await screenshot('home-1024'))
await moveTo(2, 2)
await settle(240)
await click('button', '开始体验')
await settle(400)
await click('button', '进入来电')
await settle(500)
await click('button', '接听')
await settle(600)
await advanceToDoubt()
await settle(500)
const compactDoubt = await whisperState()
assert.ok(compactDoubt, 'compact desktop keeps the doubt hotspot')
assert.equal(compactDoubt.panelOverlap, false, 'doubt target stays clear of the dialogue panel at 1024x768')
await advanceToFirstChoice()
await settle(400)
await choose(0)
await settle(600)
await advanceUntilScene('regret-quiet')
await settle(500)
const compactRegret = await whisperState()
assert.ok(compactRegret, 'compact desktop keeps the regret-quiet hotspot')
assert.equal(compactRegret.panelOverlap, false, 'regret-quiet target stays clear of the dialogue panel at 1024x768')
await moveTo(compactRegret.button.x + compactRegret.button.width * 0.3, compactRegret.button.y + compactRegret.button.height * 0.25)
await settle(600)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
report.shots.push(await screenshot('regret-quiet-hover-1024'))
await moveTo(2, 2)
await settle(240)
report.checks.push({ name: 'viewport-1024x768', home: compact, doubt: compactDoubt, regret: compactRegret })

await setViewport(768, 900)
await navigateHome()
const narrow = await whisperState()
assert.ok(narrow, 'narrow desktop keeps a hotspot')
assert.equal(narrow.panelOverlap, false, 'home target stays clear of the panel at 768x900')
await moveTo(narrow.button.x + narrow.button.width * 0.22, narrow.button.y + narrow.button.height * 0.2)
await settle(600)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
report.shots.push(await screenshot('home-768'))
report.checks.push({ name: 'viewport-768x900', ...narrow })
await moveTo(2, 2)
await settle(240)

await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
await setViewport(1440, 900)
await navigateHome()
const reduced = await whisperState()
assert.equal(reduced.haloAnimation, 'none', 'reduced motion stops the breathing animation')
assert.ok(reduced.haloOpacity > 0, 'reduced motion keeps a static glow')
await moveTo(reduced.button.x, reduced.button.y)
await settle(560)
const reducedOpen = await whisperState()
assert.equal(reducedOpen.transitionDuration, '0s', 'reduced motion removes the bubble transition')
assert.ok(reducedOpen.opacity >= 0.99, 'reduced motion still shows the note')
report.checks.push({ name: 'reduced-motion', ...reducedOpen })
await send('Emulation.setEmulatedMedia', { features: [] })

await setViewport(390, 844)
await navigateHome()
const mobile = await evaluate(`(() => {
  const host = document.querySelector('.scene-whispers')
  const button = document.querySelector('.scene-whisper')
  return {
    present: Boolean(host),
    display: host ? getComputedStyle(host).display : null,
    buttonVisible: button ? Boolean(button.offsetParent) : null,
    artVisible: Boolean(document.querySelector('.scene-whisper-art')?.getBoundingClientRect().width),
  }
})()`)
assert.ok(mobile.present, 'mobile keeps the same DOM')
assert.equal(mobile.display, 'none', 'whispers are hidden on narrow touch layout')
assert.ok(mobile.buttonVisible !== true, 'no hidden hotspot remains tappable or focusable')
report.checks.push({ name: 'mobile-390', ...mobile })
report.shots.push(await screenshot('mobile-home-390'))

assert.deepEqual(failures, [], 'no failed network requests')
assert.deepEqual(consoleEvents, [], 'no console errors or warnings')

const output = new URL('glow-checks.json', import.meta.url)
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ checks: report.checks, shots: report.shots, failures, consoleEvents }, null, 2))
socket.close()