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
    await settle(40)
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
  await settle(450)
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
  await settle(50)
  return point
}

async function click(selector, text = '') {
  const point = await pointOf(selector, text)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
  await settle(60)
}

async function shot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png' })
  const file = new URL(`transition-${name}.png`, import.meta.url)
  await writeFile(file, Buffer.from(result.data, 'base64'))
  return file.pathname
}

async function motion(selector) {
  return evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)})
    if (!element) return null
    const style = getComputedStyle(element)
    return {
      screen: document.querySelector('.screen-transition')?.dataset.screen ?? null,
      animationName: style.animationName,
      duration: style.animationDuration,
      opacity: Number.parseFloat(style.opacity),
      transform: style.transform,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  })()`)
}

const report = { viewport: '1440x900 / 390x844', checks: [], shots: [], failures, consoleEvents }
await send('Network.enable')
await send('Runtime.enable')
await setViewport(1440, 900)
await navigateHome()

const homeStart = await motion('.screen-transition')
assert.equal(homeStart.screen, 'home')
assert.ok(homeStart.animationName.includes('screen-page-in'), 'home enters with the page transition')
assert.equal(homeStart.opacity, 1, 'home settles at full opacity')
report.checks.push({ name: 'home-settled', ...homeStart })

await click('button', '开始体验')
await waitFor("document.querySelector('.screen-transition')?.dataset.screen === 'intro'")
const introEarly = await motion('.screen-transition')
assert.ok(introEarly.animationName.includes('screen-page-in'), 'intro page uses the transition')
assert.ok(introEarly.opacity < 0.99, 'intro is still fading in shortly after the click')
assert.notEqual(introEarly.transform, 'none', 'intro is still rising shortly after the click')
const introShot = await shot('intro-early-1440')
await settle(450)
const introSettled = await motion('.screen-transition')
assert.equal(introSettled.opacity, 1, 'intro reaches full opacity')
assert.ok(['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(introSettled.transform), 'intro finishes its rise')
report.checks.push({ name: 'intro-transition', early: introEarly, settled: introSettled })
report.shots.push(introShot)

await click('button', '进入来电')
await waitFor("document.querySelector('.screen-transition')?.dataset.screen === 'incoming'")
await settle(450)
await click('button', '接听')
await waitFor("document.querySelector('.screen-transition')?.dataset.screen === 'call-dialogue'")
await settle(450)
const callSettled = await motion('.screen-transition')
assert.equal(callSettled.opacity, 1)
await click('.dialogue-continue')
await waitFor("document.querySelector('.dialogue-text')?.textContent.includes('恶作剧')")
const lineEarly = await evaluate(`(() => {
  const element = document.querySelector('.dialogue-line')
  const style = getComputedStyle(element)
  return { animationName: style.animationName, opacity: Number.parseFloat(style.opacity), transform: style.transform }
})()`)
assert.ok(lineEarly.animationName.includes('dialogue-line-in'), 'dialogue line fades in')
report.checks.push({ name: 'dialogue-line-early', ...lineEarly })
const lineShot = await shot('dialogue-line-early-1440')
await settle(320)
const lineSettled = await evaluate(`(() => {
  const style = getComputedStyle(document.querySelector('.dialogue-line'))
  return { name: style.animationName, opacity: Number.parseFloat(style.opacity), transform: style.transform }
})()`)
assert.equal(lineSettled.opacity, 1)
assert.ok(['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(lineSettled.transform))
report.checks.push({ name: 'dialogue-line-settled', ...lineSettled })
report.shots.push(lineShot)

for (let index = 0; index < 6; index += 1) {
  await click('.dialogue-continue')
  await settle(420)
}
await waitFor("document.querySelector('.screen-transition')?.dataset.screen === 'call-first-response'")
const firstChoiceEarly = await motion('.screen-transition')
assert.ok(firstChoiceEarly.animationName.includes('screen-page-in'), 'choice page uses the transition')
await settle(420)
report.checks.push({ name: 'first-choice-transition', ...(await motion('.screen-transition')) })

await click('.choice-option')
await waitFor("document.querySelector('.screen-transition')?.dataset.screen === 'call-dialogue'")
const feedbackEarly = await motion('.screen-transition')
assert.ok(feedbackEarly.animationName.includes('screen-page-in'), 'feedback returns with the page transition')
await settle(420)
report.checks.push({ name: 'feedback-transition', ...(await motion('.screen-transition')) })

await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
await setViewport(1440, 900)
await navigateHome()
const reducedHome = await motion('.screen-transition')
assert.equal(reducedHome.animationName, 'none', 'reduced motion removes the page transition')
assert.equal(reducedHome.opacity, 1)
await click('button', '开始体验')
await waitFor("document.querySelector('.screen-transition')?.dataset.screen === 'intro'")
const reducedIntro = await motion('.screen-transition')
assert.equal(reducedIntro.animationName, 'none')
assert.equal(reducedIntro.opacity, 1)
report.checks.push({ name: 'reduced-motion', home: reducedHome, intro: reducedIntro })
await send('Emulation.setEmulatedMedia', { features: [] })

await setViewport(390, 844)
await navigateHome()
const mobileHome = await motion('.screen-transition')
assert.ok(mobileHome.scrollWidth <= mobileHome.clientWidth + 1, 'mobile page does not overflow horizontally')
await click('button', '开始体验')
await waitFor("document.querySelector('.screen-transition')?.dataset.screen === 'intro'")
await settle(450)
const mobileIntro = await motion('.screen-transition')
assert.equal(mobileIntro.opacity, 1)
assert.ok(mobileIntro.scrollWidth <= mobileIntro.clientWidth + 1, 'mobile intro does not overflow horizontally')
report.checks.push({ name: 'mobile-390', home: mobileHome, intro: mobileIntro })

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await settle(200)
await navigateHome()
assert.deepEqual(failures, [], 'no failed requests')
assert.deepEqual(consoleEvents, [], 'no console errors')
report.result = 'all page transition checks passed'
await writeFile(new URL('page-transition-checks.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ result: report.result, checks: report.checks.length, failures, consoleEvents }, null, 2))
socket.close()