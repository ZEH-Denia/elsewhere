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

async function buttonPoint(selector, text = '') {
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
  const point = await buttonPoint(selector, text)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
}

async function hover(selector, text = '') {
  const point = await buttonPoint(selector, text)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
}

const samplerScript = (duration) => `(() => {
  window.__transitionSamples = [];
  const startedAt = performance.now();
  const tick = () => {
    const layers = [...document.querySelectorAll('.scene-background .scene-layer')];
    const entries = layers.map((element, index) => {
      const image = element.querySelector('img');
      return {
        index,
        opacity: Number.parseFloat(getComputedStyle(element).opacity),
        ready: Boolean(image && image.complete && image.naturalWidth > 0),
        src: image ? image.getAttribute('src') : null,
      };
    });
    let coverage = 0;
    for (const entry of entries) coverage = entry.opacity + coverage * (1 - entry.opacity);
    window.__transitionSamples.push({
      t: Math.round(performance.now() - startedAt),
      coverage: Number(coverage.toFixed(3)),
      layers: entries,
    });
    if (performance.now() - startedAt < ${duration}) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return true;
})()`

async function startSampler(ms = 900) {
  await evaluate(samplerScript(ms))
}

async function readSamples() {
  return evaluate('window.__transitionSamples')
}

function summarize(samples) {
  const gaps = samples.filter((sample) => sample.coverage < 0.985)
  const unreadyVisible = samples.flatMap((sample) =>
    sample.layers.filter((layer) => layer.opacity > 0.01 && !layer.ready).map((layer) => ({ t: sample.t, ...layer })),
  )
  return {
    frames: samples.length,
    minCoverage: Math.min(...samples.map((sample) => sample.coverage)),
    gapFrames: gaps.length,
    unreadyVisibleFrames: unreadyVisible.length,
    gapSamples: gaps.slice(0, 3),
    unreadySamples: unreadyVisible.slice(0, 3),
  }
}

async function screenshot(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const width = Math.ceil(metrics.cssLayoutViewport.clientWidth)
  const height = Math.ceil(metrics.cssLayoutViewport.clientHeight)
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width, height, scale: 1 } })
  const file = new URL(`transition-${name}.png`, import.meta.url)
  await writeFile(file, Buffer.from(result.data, 'base64'))
  return file.pathname
}

const report = { viewport: '1440x900 / 390x844', steps: [], failures, consoleEvents }

await send('Network.enable')
await send('Runtime.enable')

async function runTransition(label, action, options = {}) {
  await startSampler(options.duration ?? 1000)
  await action()
  if (options.midShot) {
    await settle(options.midShotDelay ?? 70)
    report.shots = report.shots ?? []
    report.shots.push(await screenshot(`${label}-mid`))
  }
  await waitFor("window.__transitionSamples && window.__transitionSamples.length > 1", 4000)
  await settle(options.tail ?? 700)
  const summary = summarize(await readSamples())
  report.steps.push({ label, ...summary })
  return summary
}

async function walkToChoice() {
  let guard = 0
  while (guard < 12) {
    const choiceVisible = await evaluate("Boolean(document.querySelector('.choice-option'))")
    if (choiceVisible) return
    const point = await evaluate(`(() => {
      const button = document.querySelector('.dialogue-continue')
      if (!button) return null
      button.scrollIntoView({ block: 'center' })
      const rect = button.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    })()`)
    assert.ok(point, 'dialogue continue button exists')
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
    await settle(420)
    guard += 1
  }
  throw new Error('choice did not appear')
}

// Desktop: home → incoming → call → each of the first scenes.
await setViewport(1440, 900)
await navigateHome()
report.steps.push({
  label: 'initial-scene',
  visibleLayers: await evaluate("document.querySelectorAll('.scene-layer.is-visible').length"),
  decoded: await evaluate("document.querySelector('.scene-current')?.naturalWidth > 0"),
})

await runTransition('home-to-intro', async () => {
  await click('button', '开始体验')
}, { midShot: true })

await runTransition('intro-to-incoming', async () => {
  await click('button', '进入来电')
}, { midShot: true })

await runTransition('incoming-to-call', async () => {
  await click('button', '接听')
}, { midShot: true })

await runTransition('call-first-advance', async () => {
  await click('.dialogue-continue')
}, { midShot: true })

await runTransition('call-rapid-advance', async () => {
  await click('.dialogue-continue')
  await settle(70)
  await click('.dialogue-continue')
})

await walkToChoice()
await settle(400)

const optionPoints = await evaluate(`[...document.querySelectorAll('.choice-option')].map((element) => {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
})`)
assert.ok(optionPoints.length >= 2, 'two choice options exist')

await startSampler(1200)
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...optionPoints[0] })
await settle(120)
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...optionPoints[1] })
await settle(120)
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 })
await settle(900)
const previewSummary = summarize(await readSamples())
report.steps.push({ label: 'choice-preview-switch', ...previewSummary })

report.shots = report.shots ?? []
report.shots.push(await screenshot('preview-off-1440'))

// Mobile: repeat a couple of transitions at 390.
await setViewport(390, 844)
await navigateHome()
await runTransition('mobile-home-to-intro', async () => {
  await click('button', '开始体验')
}, { midShot: true })
await runTransition('mobile-intro-to-incoming', async () => {
  await click('button', '进入来电')
}, { midShot: true })
await runTransition('mobile-incoming-to-call', async () => {
  await click('button', '接听')
}, { midShot: true })

report.shots.push(await screenshot('mobile-call-settled'))

for (const step of report.steps) {
  if (!('minCoverage' in step)) continue
  assert.ok(step.gapFrames === 0, `${step.label}: no background gap frames (${step.gapFrames})`)
  assert.ok(step.unreadyVisibleFrames === 0, `${step.label}: no undecoded layer is ever visible (${step.unreadyVisibleFrames})`)
  assert.ok(step.minCoverage >= 0.985, `${step.label}: minimum coverage ${step.minCoverage}`)
}
assert.deepEqual(failures, [], 'no failed network requests')
assert.deepEqual(consoleEvents, [], 'no console errors or warnings')

const output = new URL('scene-transition-checks.json', import.meta.url)
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ steps: report.steps, shots: report.shots, failures, consoleEvents }, null, 2))
socket.close()
