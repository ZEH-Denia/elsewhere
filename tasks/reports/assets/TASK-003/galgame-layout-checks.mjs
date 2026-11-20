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
  await settle(140)
}

async function navigateHome() {
  await send('Page.navigate', { url: `http://127.0.0.1:4173/?t=${Date.now()}` })
  await waitFor("document.querySelector('h1')?.textContent.includes('未接来电')")
  await waitFor("document.querySelector('.scene-current')?.naturalWidth > 0")
  await settle(280)
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
    const wanted = ${JSON.stringify(label)}.replace(/\\s+/g, '')
    const button = [...document.querySelectorAll('button')].find((element) => {
      const rect = element.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && element.textContent.replace(/\\s+/g, '').includes(wanted)
    })
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
  await settle(140)
}

async function hoverText(label) {
  const point = await buttonPoint(label)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await settle(480)
}

async function screenshot(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const width = Math.ceil(metrics.cssLayoutViewport.clientWidth)
  const height = Math.ceil(metrics.cssLayoutViewport.clientHeight)
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width, height, scale: 1 } })
  const file = new URL(`galgame-${name}.png`, import.meta.url)
  await writeFile(file, Buffer.from(result.data, 'base64'))
  return file.pathname
}

async function snapshot() {
  await waitFor("(() => { const el = document.querySelector('.screen-transition'); return !el || el.getAnimations().every((animation) => animation.playState !== 'running') })()", 2000)
  await settle(30)
  return evaluate(`(() => {
    const box = (element) => {
      if (!element) return null
      const rect = element.getBoundingClientRect()
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right) }
    }
    const display = (selector, pseudo) => {
      const element = document.querySelector(selector)
      return element ? getComputedStyle(element, pseudo).display : 'absent'
    }
    const main = document.querySelector('.app-main')
    const screen = document.querySelector('.screen-enter')
    const callSession = document.querySelector('.call-session')
    const panel = document.querySelector('.dialogue-panel')
    const optionsEl = document.querySelector('.choice-options')
    const options = [...document.querySelectorAll('.choice-option')]
    const header = document.querySelector('.app-header')
    const headerCall = document.querySelector('.header-call')
    const endCall = document.querySelector('.header-end-call')
    const scene = document.querySelector('.scene-current')
    const preview = document.querySelector('.scene-preview')
    const footer = document.querySelector('.app-footer')
    const choiceHeading = document.querySelector('#choice-title')
    const active = document.activeElement
    const endActions = [...document.querySelectorAll('.end-layout .action-row button')]
    const preludeHeading = document.querySelector('.home-title-cn') ?? document.querySelector('.prelude h1')
    const preludePanel = document.querySelector('.prelude-panel')
    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: { width: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, height: document.documentElement.scrollHeight },
      view: document.querySelector('.app-background')?.dataset.view || '',
      main: { classes: main?.className || '', padding: main ? getComputedStyle(main).padding : '', rect: box(main) },
      prelude: {
        panel: box(preludePanel),
        stage: box(document.querySelector('.prelude-stage')),
        card: box(document.querySelector('.prelude-stage .call-card')),
        primary: box(document.querySelector('.prelude-actions .primary-action')),
        return: box(document.querySelector('.panel-return-action')),
        headingFont: preludeHeading ? parseFloat(getComputedStyle(preludeHeading).fontSize) : 0,
        copy: box(document.querySelector('.prelude-copy')),
      },
      scene: {
        src: scene?.getAttribute('src') || '',
        opacity: scene ? getComputedStyle(scene).opacity : '',
        rect: box(scene),
        previewSrc: preview?.getAttribute('src') || '',
        previewOpacity: preview ? getComputedStyle(preview).opacity : '',
        previewing: document.querySelector('.scene-background')?.classList.contains('is-previewing') || false,
        border: document.querySelector('.scene-background') ? getComputedStyle(document.querySelector('.scene-background')).borderColor : '',
      },
      veil: {
        display: display('.screen-enter', '::before'),
        backgroundImage: screen ? getComputedStyle(screen, '::before').backgroundImage : 'absent',
      },
      header: {
        rect: box(header),
        call: box(headerCall),
        callTitle: document.querySelector('.header-call-title')?.textContent.trim() || '',
        endCall: endCall ? endCall.textContent.trim() : '',
        endCallRect: box(endCall),
        metaDisplay: display('.header-meta'),
      },
      footer: display('.app-footer'),
      session: box(callSession),
      sessionVeil: display('.call-session', '::before'),
      dock: box(document.querySelector('.call-dock')),
      panel: {
        rect: box(panel),
        backgroundImage: panel ? getComputedStyle(panel).backgroundImage : '',
        backdropFilter: panel ? getComputedStyle(panel).backdropFilter : '',
        speaker: document.querySelector('.speaker-name')?.textContent.trim() || '',
        origin: document.querySelector('.speaker-origin')?.textContent.trim() || '',
        originDisplay: display('.speaker-origin'),
        progress: document.querySelector('.dialogue-progress')?.textContent.trim() || '',
        line: document.querySelector('.dialogue-text')?.textContent.trim() || '',
        hintDisplay: display('.choice-hint'),
      },
      continue: {
        rect: box(document.querySelector('.dialogue-continue')),
        iconBackground: document.querySelector('.dialogue-continue .action-icon') ? getComputedStyle(document.querySelector('.dialogue-continue .action-icon')).backgroundColor : '',
      },
      choices: {
        rect: box(optionsEl),
        count: options.length,
        labels: options.map((option) => option.querySelector('.choice-label')?.textContent.trim() || ''),
        rects: options.map((option) => box(option)),
        indexDisplay: options[0] ? getComputedStyle(options[0].querySelector('.choice-index')).display : 'absent',
        background: options[0] ? getComputedStyle(options[0]).backgroundColor : '',
        heading: choiceHeading?.textContent.trim() || '',
      },
      activeElement: active?.className || active?.tagName || '',
      activeText: active?.textContent?.trim().slice(0, 40) || '',
      endActions: endActions.map((button) => ({
        text: button.textContent.trim(),
        background: getComputedStyle(button).backgroundColor,
        color: getComputedStyle(button).color,
      })),
      callLiveState: document.querySelector('.call-live-state .call-state')?.dataset.state || '',
      titleShadow: choiceHeading ? getComputedStyle(choiceHeading).textShadow : '',
      dialogOpen: document.querySelector('.confirm-dialog')?.open || false,
    }
  })()`)
}

function assertPage(snapshot) {
  assert.ok(snapshot.document.width <= snapshot.viewport.width, `no horizontal overflow at ${snapshot.viewport.width}: ${snapshot.document.width}`)
}

function assertPrelude(snapshot, { mobile = false, card = true } = {}) {
  assertPage(snapshot)
  assert.equal(snapshot.veil.display, 'none', 'prelude has no central paper veil')
  assert.equal(snapshot.scene.opacity, '1', 'prelude scene is fully opaque')
  assert.equal(snapshot.footer, 'absent', 'prelude has no global footer')
  assert.ok(snapshot.prelude.panel, 'prelude panel exists')
  assert.ok(snapshot.prelude.primary, 'prelude primary action exists')
  assert.ok(snapshot.prelude.panel.bottom <= snapshot.viewport.height, 'prelude panel is on screen')
  assert.ok(snapshot.prelude.panel.left >= 0 && snapshot.prelude.panel.right <= snapshot.viewport.width, 'prelude panel has no horizontal overflow')
  assert.ok(snapshot.document.height <= snapshot.viewport.height + 1, 'prelude fits one screen')
  assert.ok(snapshot.prelude.headingFont >= (mobile ? 26 : 30), `prelude heading is legible: ${snapshot.prelude.headingFont}`)
  if (!card) return
  if (mobile) {
    assert.equal(snapshot.prelude.card.width, 0, 'mobile hides the call card stage')
  } else {
    assert.ok(snapshot.prelude.card.width > 0, 'desktop keeps the call card visible')
    assert.ok(snapshot.prelude.panel.top > snapshot.prelude.card.bottom, 'panel sits below the card')
  }
}

function assertPrimaryAligned(a, b, label) {
  assert.ok(Math.abs(a.prelude.primary.left - b.prelude.primary.left) <= 1, `${label} primary left aligns`)
  assert.ok(Math.abs(a.prelude.primary.top - b.prelude.primary.top) <= 1, `${label} primary top aligns: ${a.prelude.primary.top} vs ${b.prelude.primary.top}`)
  assert.ok(Math.abs(a.prelude.primary.width - b.prelude.primary.width) <= 1, `${label} primary width aligns`)
}

function assertLayout(snapshot, expectedWidth) {
  assertPage(snapshot)
  assert.equal(snapshot.sessionVeil, 'none', 'call view has no central paper veil')
  assert.equal(snapshot.scene.opacity, '1', 'scene is fully opaque')
  assert.equal(snapshot.header.callTitle, '第一通来电', 'call title is in the header')
  assert.equal(snapshot.header.endCall, '结束通话', 'end-call control is in the header')
  assert.equal(snapshot.header.metaDisplay, 'absent', 'call header replaces the product meta')
  assert.equal(snapshot.footer, 'absent', 'call view has no global footer')
  assert.ok(snapshot.panel.rect, 'dialogue panel exists')
  assert.ok(snapshot.panel.rect.top > snapshot.viewport.height * 0.5, `panel sits in the lower half: ${snapshot.panel.rect.top}`)
  assert.ok(snapshot.panel.rect.bottom <= snapshot.viewport.height, 'panel is on screen')
  assert.ok(snapshot.panel.rect.left >= 0 && snapshot.panel.rect.right <= snapshot.viewport.width, 'panel has no horizontal overflow')
  assert.ok(Math.abs(snapshot.panel.rect.width - expectedWidth) <= 4, `panel width is ${expectedWidth}: ${snapshot.panel.rect.width}`)
  assert.ok(snapshot.document.height <= snapshot.viewport.height + 1, 'call view fits one screen')
  assert.ok(snapshot.titleShadow === 'none' || snapshot.titleShadow === '', 'no heading shadow')
}

function assertDialogue(snapshot, expectedWidth) {
  assertLayout(snapshot, expectedWidth)
  assert.ok(snapshot.continue.rect, 'continue action exists')
  assert.ok(snapshot.continue.rect.width < 180, `continue is a compact page turn: ${snapshot.continue.rect.width}`)
  assert.ok(snapshot.continue.rect.height >= 40, 'continue keeps a touch target')
}

function assertChoice(snapshot, expectedWidth) {
  assertLayout(snapshot, expectedWidth)
  assert.equal(snapshot.choices.count, 2, 'two choice buttons')
  assert.ok(snapshot.choices.rect, 'choice stack exists')
  assert.ok(snapshot.choices.rect.bottom <= snapshot.panel.rect.top - 8, 'choices sit above the prompt panel')
  assert.ok(snapshot.choices.rect.top > snapshot.header.rect.bottom, 'choices clear the app header')
  assert.ok(snapshot.choices.rect.left >= 0 && snapshot.choices.rect.right <= snapshot.viewport.width, 'choices have no horizontal overflow')
  assert.ok(snapshot.choices.labels.every(Boolean), 'choices have labels')
  assert.equal(snapshot.continue.rect, null, 'choice state replaces the continue action with hints')
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
  }
  await waitFor("Boolean(document.querySelector('#choice-title'))")
}

async function finishEnding() {
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
  date: '2026-11-20',
  preview: 'http://127.0.0.1:4173/',
  viewports: {},
  previewState: {},
  keyboardState: {},
  ending: {},
  reducedMotion: {},
  failures,
  consoleEvents,
}

async function capturePreludes(name, { mobile = false } = {}) {
  await navigateHome()
  const home = await snapshot()
  assertPrelude(home, { mobile })
  report.viewports[`home${name}`] = { ...home, screenshot: await screenshot(`home-${name}`) }
  await clickText('开始体验')
  await waitFor("Boolean(document.querySelector('#intro-title'))")
  const intro = await snapshot()
  assertPrelude(intro, { mobile, card: false })
  assertPrimaryAligned(home, intro, `${name} home/intro`)
  report.viewports[`intro${name}`] = { ...intro, screenshot: await screenshot(`intro-${name}`) }
  await clickText('进入来电')
  await waitFor("Boolean(document.querySelector('#incoming-title'))")
  const incoming = await snapshot()
  assertPrelude(incoming, { mobile })
  assertPrimaryAligned(home, incoming, `${name} home/incoming`)
  report.viewports[`incoming${name}`] = { ...incoming, screenshot: await screenshot(`incoming-${name}`) }
  await navigateHome()
  return home
}

try {
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Network.setCacheDisabled', { cacheDisabled: true })
  await send('Page.bringToFront')

  await setViewport(1440, 900)
  await capturePreludes('1440')
  await openCall()
  const dialogue1440 = await snapshot()
  assertDialogue(dialogue1440, 1120)
  assert.equal(dialogue1440.callLiveState, 'connected')
  assert.notEqual(dialogue1440.panel.originDisplay, 'none')
  report.viewports.dialogue1440 = { ...dialogue1440, screenshot: await screenshot('dialogue-1440') }

  await clickText('结束通话')
  await waitFor("document.querySelector('.confirm-dialog')?.open === true")
  report.confirm = { opened: true }
  await clickText('取消')
  await waitFor("document.querySelector('.confirm-dialog')?.open === false")
  report.confirm.closed = true

  await reachFirstChoice()
  const choice1440 = await snapshot()
  assertChoice(choice1440, 1120)
  assert.equal(choice1440.scene.src, '/backgrounds/first-choice.svg')
  assert.notEqual(choice1440.choices.indexDisplay, 'none')
  assert.equal(choice1440.panel.hintDisplay, 'block')
  assert.ok(choice1440.choices.rect.width >= 740, `choice stack is ${choice1440.choices.rect.width}`)
  report.viewports.choice1440 = { ...choice1440, screenshot: await screenshot('choice-1440') }

  await evaluate("document.querySelector('.choice-option')?.focus()")
  await settle(420)
  const keyboard = await snapshot()
  report.keyboardState = keyboard
  assert.ok(keyboard.activeElement.includes('choice-option'), 'keyboard focus lands on the first choice')
  assert.equal(keyboard.scene.previewSrc, '/backgrounds/regret.svg', 'focus previews the regret scene')
  assert.equal(keyboard.scene.previewOpacity, '1')
  assert.equal(keyboard.scene.previewing, true)
  await evaluate("document.activeElement?.blur()")
  await settle(160)

  await hoverText('我有点遗憾，当年没有继续学音乐。')
  const preview = await snapshot()
  report.previewState = { ...preview, screenshot: await screenshot('choice-preview-1440') }
  assert.equal(preview.scene.src, '/backgrounds/first-choice.svg')
  assert.equal(preview.scene.previewSrc, '/backgrounds/regret.svg')
  assert.equal(preview.scene.previewOpacity, '1')
  assert.equal(preview.scene.previewing, true)
  assert.notEqual(preview.scene.border, choice1440.scene.border)

  await clickText('我有点遗憾，当年没有继续学音乐。')
  await settle(320)
  const feedback1440 = await snapshot()
  report.viewports.feedback1440 = { ...feedback1440, screenshot: await screenshot('feedback-1440') }
  assert.equal(feedback1440.scene.src, '/backgrounds/regret.svg', 'first feedback uses the regret scene')
  assert.equal(feedback1440.scene.opacity, '1', 'first feedback keeps its scene visible')
  await clickText('继续')
  await clickText('继续')
  await clickText('继续')
  await waitFor("Boolean(document.querySelector('#choice-title'))")
  await clickText('给喜欢的事留一点时间。')
  await settle(320)
  const actionFeedback1440 = await snapshot()
  report.viewports.actionFeedback1440 = { ...actionFeedback1440, screenshot: await screenshot('feedback-action-1440') }
  assert.equal(actionFeedback1440.scene.src, '/backgrounds/make-space.svg', 'action feedback uses the chosen scene')
  assert.equal(actionFeedback1440.scene.opacity, '1', 'action feedback keeps its scene visible')
  await clickText('继续')
  await clickText('继续')
  await waitFor("Boolean(document.querySelector('#end-title'))")
  const ending1440 = await snapshot()
  report.ending = { ...ending1440, screenshot: await screenshot('ending-1440') }
  assertPage(ending1440)
  assert.equal(ending1440.callLiveState, 'ended', 'ending shows the call has ended')
  assert.equal(ending1440.header.callTitle, '', 'ending restores the product header')
  assert.equal(ending1440.footer, 'flex', 'ending keeps the global footer')
  assert.equal(ending1440.veil.display, 'block', 'ending keeps its local paper backing')
  assert.notEqual(ending1440.veil.backgroundImage, 'none', 'ending backing is painted')
  assert.equal(ending1440.endActions.length, 2)
  assert.equal(ending1440.endActions[0].text, '重听这通来电')
  assert.notEqual(ending1440.endActions[0].background, ending1440.endActions[1].background)

  await setViewport(1366, 768)
  await capturePreludes('1366')
  await openCall()
  const dialogue1366 = await snapshot()
  assertDialogue(dialogue1366, 1120)
  report.viewports.dialogue1366 = { ...dialogue1366, screenshot: await screenshot('dialogue-1366') }
  await reachFirstChoice()
  const choice1366 = await snapshot()
  assertChoice(choice1366, 1120)
  report.viewports.choice1366 = { ...choice1366, screenshot: await screenshot('choice-1366') }

  await setViewport(390, 844)
  const home390 = await capturePreludes('390', { mobile: true })
  assert.equal(home390.header.metaDisplay, 'none')
  await openCall()
  const dialogue390 = await snapshot()
  assertDialogue(dialogue390, 350)
  assert.equal(dialogue390.panel.originDisplay, 'none', 'mobile speaker tab hides the origin')
  report.viewports.dialogue390 = { ...dialogue390, screenshot: await screenshot('dialogue-390') }
  await reachFirstChoice()
  const choice390 = await snapshot()
  assertChoice(choice390, 350)
  assert.equal(choice390.choices.indexDisplay, 'none', 'mobile choices hide the index')
  assert.equal(choice390.panel.hintDisplay, 'none', 'mobile prompt hides the preview hint')
  assert.ok(choice390.choices.rect.width >= 330, `mobile choice width is ${choice390.choices.rect.width}`)
  report.viewports.choice390 = { ...choice390, screenshot: await screenshot('choice-390') }

  await setViewport(320, 568)
  const home320 = await capturePreludes('320', { mobile: true })
  assert.equal(home320.header.metaDisplay, 'none')
  await openCall()
  const dialogue320 = await snapshot()
  assertDialogue(dialogue320, 280)
  report.viewports.dialogue320 = { ...dialogue320, screenshot: await screenshot('dialogue-320') }
  await reachFirstChoice()
  const choice320 = await snapshot()
  assertChoice(choice320, 280)
  assert.ok(choice320.choices.rect.top > choice320.header.rect.bottom, '320px choices clear the header')
  report.viewports.choice320 = { ...choice320, screenshot: await screenshot('choice-320') }

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
      panelBackdrop: document.querySelector('.dialogue-panel') ? getComputedStyle(document.querySelector('.dialogue-panel')).backdropFilter : 'absent',
    }
  })()`)
  report.reducedMotion = reducedMotion
  assert.equal(reducedMotion.activeVisibility, 'visible', 'active scene stays visible with reduced motion')
  assert.equal(reducedMotion.activeOpacity, '1', 'active scene stays opaque with reduced motion')
  assert.ok(reducedMotion.outgoingCount === 0 || reducedMotion.outgoingVisibility === 'hidden', 'outgoing layer never covers the new scene with reduced motion')
  await send('Emulation.setEmulatedMedia', { features: [] })

  assert.deepEqual(failures, [])
  assert.deepEqual(consoleEvents, [])
  report.result = 'all galgame layout checks passed'
} catch (error) {
  report.result = 'failed'
  report.error = error.stack
  process.exitCode = 1
} finally {
  await writeFile(new URL('galgame-layout-checks.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
  socket.close()
}

console.log(JSON.stringify({ result: report.result, error: report.error, failures, consoleEvents }, null, 2))