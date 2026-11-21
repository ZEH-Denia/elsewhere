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
    const button = document.querySelector('.scene-whisper')
    const bubble = button?.querySelector('.scene-whisper-bubble')
    if (!button || !bubble) return null
    const rect = button.getBoundingClientRect()
    const bubbleRect = bubble.getBoundingClientRect()
    const style = getComputedStyle(bubble)
    return {
      label: button.getAttribute('aria-label'),
      descriptionId: button.getAttribute('aria-describedby'),
      open: button.classList.contains('is-open'),
      text: bubble.textContent,
      dot: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height },
      opacity: Number.parseFloat(style.opacity),
      visibility: style.visibility,
      transitionDuration: style.transitionDuration,
      bubbleInScene: (() => {
        const scene = document.querySelector('.scene-whispers').getBoundingClientRect()
        return bubbleRect.left >= scene.left - 1 && bubbleRect.right <= scene.right + 1 &&
          bubbleRect.top >= scene.top - 1 && bubbleRect.bottom <= scene.bottom + 1
      })(),
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
  const file = new URL(`whisper-${name}.png`, import.meta.url)
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

const report = { viewport: '1440x900 / 390x844', checks: [], shots: [], failures, consoleEvents }
const sweepTexts = {
  rehearsal: '第三小节，改了很多次。',
  desk: '秒针走得很慢，像在等回答。',
  question: '有句话，被杂音轻轻吞掉了。',
  'regret-quiet': '最旧的那根弦，一直没换。',
  closing: '波纹散开，又回到原处。',
}
const seen = []

async function captureSceneWhisper(scene) {
  const item = await whisperState()
  assert.ok(item, `whisper exists on ${scene}`)
  assert.equal(item.text, sweepTexts[scene])
  await moveTo(item.dot.x, item.dot.y)
  await settle(600)
  await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
  const opened = await whisperState()
  assert.equal(opened.open, true)
  assert.ok(opened.bubbleInScene, `${scene}: bubble stays inside the frame`)
  assert.ok(opened.hit, `${scene}: hotspot is clickable`)
  assert.equal(opened.panelOverlap, false, `${scene}: hotspot stays clear of the reading panel`)
  report.checks.push({ name: `scene-${scene}`, ...opened })
  report.shots.push(await screenshot(`scene-${scene}-1440`))
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
assert.ok(initial.dot.width >= 44 && initial.dot.height >= 44, 'hotspot keeps a 44px target')
assert.ok(initial.hit, 'hotspot is the topmost element at its centre')
assert.equal(initial.panelOverlap, false, 'home hotspot stays clear of the reading panel')
report.checks.push({ name: 'home-initial', ...initial })

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

await moveTo(initial.dot.x, initial.dot.y)
await settle(240)
const early = await whisperState()
assert.equal(early.opacity, 0, 'bubble waits for intent')

await settle(340)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const hovered = await whisperState()
assert.equal(hovered.open, true)
assert.equal(hovered.visibility, 'visible')
assert.ok(hovered.opacity >= 0.99)
assert.ok(hovered.bubbleInScene, 'bubble stays inside the scene frame')
report.checks.push({ name: 'home-hover-450ms', ...hovered })
report.shots.push(await screenshot('home-hover-1440'))

await moveTo(2, 2)
await settle(260)
const left = await whisperState()
assert.equal(left.opacity, 0, 'bubble closes after the pointer leaves')

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
assert.ok(tabbed.className.includes('scene-whisper'), 'Tab reaches the hotspot before the main action')
assert.equal(tabbed.focusVisible, true, 'keyboard focus shows the visible focus ring')
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const focused = await whisperState()
assert.equal(focused.open, true, 'keyboard focus opens the whisper immediately')
assert.ok(focused.opacity >= 0.99, 'focused bubble is fully visible')
report.checks.push({ name: 'home-keyboard-focus', ...focused, focusVisible: tabbed.focusVisible })
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

await moveTo(focused.dot.x, focused.dot.y)
await settle(520)
await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...focused.dot, button: 'left', clickCount: 1 })
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...focused.dot, button: 'left', clickCount: 1 })
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
assert.equal(connection.text, '信号只够传过来声音。')
await moveTo(connection.dot.x, connection.dot.y)
await settle(600)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const connectionOpen = await whisperState()
assert.equal(connectionOpen.open, true)
assert.ok(connectionOpen.bubbleInScene && connectionOpen.hit)
assert.equal(connectionOpen.panelOverlap, false, 'call hotspot stays clear of the dialogue panel')
report.checks.push({ name: 'connection-hover', ...connectionOpen })
report.shots.push(await screenshot('connection-hover-1440'))
await moveTo(2, 2)
await settle(240)

await advanceToDoubt()
await settle(500)

const doubt = await whisperState()
assert.ok(doubt, 'doubt scene exposes a whisper hotspot')
assert.equal(doubt.text, '两张照片，背面写着同一天。')
assert.ok(doubt.hit, 'doubt hotspot is hittable above the artwork')
await moveTo(doubt.dot.x, doubt.dot.y)
await settle(560)
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()", 2000)
const doubtHovered = await whisperState()
assert.ok(doubtHovered.opacity >= 0.99)
assert.ok(doubtHovered.bubbleInScene, 'right-side bubble is not clipped')
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
    await captureSceneWhisper(state.scene)
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
    await captureSceneWhisper(state.scene)
  }
  if (!state.hasContinue && !state.hasChoice) break
  if (state.hasChoice) await click('.choice-option')
  else await click('.dialogue-continue')
  await settle(500)
  sweepGuard += 1
}
assert.deepEqual(seen, ['rehearsal', 'desk', 'question', 'regret-quiet', 'closing'], 'every mapped story scene was visited')

await setViewport(1024, 768)
await navigateHome()
const compact = await whisperState()
assert.ok(compact, 'compact desktop keeps a hotspot')
assert.equal(compact.panelOverlap, false, 'home hotspot stays clear of the panel at 1024x768')
await moveTo(compact.dot.x, compact.dot.y)
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
assert.equal(compactDoubt.panelOverlap, false, 'doubt hotspot stays clear of the dialogue panel at 1024x768')
report.checks.push({ name: 'viewport-1024x768', homeOverlap: compact.panelOverlap, doubtOverlap: compactDoubt.panelOverlap })

await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
await setViewport(1440, 900)
await navigateHome()
const reduced = await whisperState()
await moveTo(reduced.dot.x, reduced.dot.y)
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
  }
})()`)
assert.ok(mobile.present, 'mobile keeps the same DOM')
assert.equal(mobile.display, 'none', 'whispers are hidden on narrow touch layout')
assert.ok(mobile.buttonVisible !== true, 'no hidden hotspot remains tappable or focusable')
report.checks.push({ name: 'mobile-390', ...mobile })
report.shots.push(await screenshot('mobile-home-390'))

assert.deepEqual(failures, [], 'no failed network requests')
assert.deepEqual(consoleEvents, [], 'no console errors or warnings')

const output = new URL('whisper-checks.json', import.meta.url)
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ checks: report.checks, shots: report.shots, failures, consoleEvents }, null, 2))
socket.close()
