import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const cdpPort = process.env.CDP_PORT || '9224'
const pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json()
const target = pages.find((page) => page.type === 'page' && page.url.startsWith('http://127.0.0.1:4173/'))
  ?? pages.find((page) => page.type === 'page')
assert.ok(target, 'a browser page is available')

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

const settle = (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(expression, timeout = 8000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await settle(80)
  }
  throw new Error(`Timed out: ${expression}`)
}

async function setViewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await settle(180)
}

async function pointOf(selector, text = '', index = null) {
  const point = await evaluate(`(() => {
    const wanted = ${JSON.stringify(text)}.replace(/\\s+/g, '')
    const candidates = [...document.querySelectorAll(${JSON.stringify(selector)})].filter((candidate) => {
      const rect = candidate.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    })
    const element = ${index === null ? `candidates.find((candidate) => candidate.textContent.replace(/\\s+/g, '').includes(wanted))` : `candidates[${index}]`}
    if (!element) return null
    element.scrollIntoView({ block: 'center' })
    const rect = element.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })()`)
  assert.ok(point, `element exists: ${selector} ${text} ${index ?? ''}`)
  await settle(60)
  return point
}

async function clickPoint(point, clickCount = 1) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount })
  await settle(170)
}

async function click(selector, text = '', index = null) {
  const point = await pointOf(selector, text, index)
  await clickPoint(point)
}

async function clickSurface(x = 280, y = 300) {
  const point = await evaluate(`(() => {
    const element = document.elementFromPoint(${x}, ${y})
    if (!element) return null
    if (element.closest('button, a, input, select, textarea, dialog, [role="dialog"]')) return null
    return { x: ${x}, y: ${y} }
  })()`)
  assert.ok(point, 'surface point is clickable and not a button')
  await clickPoint(point)
}

const screenshot = async (name) => {
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  const file = new URL(`${name}.png`, import.meta.url)
  await writeFile(file, Buffer.from(shot.data, 'base64'))
  return file.pathname
}

const state = () => evaluate(`(() => ({
  view: document.querySelector('.app-background')?.dataset.view ?? null,
  heading: document.querySelector('h1')?.textContent?.trim() ?? null,
  line: document.querySelector('.dialogue-text')?.textContent?.trim() ?? null,
  progress: document.querySelector('.dialogue-progress')?.textContent?.trim() ?? null,
  choices: [...document.querySelectorAll('.choice-option')].map((element) => element.textContent.replace(/\\s+/g, ' ').trim()),
  end: document.querySelector('.career-ending h2')?.textContent?.trim() ?? null,
  endTitle: document.querySelector('.end-layout h1, .end-layout h2')?.textContent?.trim() ?? null,
  letter: document.querySelector('.letter-body')?.textContent?.trim() ?? null,
  hubCards: [...document.querySelectorAll('.hub-card')].map((element) => ({ text: element.textContent.replace(/\\s+/g, ' ').trim(), read: element.classList.contains('is-read') })),
  finaleLine: Boolean(document.querySelector('.hub-finale')),
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  transition: Boolean(document.querySelector('.screen-transition')),
}))()`)

const viewIs = (view) => `document.querySelector('.app-background')?.dataset.view === '${view}'`

async function waitView(view, timeout = 8000) {
  await waitFor(viewIs(view), timeout)
  await settle(420)
}

async function advanceCall(limit = 50) {
  for (let index = 0; index < limit; index += 1) {
    const current = await state()
    if (current.choices.length) return current
    if (await evaluate("Boolean(document.querySelector('.end-layout'))")) return current
    const continueButton = await evaluate("Boolean(document.querySelector('.dialogue-continue'))")
    if (continueButton) await click('.dialogue-continue')
    else await clickSurface()
  }
  throw new Error('call did not reach a choice or ending')
}

async function playCareer(label, pattern) {
  const startedAt = Date.now()
  await click('.hub-card', label)
  await waitView('career')
  const start = await state()
  let choiceIndex = 0
  let end = null
  let letter = null
  let choicesSeen = []

  for (let step = 0; step < 100; step += 1) {
    const current = await state()
    if (current.choices.length) {
      choicesSeen.push(current.choices)
      const wanted = pattern[choiceIndex] ?? 0
      await click('.choice-option', '', wanted)
      choiceIndex += 1
      continue
    }
    if (await evaluate("Boolean(document.querySelector('.career-ending'))")) {
      end = (await state()).end
      await click('.career-ending .dialogue-continue')
      await waitFor("Boolean(document.querySelector('#letter-title'))")
      await settle(420)
      letter = (await state()).letter
      await click('button.primary-action', '读完，回总机')
      await waitView('hub')
      const hub = await state()
      const card = hub.hubCards.find((item) => item.text.includes(label))
      assert.ok(card?.read, `${label} is marked read`)
      return { label, pattern, startLine: start.line, choicesSeen, end, letter: letter?.slice(0, 90), cardRead: card.read, ms: Date.now() - startedAt }
    }
    if (await evaluate("Boolean(document.querySelector('.letter-panel'))")) {
      letter = (await state()).letter
      await click('button.primary-action', '读完，回总机')
      await waitView('hub')
      const hub = await state()
      const card = hub.hubCards.find((item) => item.text.includes(label))
      assert.ok(card?.read, `${label} is marked read`)
      return { label, pattern, startLine: start.line, choicesSeen, end, letter: letter?.slice(0, 90), cardRead: card.read, ms: Date.now() - startedAt }
    }
    const continueButton = await evaluate("Boolean(document.querySelector('.dialogue-continue'))")
    if (continueButton) await click('.dialogue-continue')
    else await clickSurface()
  }
  throw new Error(`${label} did not reach an ending`)
}

await send('Network.enable')
await send('Runtime.enable')
await setViewport(1440, 900)
await send('Page.navigate', { url: `http://127.0.0.1:4173/?clickthrough=${Date.now()}` })
await waitView('home', 10000)

const results = []
await click('button', '开始体验')
await waitView('intro')
await click('button', '进入来电')
await waitView('incoming')
await click('button', '接听')
await waitView('call')

await advanceCall()
const firstChoice = await state()
assert.equal(firstChoice.choices.length, 2)
await click('.choice-option', '', 1)
await advanceCall()
const secondChoice = await state()
assert.equal(secondChoice.choices.length, 2)
await click('.choice-option', '', 1)
await advanceCall()
await waitFor("Boolean(document.querySelector('.end-layout'))")
await settle(420)
const firstEnding = await state()
results.push({ step: 'first-ending', ...firstEnding })
await screenshot('desktop-click-first-ending-1440')

await click('button.primary-action', '继续')
await waitView('identity')
await click('.identity-option', '刚离开工程')
await waitView('hub')
const hub = await state()
assert.equal(hub.hubCards.length, 4)
results.push({ step: 'hub', ...hub })
await screenshot('desktop-click-hub-1440')

await click('.hub-card', '医生')
await waitView('career')
const surfaceStart = await state()
await clickSurface()
const surfaceAfter = await state()
assert.notEqual(`${surfaceStart.line}|${surfaceStart.progress}`, `${surfaceAfter.line}|${surfaceAfter.progress}`, 'clicking the scene advances one line')
results.push({ step: 'surface-click', before: surfaceStart.progress, after: surfaceAfter.progress })

const doubleBefore = await state()
await clickPoint({ x: 280, y: 300 }, 1)
await settle(90)
const doubleMid = await state()
await clickPoint({ x: 280, y: 300 }, 2)
await settle(240)
const doubleAfter = await state()
assert.notEqual(`${doubleBefore.line}|${doubleBefore.progress}`, `${doubleMid.line}|${doubleMid.progress}`, 'first half of a double click advances')
assert.equal(doubleAfter.line, doubleMid.line, 'second half of a double click is ignored')
assert.equal(doubleAfter.progress, doubleMid.progress, 'double click does not skip a second line')
results.push({ step: 'double-click', before: doubleBefore.progress, after: doubleAfter.progress })

const selected = await evaluate(`(() => {
  const element = document.querySelector('.dialogue-text')
  if (!element) return ''
  const range = document.createRange()
  range.selectNodeContents(element)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  return selection.toString()
})()`)
assert.ok(selected.length > 0, 'dialogue text can be selected')
const selectionBefore = await state()
await clickSurface()
const selectionAfter = await state()
assert.equal(selectionAfter.line, selectionBefore.line, 'selection click does not advance')
assert.equal(selectionAfter.progress, selectionBefore.progress, 'selection click keeps progress')
results.push({ step: 'selection-guard', selected: selected.slice(0, 12), progress: selectionAfter.progress })

await click('.header-end-call')
await waitFor("document.querySelector('.confirm-dialog')?.open === true")
await click('.confirm-dialog button', '取消')
await waitFor("document.querySelector('.confirm-dialog')?.open === false")
assert.equal((await state()).view, 'career', 'cancel keeps the career open')
await click('.header-end-call')
await waitFor("document.querySelector('.confirm-dialog')?.open === true")
await click('.confirm-dialog button', '确认返回总机')
await waitView('hub')
results.push({ step: 'end-call-confirm', ...(await state()) })

const careers = [
  await playCareer('医生', [0, 0]),
  await playCareer('教师', [0, 1]),
  await playCareer('设计师', [1, 0]),
  await playCareer('创业者', [1, 1]),
]
results.push(...careers.map((career) => ({ step: 'career', ...career })))
await screenshot('desktop-click-final-hub-1440')

const finaleEntry = await evaluate("Boolean(document.querySelector('.hub-finale .primary-action'))")
assert.equal(finaleEntry, true, 'finale is unlocked after reading a letter')
await click('.hub-finale .primary-action')
await waitView('finale')
await clickSurface()
await advanceCall(3).catch(() => {})
for (let index = 0; index < 40; index += 1) {
  if (await evaluate("Boolean(document.querySelector('#finale-title'))")) break
  const continueButton = await evaluate("Boolean(document.querySelector('.dialogue-continue'))")
  if (continueButton) await click('.dialogue-continue')
  else await clickSurface()
}
await waitFor("Boolean(document.querySelector('#finale-title'))")
await settle(420)
const finale = await state()
results.push({ step: 'finale', ...finale })
await screenshot('desktop-click-finale-1440')

await click('button.primary-action', '返回总机')
await waitView('hub')
results.push({ step: 'return-hub', ...(await state()) })

assert.deepEqual(failures, [], 'no failed requests')
assert.deepEqual(consoleEvents, [], 'no console errors')
assert.ok(results.filter((item) => 'overflow' in item).every((item) => item.overflow === false), 'no horizontal overflow at 1440')

const report = {
  viewport: '1440x900',
  result: 'desktop click-through passed',
  steps: results,
  failures,
  consoleEvents,
}
await writeFile(new URL('desktop-click-through.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ result: report.result, steps: results.map((item) => item.step), failures, consoleEvents }, null, 2))
socket.close()