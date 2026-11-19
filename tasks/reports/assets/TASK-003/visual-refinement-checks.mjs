import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const cdpPort = process.env.CDP_PORT || '9224'
const pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json()
const target = pages.find((page) => page.type === 'page' && (page.url === 'about:blank' || page.url.startsWith('http://127.0.0.1:4173/')))
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
  let result
  try {
    result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  } catch (error) {
    throw new Error(`${error.message} :: ${expression.slice(0, 160)}`)
  }
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}

const settle = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(expression, timeout = 5000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await settle(40)
  }
  throw new Error(`Timed out: ${expression}`)
}

async function setViewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await settle(120)
}

async function navigateHome() {
  await send('Page.navigate', { url: 'http://127.0.0.1:4173/' })
  await waitFor("document.querySelector('h1')?.textContent.includes('未接来电')")
  await waitFor("document.querySelector('.scene-current')?.naturalWidth > 0")
  await settle(260)
}

async function rectOf(selector) {
  return evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)})
    if (!element) return null
    const rect = element.getBoundingClientRect()
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
  })()`)
}

async function buttonPoint(label) {
  const point = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((element) => element.textContent.trim() === ${JSON.stringify(label)} && element.getBoundingClientRect().width > 0)
    if (!button) return null
    button.scrollIntoView({ block: 'center' })
    const rect = button.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })()`)
  assert.ok(point, `button exists: ${label}`)
  await settle(60)
  return point
}

async function clickText(label) {
  const point = await buttonPoint(label)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
  await settle(120)
}

async function hoverText(label) {
  const point = await buttonPoint(label)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await settle(450)
}

async function screenshot(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const width = Math.ceil(metrics.cssLayoutViewport.clientWidth)
  const height = Math.ceil(metrics.cssLayoutViewport.clientHeight)
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width, height, scale: 1 } })
  const file = new URL(`visual-${name}.png`, import.meta.url)
  await writeFile(file, Buffer.from(result.data, 'base64'))
  return file.pathname
}

async function snapshot() {
  return evaluate(`(() => {
    const main = document.querySelector('.app-main')
    const screen = document.querySelector('.screen-enter')
    const heading = screen?.querySelector('h1, h2')
    const primary = [...document.querySelectorAll('.primary-action')].find((element) => element.getBoundingClientRect().width > 0)
    const mainStyle = getComputedStyle(main)
    const veil = getComputedStyle(document.querySelector('.screen-enter'), '::before')
    const scene = document.querySelector('.scene-current')
    const preview = document.querySelector('.scene-preview')
    const cards = [...document.querySelectorAll('.call-card')].filter((element) => element.getBoundingClientRect().width > 0)
    const box = (element) => {
      if (!element) return null
      const rect = element.getBoundingClientRect()
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right) }
    }
    const overlaps = (a, b) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
    const journey = document.querySelector('.journey-actions')
    const headingRect = box(heading)
    const primaryRect = box(primary)
    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: { width: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, height: document.documentElement.scrollHeight },
      view: document.querySelector('.app-background')?.dataset.view || '',
      main: { display: mainStyle.display, direction: mainStyle.flexDirection, justify: mainStyle.justifyContent, align: mainStyle.alignItems, rect: box(main) },
      veil: { width: veil.width, height: veil.height, backgroundImage: veil.backgroundImage, maskImage: veil.maskImage || veil.webkitMaskImage },
      scene: {
        src: scene?.getAttribute('src') || '',
        opacity: scene ? getComputedStyle(scene).opacity : '',
        rect: box(scene),
        previewSrc: preview?.getAttribute('src') || '',
        previewOpacity: preview ? getComputedStyle(preview).opacity : '',
        previewing: document.querySelector('.scene-background')?.classList.contains('is-previewing') || false,
        border: getComputedStyle(document.querySelector('.scene-background')).borderColor,
      },
      screen: box(screen),
      heading: heading?.textContent.trim() || '',
      headingRect,
      primary: primary?.textContent.trim() || '',
      primaryRect,
      journeyRect: box(journey),
      overlap: overlaps(headingRect, primaryRect),
      cards: cards.map((card) => ({
        classes: card.className,
        rect: box(card),
        background: getComputedStyle(card).backgroundColor,
        border: getComputedStyle(card).borderColor,
        status: card.dataset.callStatus || '',
        state: card.querySelector('.call-state')?.dataset.state || '',
        signalBars: card.querySelectorAll('.signal-lines i').length,
        flatline: Boolean(card.querySelector('.signal-flatline')),
      })),
      callLiveState: document.querySelector('.call-live-state .call-state')?.dataset.state || '',
      endActions: [...document.querySelectorAll('.end-layout .action-row button')].map((button) => ({
        text: button.textContent.trim(),
        background: getComputedStyle(button).backgroundColor,
        color: getComputedStyle(button).color,
        border: getComputedStyle(button).borderColor,
        shadow: getComputedStyle(button).boxShadow,
      })),
      headerMeta: document.querySelector('.header-meta') ? getComputedStyle(document.querySelector('.header-meta')).display : 'absent',
      footer: document.querySelector('.app-footer') ? getComputedStyle(document.querySelector('.app-footer')).display : 'absent',
      titleShadow: heading ? getComputedStyle(heading).textShadow : '',
      dialogueContinue: box(document.querySelector('.dialogue-continue')),
    }
  })()`)
}

function assertBase(snapshot) {
  assert.ok(snapshot.document.width <= snapshot.viewport.width, `no horizontal overflow at ${snapshot.viewport.width}: ${snapshot.document.width}`)
  assert.equal(snapshot.overlap, false, `primary action does not overlap heading at ${snapshot.viewport.width}`)
  assert.equal(snapshot.titleShadow, 'none', 'heading has no text shadow')
}

async function openCall() {
  await clickText('开始体验')
  await clickText('进入来电')
  await clickText('接听')
  await waitFor("Boolean(document.querySelector('.dialogue-text'))")
}

async function reachFirstChoice() {
  for (let index = 0; index < 7; index += 1) {
    await clickText('继续')
    if (index === 2) {
      report.transition = await evaluate(`(() => ({
        outgoing: document.querySelectorAll('.scene-background-image.is-outgoing').length,
        activeOpacity: getComputedStyle(document.querySelector('.scene-current')).opacity,
        outgoingOpacity: document.querySelector('.scene-background-image.is-outgoing') ? getComputedStyle(document.querySelector('.scene-background-image.is-outgoing')).opacity : null,
        paperGap: getComputedStyle(document.querySelector('.scene-background')).backgroundColor,
      }))()`)
    }
  }
  await waitFor("Boolean(document.querySelector('#choice-title'))")
}

async function finishEnding() {
  await hoverText('我有点遗憾，当年没有继续学音乐。')
  await clickText('我有点遗憾，当年没有继续学音乐。')
  await clickText('继续')
  await clickText('继续')
  await clickText('继续')
  await waitFor("Boolean(document.querySelector('#choice-title'))")
  await clickText('给喜欢的事留一点时间。')
  await clickText('继续')
  await clickText('继续')
  await waitFor("Boolean(document.querySelector('#end-title'))")
}

const report = {
  date: '2026-11-19',
  preview: 'http://127.0.0.1:4173/',
  desktop: {},
  mobile: {},
  preview_state: {},
  failures,
  consoleEvents,
}

try {
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Page.bringToFront')

  await setViewport(1440, 900)
  await navigateHome()
  let home = await snapshot()
  assertBase(home)
  assert.equal(home.view, 'home')
  assert.equal(home.scene.opacity, '1')
  assert.ok(home.veil.backgroundImage.includes('rgba(230, 219, 203') || home.veil.backgroundImage.includes('rgba('), home.veil.backgroundImage)
  report.desktop.home = { ...home, screenshot: await screenshot('home-1440') }

  await clickText('开始体验')
  await waitFor("Boolean(document.querySelector('#intro-title'))")
  const intro = await snapshot()
  assertBase(intro)
  report.desktop.intro = { ...intro, screenshot: await screenshot('intro-1440') }

  await clickText('进入来电')
  await waitFor("Boolean(document.querySelector('#incoming-title'))")
  let incoming = await snapshot()
  assertBase(incoming)
  assert.equal(incoming.cards[0].classes.includes('is-object'), true)
  assert.equal(incoming.cards[0].state, 'ringing')
  assert.equal(incoming.cards[0].signalBars, 5)
  report.desktop.incoming = { ...incoming, screenshot: await screenshot('incoming-1440') }

  await clickText('接听')
  await waitFor("Boolean(document.querySelector('.dialogue-text'))")
  let dialogue = await snapshot()
  assertBase(dialogue)
  assert.equal(dialogue.callLiveState, 'connected')
  assert.ok(dialogue.dialogueContinue.width > 700, 'continue is a full-width page turn')
  report.desktop.dialogue = { ...dialogue, screenshot: await screenshot('dialogue-1440') }

  await reachFirstChoice()
  const choiceBase = await snapshot()
  assert.equal(choiceBase.scene.src, '/backgrounds/first-choice.svg')
  assert.equal(choiceBase.scene.previewing, false)
  await hoverText('我有点遗憾，当年没有继续学音乐。')
  let preview = await snapshot()
  assert.equal(preview.scene.src, '/backgrounds/first-choice.svg')
  assert.equal(preview.scene.previewSrc, '/backgrounds/regret.svg')
  assert.equal(preview.scene.previewOpacity, '1')
  assert.equal(preview.scene.previewing, true)
  assert.notEqual(preview.scene.border, choiceBase.scene.border)
  report.preview_state.firstChoice = { ...preview, screenshot: await screenshot('choice-preview-1440') }

  await clickText('我有点遗憾，当年没有继续学音乐。')
  await clickText('继续')
  await clickText('继续')
  await clickText('继续')
  await waitFor("Boolean(document.querySelector('#choice-title'))")
  await clickText('给喜欢的事留一点时间。')
  await clickText('继续')
  await clickText('继续')
  await waitFor("Boolean(document.querySelector('#end-title'))")
  let ending = await snapshot()
  assertBase(ending)
  assert.equal(ending.callLiveState, 'ended', 'ending shows the call has ended')
  assert.equal(ending.endActions.length, 2)
  assert.equal(ending.endActions[0].text, '重听这通来电')
  assert.notEqual(ending.endActions[0].background, ending.endActions[1].background)
  report.desktop.ending = { ...ending, screenshot: await screenshot('ending-1440') }

  await setViewport(1366, 768)
  await navigateHome()
  const home1366 = await snapshot()
  assertBase(home1366)
  report.desktop.home1366 = { ...home1366, screenshot: await screenshot('home-1366') }

  await setViewport(390, 844)
  await navigateHome()
  home = await snapshot()
  assertBase(home)
  assert.equal(home.main.direction, 'column')
  assert.ok(home.journeyRect.top >= home.screen.bottom - 1, 'journey actions flow below the screen section')
  assert.equal(home.headerMeta, 'none')
  report.mobile.home = { ...home, screenshot: await screenshot('home-390') }

  await clickText('开始体验')
  await waitFor("Boolean(document.querySelector('#intro-title'))")
  const mobileIntro = await snapshot()
  assertBase(mobileIntro)
  report.mobile.intro = { ...mobileIntro, screenshot: await screenshot('intro-390') }

  await clickText('进入来电')
  await waitFor("Boolean(document.querySelector('#incoming-title'))")
  incoming = await snapshot()
  assertBase(incoming)
  report.mobile.incoming = { ...incoming, screenshot: await screenshot('incoming-390') }

  await clickText('接听')
  await waitFor("Boolean(document.querySelector('.dialogue-text'))")
  dialogue = await snapshot()
  assertBase(dialogue)
  report.mobile.dialogue = { ...dialogue, screenshot: await screenshot('dialogue-390') }

  await reachFirstChoice()
  report.mobile.choice = { ...await snapshot(), screenshot: await screenshot('choice-390') }

  await setViewport(320, 568)
  await navigateHome()
  home = await snapshot()
  assertBase(home)
  assert.equal(home.footer, 'none')
  report.mobile.home320 = { ...home, screenshot: await screenshot('home-320') }

  await clickText('开始体验')
  await waitFor("Boolean(document.querySelector('#intro-title'))")
  const intro320 = await snapshot()
  assertBase(intro320)
  report.mobile.intro320 = { ...intro320, screenshot: await screenshot('intro-320') }

  await setViewport(1440, 900)
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await navigateHome()
  await openCall()
  for (let index = 0; index < 3; index += 1) {
    await clickText('继续')
  }
  const reducedMotion = await evaluate(`(() => {
    const outgoing = document.querySelector('.scene-background-image.is-outgoing')
    const active = document.querySelector('.scene-current')
    return {
      outgoingCount: document.querySelectorAll('.scene-background-image.is-outgoing').length,
      outgoingVisibility: outgoing ? getComputedStyle(outgoing).visibility : 'absent',
      activeOpacity: active ? getComputedStyle(active).opacity : 'absent',
      activeVisibility: active ? getComputedStyle(active).visibility : 'absent',
    }
  })()`)
  report.reducedMotion = reducedMotion
  assert.equal(reducedMotion.activeVisibility, 'visible', 'active scene stays visible with reduced motion')
  assert.equal(reducedMotion.activeOpacity, '1', 'active scene stays opaque with reduced motion')
  assert.ok(reducedMotion.outgoingCount === 0 || reducedMotion.outgoingVisibility === 'hidden', 'outgoing layer never covers the new scene with reduced motion')
  await send('Emulation.setEmulatedMedia', { features: [] })

  assert.deepEqual(failures, [])
  assert.deepEqual(consoleEvents, [])
  report.result = 'all calibration checks passed'
} catch (error) {
  report.result = 'failed'
  report.error = error.stack
  process.exitCode = 1
} finally {
  await writeFile(new URL('visual-refinement-checks.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
  socket.close()
}

console.log(JSON.stringify({ result: report.result, error: report.error, failures, consoleEvents }, null, 2))