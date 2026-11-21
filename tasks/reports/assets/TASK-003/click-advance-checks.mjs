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

const settle = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))

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
  await settle(200)
}

async function navigateHome() {
  await send('Page.navigate', { url: `http://127.0.0.1:4173/?t=${Date.now()}` })
  await waitFor("document.querySelector('.app-background')?.dataset.view === 'home'")
  await waitFor("document.querySelector('.scene-current')?.naturalWidth > 0")
  await settle(300)
}

async function pointOf(selector, text = '') {
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
  await settle(60)
  return point
}

async function clickAt(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 })
  await settle(140)
}

async function click(selector, text = '') {
  const point = await pointOf(selector, text)
  await clickAt(point.x, point.y)
}

async function doubleClickAt(point) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
  await settle(30)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 2 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 2 })
  await settle(700)
}

async function doubleTapAt(point) {
  const touchPoints = [{ ...point, radiusX: 1, radiusY: 1, force: 1, id: 1 }]
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints })
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await settle(60)
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints })
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await settle(700)
}

async function surfaceClick() {
  const size = await evaluate("({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight })")
  await clickAt(Math.round(size.width * 0.06), Math.round(size.height * 0.36))
}

async function state() {
  return evaluate(`(() => ({
    view: document.querySelector('.app-background')?.dataset.view ?? null,
    text: document.querySelector('.dialogue-text')?.textContent?.trim() ?? null,
    progress: document.querySelector('.dialogue-progress')?.textContent?.trim() ?? null,
    speaker: document.querySelector('.speaker-name')?.textContent?.trim() ?? null,
    choices: document.querySelectorAll('.choice-option').length,
    endTitle: document.querySelector('.end-layout h1')?.textContent?.trim() ?? null,
    dialogOpen: document.querySelector('.confirm-dialog')?.open ?? false,
    bubbleOpen: (() => {
      const bubble = document.querySelector('.scene-whisper-bubble')
      return Boolean(bubble && Number.parseFloat(getComputedStyle(bubble).opacity) > 0.99)
    })(),
    whisper: Boolean(document.querySelector('.scene-whisper')),
    live: document.querySelector('.app-background > p[aria-live]')?.textContent?.trim() ?? null,
    liveInsideScreen: Boolean(document.querySelector('.screen-transition p[aria-live]')),
  }))()`)
}

async function waitProgress(fragment) {
  await waitFor(`document.querySelector('.dialogue-progress')?.textContent.includes(${JSON.stringify(fragment)})`)
}

async function waitText(expected) {
  await waitFor(`document.querySelector('.dialogue-text')?.textContent.includes(${JSON.stringify(expected)})`)
}

const report = { viewport: '1440x900 / 390x844', checks: [], failures, consoleEvents }
await send('Network.enable')
await send('Runtime.enable')
await setViewport(1440, 900)
await navigateHome()

let current = await state()
assert.equal(current.view, 'home')
await surfaceClick()
current = await state()
assert.equal(current.view, 'home', 'home does not advance on a surface click')
report.checks.push({ name: 'home-surface', ...current })

await click('button', '开始体验')
await waitFor("document.querySelector('.app-background')?.dataset.view === 'intro'")
current = await state()
await surfaceClick()
assert.equal((await state()).view, 'intro', 'intro does not advance on a surface click')
report.checks.push({ name: 'intro-surface', ...current })

await click('button', '进入来电')
await waitFor("document.querySelector('.app-background')?.dataset.view === 'incoming'")
await surfaceClick()
assert.equal((await state()).view, 'incoming', 'incoming does not advance on a surface click')
report.checks.push({ name: 'incoming-surface', view: 'incoming' })

await click('button', '接听')
await waitFor("document.querySelector('.app-background')?.dataset.view === 'call'")
await waitText('喂？先别挂')
const opening = await state()
assert.equal(opening.progress, '主线 01 / 07')
assert.ok(opening.live.includes('喂？先别挂'), 'live region announces the opening line')
assert.equal(opening.liveInsideScreen, false, 'live region stays outside the page transition')
report.checks.push({ name: 'call-opening', ...opening })

const selectedText = await evaluate(`(() => {
  const element = document.querySelector('.dialogue-text')
  const range = document.createRange()
  range.selectNodeContents(element)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  return selection.toString()
})()`)
assert.ok(selectedText.includes('喂？先别挂'), 'dialogue text can be selected')
await surfaceClick()
await settle(220)
const afterSelection = await state()
assert.equal(afterSelection.progress, '主线 01 / 07', 'clicking after selecting text does not advance')
report.checks.push({ name: 'selection-guard', selected: selectedText, ...afterSelection })

await surfaceClick()
await waitProgress('主线 02 / 07')
assert.equal((await state()).text.includes('恶作剧'), true, 'surface click advances one line')
report.checks.push({ name: 'surface-advance', ...(await state()) })

const panelBefore = await state()
await click('.dialogue-text')
await waitProgress('主线 03 / 07')
const panelAfter = await state()
assert.equal(panelAfter.text.includes('那年填志愿'), true, 'clicking the dialogue text advances')
assert.notEqual(panelAfter.progress, panelBefore.progress)
report.checks.push({ name: 'panel-text-advance', before: panelBefore.progress, after: panelAfter.progress })

const buttonBefore = await state()
await click('.dialogue-continue')
await waitProgress('主线 04 / 07')
await settle(260)
const buttonAfter = await state()
assert.equal(buttonAfter.progress, '主线 04 / 07', 'continue button advances exactly one line, not two')
report.checks.push({ name: 'continue-button-once', before: buttonBefore.progress, after: buttonAfter.progress })

const beforeEndCall = await state()
await click('.header-end-call')
await waitFor("document.querySelector('.confirm-dialog')?.open === true")
assert.equal((await state()).text, beforeEndCall.text, 'end-call button does not advance the story')
await click('.confirm-dialog button', '取消')
await waitFor("document.querySelector('.confirm-dialog')?.open === false")
assert.equal((await state()).progress, beforeEndCall.progress, 'cancelling the dialog leaves the line unchanged')
report.checks.push({ name: 'end-call-guard', ...beforeEndCall })

await surfaceClick()
await waitProgress('主线 05 / 07')
await waitFor("document.querySelector('.scene-current')?.getAttribute('src')?.includes('rehearsal')")
await settle(300)
assert.equal((await state()).whisper, true, 'rehearsal exposes a whisper hotspot')
await click('.scene-whisper')
await waitFor("(() => { const b = document.querySelector('.scene-whisper-bubble'); return b && Number.parseFloat(getComputedStyle(b).opacity) > 0.99 })()")
const whisperBefore = await state()
assert.equal(whisperBefore.progress, '主线 05 / 07', 'clicking the whisper hotspot does not advance the story')
await surfaceClick()
await waitProgress('主线 06 / 07')
report.checks.push({ name: 'whisper-guard', before: whisperBefore.progress, after: (await state()).progress })

await surfaceClick()
await waitProgress('主线 07 / 07')
await surfaceClick()
await waitFor("document.querySelectorAll('.choice-option').length === 2")
const firstChoice = await state()
assert.equal(firstChoice.choices, 2)
await surfaceClick()
await settle(240)
assert.equal((await state()).choices, 2, 'surface click does not choose on the first choice')
report.checks.push({ name: 'first-choice-guard', ...firstChoice })

await click('.choice-option')
await waitFor("Boolean(document.querySelector('.dialogue-text'))")
await waitProgress('回应反馈 01 / 02')
const feedback = await state()
assert.equal(feedback.choices, 0)
assert.ok(feedback.live.includes('我有时也会想'), 'live region survives the page transition and announces feedback')
assert.equal(feedback.liveInsideScreen, false)
await surfaceClick()
await waitProgress('回应反馈 02 / 02')
await surfaceClick()
await waitProgress('共同衔接')
report.checks.push({ name: 'feedback-advance', first: feedback.progress, second: (await state()).progress })

await surfaceClick()
await waitFor("document.querySelectorAll('.choice-option').length === 2")
const secondChoice = await state()
await surfaceClick()
await settle(240)
assert.equal((await state()).choices, 2, 'surface click does not choose on the second choice')
report.checks.push({ name: 'second-choice-guard', ...secondChoice })

await click('.choice-option')
await waitFor("Boolean(document.querySelector('.dialogue-text'))")
await waitProgress('行动反馈')
const actionFeedback = await state()
await surfaceClick()
await waitFor("Boolean(document.querySelector('.dialogue-text'))")
await waitProgress('通话尾声')
const farewell = await state()
await surfaceClick()
await waitFor("Boolean(document.querySelector('.end-layout'))")
const ending = await state()
assert.ok(ending.endTitle, 'surface click from farewell reaches the ending')
await surfaceClick()
await settle(260)
const endingAfter = await state()
assert.equal(endingAfter.endTitle, ending.endTitle, 'surface click does not restart the ending')
report.checks.push({ name: 'ending-surface', before: ending.endTitle, after: endingAfter.endTitle, action: actionFeedback.progress, farewell: farewell.progress })

await setViewport(390, 844)
await navigateHome()
await click('button', '开始体验')
await waitFor("document.querySelector('.app-background')?.dataset.view === 'intro'")
await click('button', '进入来电')
await waitFor("document.querySelector('.app-background')?.dataset.view === 'incoming'")
await click('button', '接听')
await waitFor("document.querySelector('.app-background')?.dataset.view === 'call'")
await waitText('喂？先别挂')
await surfaceClick()
await waitProgress('主线 02 / 07')
const mobile = await state()
assert.equal(mobile.view, 'call')
assert.equal(mobile.progress, '主线 02 / 07')
report.checks.push({ name: 'mobile-390-surface', ...mobile })

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await settle(200)
await navigateHome()
report.checks.push({ name: 'final-home', ...(await state()) })

await navigateHome()
await doubleClickAt(await pointOf('button', '开始体验'))
const doubleStart = await state()
assert.equal(doubleStart.view, 'intro', 'double-clicking 开始体验 does not skip the intro')
await doubleClickAt(await pointOf('button', '进入来电'))
const doubleEnter = await state()
assert.equal(doubleEnter.view, 'incoming', 'double-clicking 进入来电 does not skip the incoming screen')
await doubleClickAt(await pointOf('button', '接听'))
const doubleAnswer = await state()
assert.equal(doubleAnswer.view, 'call')
assert.equal(doubleAnswer.progress, '主线 01 / 07', 'double-clicking 接听 does not skip the first line')
report.checks.push({ name: 'double-click-guard', start: doubleStart.view, enter: doubleEnter.view, answer: doubleAnswer.progress })

await setViewport(390, 844)
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
await navigateHome()
await doubleTapAt(await pointOf('button', '开始体验'))
const tapStart = await state()
assert.equal(tapStart.view, 'intro', 'double-tapping 开始体验 does not skip the intro')
await doubleTapAt(await pointOf('button', '进入来电'))
const tapEnter = await state()
assert.equal(tapEnter.view, 'incoming', 'double-tapping 进入来电 does not skip the incoming screen')
await doubleTapAt(await pointOf('button', '接听'))
const tapAnswer = await state()
assert.equal(tapAnswer.view, 'call')
assert.equal(tapAnswer.progress, '主线 01 / 07', 'double-tapping 接听 does not skip the first line')
report.checks.push({ name: 'double-tap-guard', start: tapStart.view, enter: tapEnter.view, answer: tapAnswer.progress })
await send('Emulation.setTouchEmulationEnabled', { enabled: false })
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

assert.deepEqual(failures, [], 'no failed requests')
assert.deepEqual(consoleEvents, [], 'no console errors')
report.result = 'all click-to-advance checks passed'
await writeFile(new URL('click-advance-checks.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ result: report.result, checks: report.checks.length, failures, consoleEvents }, null, 2))
socket.close()