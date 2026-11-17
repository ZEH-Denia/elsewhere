import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const baseUrl = 'http://127.0.0.1:4173/'
const assets = '/Users/zeh/Documents/elsewhere/tasks/reports/assets/TASK-002'
const target = await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' }).then((response) => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))
let id = 0
const pending = new Map()
const waiters = new Map()
const requests = new Map()
const responses = []
const exceptions = []
const logEntries = []
const loadingFailures = []

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const entry = pending.get(message.id)
    if (!entry) return
    pending.delete(message.id)
    message.error ? entry.reject(message.error) : entry.resolve(message.result)
    return
  }
  if (message.method === 'Network.requestWillBeSent') requests.set(message.params.requestId, message.params.request.url)
  if (message.method === 'Network.responseReceived') responses.push({ url: message.params.response.url, status: message.params.response.status })
  if (message.method === 'Network.loadingFailed') loadingFailures.push({ ...message.params, url: requests.get(message.params.requestId) })
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails)
  if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry.level)) logEntries.push(message.params.entry)
  if (waiters.has(message.method)) {
    const resolve = waiters.get(message.method)
    waiters.delete(message.method)
    resolve(message.params)
  }
})

function send(method, params = {}) {
  const callId = ++id
  return new Promise((resolve, reject) => {
    pending.set(callId, { resolve, reject })
    socket.send(JSON.stringify({ id: callId, method, params }))
  })
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}

async function settle(milliseconds = 550) {
  await evaluate(`new Promise((resolve) => setTimeout(resolve, ${milliseconds}))`)
}

async function navigate() {
  const loaded = new Promise((resolve) => waiters.set('Page.loadEventFired', resolve))
  await send('Page.navigate', { url: baseUrl })
  await loaded
  await settle()
}

async function capture(name) {
  const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(`${assets}/r1-${name}.png`, Buffer.from(screenshot.data, 'base64'))
}

async function clickButton(text, wait = true) {
  console.log('click', text)
  const point = await evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('button')).find((element) => element.innerText.trim() === ${JSON.stringify(text)} && element.getClientRects().length)
    if (!button) return null
    button.scrollIntoView({ block: 'center', inline: 'center' })
    const rect = button.getBoundingClientRect()
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  })()`)
  assert.ok(point, `button not found: ${text}`)
  await settle(80)
  const updatedPoint = await evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('button')).find((element) => element.innerText.trim() === ${JSON.stringify(text)})
    const rect = button.getBoundingClientRect()
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  })()`)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...updatedPoint, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...updatedPoint, button: 'left', clickCount: 1 })
  if (wait) await settle()
  return updatedPoint
}

async function key(name) {
  const definitions = {
    Tab: { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 },
    Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
    Space: { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' },
    Escape: { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 },
  }
  const definition = definitions[name]
  await send('Input.dispatchKeyEvent', { type: 'keyDown', ...definition })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...definition, text: undefined })
  await settle(180)
}

const expectedLines = [
  '喂？先别挂。如果我说，我也是你呢？',
  '这是什么恶作剧？',
  '那年填志愿，我把工程改成了音乐。你是不是没有改？',
  '……没有。我留在了那条更稳妥的路上。',
  '我刚结束一次排练。能演自己写的歌很开心，可下个月的演出费还没着落。',
  '我在准备实习。生活有了安排，但那把吉他已经很久没碰过。',
  '所以我想问，你现在最想对另一个自己说什么？',
]

async function readDialogue() {
  const result = await evaluate(`({ read: (() => ({
    progress: document.querySelector('.dialogue-progress')?.innerText,
    speaker: document.querySelector('.dialogue-speaker')?.innerText,
    text: document.querySelector('.dialogue-text')?.innerText,
    live: document.querySelector('[aria-live="polite"]')?.innerText,
  }))() })`)
  return result.read
}

async function runMainLines(captureLongLine = false) {
  const lines = []
  for (let index = 0; index < expectedLines.length; index += 1) {
    const line = await readDialogue()
    console.log('dialogue-step', index + 1, JSON.stringify(line))
    assert.equal(line.text, expectedLines[index])
    assert.equal(line.live, `${line.speaker}：${line.text}`)
    lines.push(line)
    if (captureLongLine && index === 4) await capture('call-05-390x844')
    await clickButton('继续')
  }
  assert.equal(await evaluate(`document.querySelector('#choice-title').innerText`), '你想怎样回应？')
  return lines
}

async function finishChoice(label, endName) {
  await clickButton(label)
  const feedback = [await readDialogue()]
  await clickButton('继续')
  feedback.push(await readDialogue())
  assert.notEqual(feedback[0].text, feedback[1].text)
  await clickButton('继续')
  const closing = await readDialogue()
  assert.equal(closing.text, '电话快断了。至少这一次，我们听见了彼此。')
  await clickButton('继续')
  const endResult = await evaluate(`({ read: (() => ({
    title: document.querySelector('#end-title').innerText,
    choice: document.querySelector('.end-choice').innerText,
    summary: document.querySelector('.end-reflection > p:last-child').innerText,
    focus: document.activeElement.id,
  }))() })`)
  const end = endResult.read
  assert.equal(end.title, '第一通来电，暂时结束。')
  assert.equal(end.focus, 'end-title')
  await capture(endName)
  return { feedback, closing, end }
}

await send('Page.enable')
await send('Runtime.enable')
await send('Network.enable')
await send('Log.enable')
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false })
await navigate()

await clickButton('开始体验')
const intro = await evaluate(`(() => ({
  heading: document.querySelector('#intro-title').innerText,
  disclaimer: document.querySelector('.intro-copy > p:last-child').innerText,
  focus: document.activeElement.id,
}))()`)
assert.equal(intro.disclaimer, '这是一段虚构的平行人生，不代表对真实未来的预测。')
assert.equal(intro.focus, 'intro-title')
await capture('intro-390x844')

await clickButton('进入来电')
assert.match(await evaluate(`document.querySelector('#incoming-title').innerText`), /另一个你/)
await capture('incoming-390x844')
await clickButton('接听')
await capture('call-01-390x844')
const firstMainLines = await runMainLines(true)
const choice = await evaluate(`(() => ({
  focus: document.activeElement.id,
  options: Array.from(document.querySelectorAll('.choice-option')).map((button) => button.innerText),
  hasContinue: Array.from(document.querySelectorAll('button')).some((button) => button.innerText.trim() === '继续'),
}))()`)
assert.equal(choice.focus, 'choice-title')
assert.equal(choice.hasContinue, false)
assert.deepEqual(choice.options, ['我有点遗憾，没继续学音乐。', '我也有想珍惜的，当下的生活。'])
await capture('choice-390x844')
const regret = await finishChoice('我有点遗憾，没继续学音乐。', 'end-regret-390x844')
assert.equal(regret.end.summary, '你说出了遗憾，也给一次小小的尝试留了位置。')

await clickButton('重听这通来电')
assert.match(await evaluate(`document.querySelector('#incoming-title').innerText`), /正在来电/)
await clickButton('接听')
assert.equal((await readDialogue()).text, expectedLines[0])
const replayMainLines = await runMainLines()
const firstPoint = await clickButton('我也有想珍惜的，当下的生活。', false)
await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...firstPoint, button: 'left', clickCount: 1 })
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...firstPoint, button: 'left', clickCount: 1 })
await settle()
const rapidChoiceResult = await readDialogue()
assert.equal(rapidChoiceResult.text, '那就先别急着否定它。我舍不得舞台，也羡慕你身边那些安稳的日常。')
const cherishFeedback = [rapidChoiceResult]
await clickButton('继续')
cherishFeedback.push(await readDialogue())
await clickButton('继续')
const cherishClosing = await readDialogue()
await clickButton('继续')
const cherishEndResult = await evaluate(`({ read: (() => ({
  choice: document.querySelector('.end-choice').innerText,
  summary: document.querySelector('.end-reflection > p:last-child').innerText,
}))() })`)
const cherishEnd = cherishEndResult.read
assert.equal(cherishEnd.summary, '你珍惜当下，也没有关上另一种可能。')
await capture('end-cherish-390x844')

await clickButton('返回首页')
await clickButton('开始体验')
await clickButton('进入来电')
await clickButton('接听')
await clickButton('继续')
assert.equal((await readDialogue()).text, expectedLines[1])
const reloaded = new Promise((resolve) => waiters.set('Page.loadEventFired', resolve))
await send('Page.reload', { ignoreCache: true })
await reloaded
await settle()
const refreshResult = await evaluate(`(() => ({ heading: document.querySelector('#home-title').innerText, hasDialogue: Boolean(document.querySelector('.dialogue-text')) }))()`)
assert.equal(refreshResult.hasDialogue, false)

await clickButton('开始体验')
await clickButton('进入来电')
await clickButton('接听')
for (let index = 0; index < expectedLines.length; index += 1) await clickButton('继续')
await clickButton('我有点遗憾，没继续学音乐。')
const beforeConfirmation = (await readDialogue()).text
assert.equal(beforeConfirmation, '我也会想，如果当年选了工程，会不会少一些不安。也许我们都看见了另一边的光。')
await clickButton('结束通话')
const dialogInitial = await evaluate(`(() => ({
  open: document.querySelector('dialog').open,
  focus: document.activeElement.innerText,
  title: document.querySelector('#confirm-title').innerText,
}))()`)
assert.equal(dialogInitial.open, true)
await capture('confirm-end-390x844')
await key('Escape')
const escapeResult = await evaluate(`(() => ({ open: document.querySelector('dialog').open, text: document.querySelector('.dialogue-text').innerText, focus: document.activeElement.innerText }))()`)
assert.equal(escapeResult.open, false)
assert.equal(escapeResult.text, beforeConfirmation)
assert.equal(escapeResult.focus, '结束通话')

await clickButton('结束通话')
const focusCycle = []
for (const keyName of ['Tab', 'Tab', 'Shift+Tab']) {
  if (keyName === 'Shift+Tab') {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 })
    await settle(180)
  } else {
    await key('Tab')
  }
  focusCycle.push(await evaluate(`(() => ({
    text: document.activeElement.innerText,
    contained: document.querySelector('dialog').contains(document.activeElement),
    isBody: document.activeElement === document.body,
    backgroundControlFocused: document.activeElement.matches('.call-session button'),
  }))()`))
}
assert.ok(focusCycle.every(({ backgroundControlFocused }) => !backgroundControlFocused))
await clickButton('继续')
const backgroundClickResult = await readDialogue()
assert.equal(backgroundClickResult.text, beforeConfirmation)
await clickButton('取消')
assert.equal((await readDialogue()).text, beforeConfirmation)
const cancelFocus = await evaluate(`document.activeElement.innerText`)
assert.equal(cancelFocus, '结束通话')
await clickButton('结束通话')
await clickButton('确认结束')
const confirmedHome = await evaluate(`(() => ({
  heading: document.querySelector('#home-title').innerText,
  dialogOpen: document.querySelector('dialog').open,
  focus: document.activeElement.innerText,
  focusVisible: document.activeElement.matches(':focus-visible'),
}))()`)
assert.match(confirmedHome.heading, /未接来电/)
assert.equal(confirmedHome.dialogOpen, false)
assert.equal(confirmedHome.focus, '开始体验')
await capture('confirmed-home-390x844')
await key('Enter')
const confirmedRestart = await evaluate(`(() => ({
  heading: document.querySelector('#intro-title')?.innerText,
  focus: document.activeElement.id,
}))()`)
assert.equal(confirmedRestart.focus, 'intro-title')
await clickButton('进入来电')
await clickButton('接听')
const afterConfirmedReset = (await readDialogue()).text
assert.equal(afterConfirmedReset, expectedLines[0])

const interactionResults = {
  intro,
  firstMainLines,
  choice,
  regret,
  replay: {
    mainLines: replayMainLines,
    rapidChoiceResult,
    feedback: cherishFeedback,
    closing: cherishClosing,
    end: cherishEnd,
  },
  refreshResult,
  confirmation: {
    beforeConfirmation,
    dialogInitial,
    escapeResult,
    focusCycle,
    backgroundClickResult,
    cancelFocus,
    confirmedHome,
    confirmedRestart,
    afterConfirmedReset,
  },
}
await writeFile(`${assets}/r1-interaction-results.json`, JSON.stringify(interactionResults, null, 2) + '\n')

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await navigate()
const keyboardSteps = []
async function recordStep(action) {
  keyboardSteps.push(await evaluate(`((action) => ({
    action,
    activeText: document.activeElement.innerText,
    activeId: document.activeElement.id,
    focusVisible: document.activeElement.matches(':focus-visible'),
    outlineStyle: getComputedStyle(document.activeElement).outlineStyle,
    outlineWidth: getComputedStyle(document.activeElement).outlineWidth,
  }))(${JSON.stringify(action)})`))
}
async function tabTo(text) {
  for (let count = 0; count < 8; count += 1) {
    const active = await evaluate(`document.activeElement.innerText.trim()`)
    if (active === text) {
      await recordStep(`focus ${text}`)
      return
    }
    await key('Tab')
  }
  throw new Error(`keyboard focus did not reach ${text}`)
}

await tabTo('开始体验')
await capture('keyboard-focus-start')
await key('Enter')
await recordStep('Enter 开始体验')
await tabTo('进入来电')
await key('Enter')
await recordStep('Enter 进入来电')
await tabTo('接听')
await key('Space')
await recordStep('Space 接听')
for (let index = 0; index < 7; index += 1) {
  await tabTo('继续')
  await key(index % 2 === 0 ? 'Enter' : 'Space')
  await recordStep(`推进主线 ${index + 1}`)
}
await tabTo('我有点遗憾，没继续学音乐。')
await capture('keyboard-choice-focus')
await key('Enter')
await recordStep('Enter 第一次选择')
for (let index = 0; index < 3; index += 1) {
  await tabTo('继续')
  await key(index % 2 === 0 ? 'Space' : 'Enter')
  await recordStep(`推进反馈与收束 ${index + 1}`)
}
assert.equal(await evaluate(`document.activeElement.id`), 'end-title')
await tabTo('返回首页')
await key('Enter')
await recordStep('Enter 结束后返回首页')
assert.match(await evaluate(`document.querySelector('#home-title').innerText`), /未接来电/)

await tabTo('开始体验')
await key('Enter')
await tabTo('进入来电')
await key('Enter')
await tabTo('接听')
await key('Space')
await tabTo('结束通话')
await key('Enter')
assert.equal(await evaluate(`document.activeElement.innerText`), '取消')
await key('Tab')
assert.equal(await evaluate(`document.activeElement.innerText`), '确认结束')
await key('Space')
const keyboardConfirmedHome = await evaluate(`(() => ({
  heading: document.querySelector('#home-title').innerText,
  dialogOpen: document.querySelector('dialog').open,
  focus: document.activeElement.innerText,
  focusVisible: document.activeElement.matches(':focus-visible'),
}))()`)
assert.match(keyboardConfirmedHome.heading, /未接来电/)
assert.equal(keyboardConfirmedHome.dialogOpen, false)
assert.equal(keyboardConfirmedHome.focus, '开始体验')
await recordStep('Space 确认结束并返回首页')
await capture('confirmed-home-keyboard-1440x900')
await key('Enter')
const keyboardConfirmedRestart = await evaluate(`(() => ({
  heading: document.querySelector('#intro-title')?.innerText,
  focus: document.activeElement.id,
}))()`)
assert.equal(keyboardConfirmedRestart.focus, 'intro-title')
await recordStep('Enter 确认退出后立即再次开始')
await writeFile(`${assets}/r1-keyboard-confirmation.json`, JSON.stringify({ keyboardConfirmedHome, keyboardConfirmedRestart }, null, 2) + '\n')

assert.ok(keyboardSteps.filter((step) => step.activeText === '开始体验').some((step) => step.focusVisible && step.outlineStyle === 'solid'))
await writeFile(`${assets}/r1-keyboard-results.json`, JSON.stringify(keyboardSteps, null, 2) + '\n')

const version = await send('Browser.getVersion')
const externalRequests = [...requests.values()].filter((url) => /^https?:/.test(url) && !url.startsWith(baseUrl))
const failedResponses = responses.filter(({ status }) => status >= 400)
const browserResults = {
  browser: version.product,
  userAgent: version.userAgent,
  requestUrls: [...new Set(requests.values())],
  externalRequests,
  failedResponses,
  loadingFailures,
  exceptions,
  logEntries,
}
assert.deepEqual(externalRequests, [])
assert.deepEqual(failedResponses, [])
assert.deepEqual(loadingFailures, [])
assert.deepEqual(exceptions, [])
assert.deepEqual(logEntries, [])
await writeFile(`${assets}/r1-browser-results.json`, JSON.stringify(browserResults, null, 2) + '\n')
console.log(JSON.stringify({
  mainLineCount: firstMainLines.length,
  regretSummary: regret.end.summary,
  cherishSummary: cherishEnd.summary,
  rapidChoiceResult: rapidChoiceResult.text,
  refreshResult,
  confirmation: interactionResults.confirmation,
  keyboardStepCount: keyboardSteps.length,
  keyboardConfirmedHome,
  keyboardConfirmedRestart,
  browserResults,
}, null, 2))
socket.close()
