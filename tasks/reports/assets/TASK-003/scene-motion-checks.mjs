import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'

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
  await settle(320)
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
  await settle(360)
}

async function sceneSrc() {
  return evaluate("document.querySelector('.scene-current')?.getAttribute('src') ?? null")
}

async function screenshot(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const width = Math.ceil(metrics.cssLayoutViewport.clientWidth)
  const height = Math.ceil(metrics.cssLayoutViewport.clientHeight)
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width, height, scale: 1 } })
  const file = new URL(`galgame-scene-${name}.png`, import.meta.url)
  await writeFile(file, Buffer.from(result.data, 'base64'))
  return file.pathname
}

const report = { viewport: '1440x900 / 390x844', scenes: {}, newScenes: {}, motion: {}, failures, consoleEvents }

await send('Network.enable')
await send('Runtime.enable')
await setViewport(1440, 900)
await navigateHome()

const steps = []
async function record(label, wanted, captureViewport) {
  const src = await sceneSrc()
  steps.push({ step: label, src })
  assert.equal(src, `/backgrounds/${wanted}.svg`, `${label} uses the ${wanted} scene`)
  if (captureViewport) {
    const viewport = label.endsWith('-mobile') ? '390' : '1440'
    report.newScenes[wanted] = {
      ...(report.newScenes[wanted] ?? {}),
      [viewport]: await screenshot(`${wanted}-${viewport}`),
    }
  }
  return src
}

await clickText('开始体验')
await clickText('进入来电')
await clickText('接听')
await record('opening-01', 'connection', true)
await clickText('继续')
await record('opening-02', 'doubt', true)
await clickText('继续')
await record('opening-03', 'music', false)
await clickText('继续')
await record('opening-04', 'reality', false)
await clickText('继续')
await record('opening-05', 'rehearsal', true)
await clickText('继续')
await record('opening-06', 'desk', true)
await clickText('继续')
await record('opening-07', 'question', true)
await clickText('继续')
await record('first-response', 'first-choice', false)
await clickText('我有点遗憾，当年没有继续学音乐。')
await record('regret-feedback-01', 'regret', false)
await clickText('继续')
await record('regret-feedback-02', 'regret-quiet', true)
await clickText('继续')
await record('opening-closing', 'closing', true)
await clickText('继续')
await record('next-step', 'second-choice', false)
await clickText('给喜欢的事留一点时间。')
await record('make-space-feedback', 'make-space', false)
await clickText('继续')
await record('call-farewell', 'farewell', false)
await clickText('继续')
await waitFor("Boolean(document.querySelector('[data-ending-id]'))")
steps.push({ step: 'ending', ending: await evaluate("document.querySelector('[data-ending-id]')?.getAttribute('data-ending-id')") })
assert.equal(await evaluate("document.querySelector('[data-ending-id]')?.getAttribute('data-ending-id')"), 'regret-make-space')

await clickText('重听这通来电')
await waitFor("document.querySelector('.scene-current')?.getAttribute('src') === '/backgrounds/incoming.svg'")
await clickText('接听')
await waitFor("document.querySelector('.scene-current')?.getAttribute('src') === '/backgrounds/connection.svg'")
await setViewport(390, 844)
await settle(320)
await record('opening-01-mobile', 'connection', true)
await clickText('继续')
await record('opening-02-mobile', 'doubt', true)
for (const name of ['music', 'reality']) {
  await clickText('继续')
  await record(`${name}-mobile`, name, false)
}
await clickText('继续')
await record('opening-05-mobile', 'rehearsal', true)
await clickText('继续')
await clickText('继续')
await record('opening-07-mobile', 'question', true)
await clickText('继续')
await clickText('我很珍惜，现在拥有的生活。')
await record('cherish-feedback-01-mobile', 'cherish', false)
await clickText('继续')
await record('cherish-feedback-02-mobile', 'cherish-morning', true)
await clickText('继续')
await record('opening-closing-mobile', 'closing', true)

report.steps = steps

const files = ['home', 'incoming', 'opening', 'connection', 'doubt', 'music', 'reality', 'rehearsal', 'desk', 'doctor', 'teacher', 'designer', 'founder', 'question', 'first-choice', 'regret', 'regret-quiet', 'cherish', 'cherish-morning', 'second-choice', 'make-space', 'reach-out', 'closing', 'farewell', 'ending-regret-space', 'ending-regret-reach', 'ending-cherish-space', 'ending-cherish-reach']
const fileChecks = {}
for (const name of files) {
  const text = await readFile(new URL(`../../../../public/backgrounds/${name}.svg`, import.meta.url), 'utf8')
  const check = {
    motionGuard: text.includes('@media (prefers-reduced-motion: reduce)'),
    animatedElements: (text.match(/class="anim/g) ?? []).length,
    rain: text.includes('rain-drift'),
    motes: text.includes('class="anim mote"'),
  }
  fileChecks[name] = check
  assert.ok(check.motionGuard, `${name} disables motion for reduced-motion users`)
  assert.ok(check.animatedElements >= 5, `${name} contains animated elements`)
  assert.ok(check.rain && check.motes, `${name} contains rain drift and dust motes`)
}
report.fileChecks = fileChecks

const probe = await evaluate(`(async () => {
  const text = await (await fetch('/backgrounds/rehearsal.svg')).text()
  const svg = text.replace(/^<\\?xml[^>]*\\?>/, '')
  const frame = document.createElement('iframe')
  frame.id = 'motion-probe'
  frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:600px'
  const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }))
  frame.srcdoc = '<!doctype html><html><body style="margin:0">' + svg + '</body></html>'
  document.body.append(frame)
  await loaded
  await new Promise((resolve) => setTimeout(resolve, 120))
  const doc = frame.contentDocument
  return {
    rain: getComputedStyle(doc.querySelector('.rain-drift')).animationName,
    mote: getComputedStyle(doc.querySelector('.mote')).animationName,
    appScene: getComputedStyle(document.querySelector('.scene-current')).animationName,
    appSceneTransform: getComputedStyle(document.querySelector('.scene-current')).transform,
    rainRunning: doc.querySelector('.rain-drift').getAnimations()[0]?.playState ?? null,
    appSceneRunning: document.querySelector('.scene-current').getAnimations()[0]?.playState ?? null,
    reduce: frame.contentWindow.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
})()`)
report.motion.normal = probe
assert.notEqual(probe.rain, 'none', 'rain drift animates by default')
assert.notEqual(probe.mote, 'none', 'dust motes animate by default')
assert.equal(probe.appScene, 'none', 'scene image itself no longer scales')
assert.equal(probe.appSceneTransform, 'none', 'scene image keeps its geometry for glow alignment')
assert.equal(probe.rainRunning, 'running', 'rain drift is actually running')
assert.equal(probe.appSceneRunning, null, 'scene image has no animation to run')
assert.equal(probe.reduce, false)

await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
await settle(180)
const reduced = await evaluate(`(() => {
  const frame = document.getElementById('motion-probe')
  const doc = frame.contentDocument
  return {
    rain: getComputedStyle(doc.querySelector('.rain-drift')).animationName,
    mote: getComputedStyle(doc.querySelector('.mote')).animationName,
    appScene: getComputedStyle(document.querySelector('.scene-current')).animationName,
    rainAnimations: doc.querySelector('.rain-drift').getAnimations().length,
    appSceneAnimations: document.querySelector('.scene-current').getAnimations().length,
    reduce: frame.contentWindow.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
})()`)
report.motion.reduced = reduced
assert.equal(reduced.rain, 'none', 'rain drift stops with reduced motion')
assert.equal(reduced.mote, 'none', 'dust motes stop with reduced motion')
assert.equal(reduced.appScene, 'none', 'scene image has no drift to stop')
assert.equal(reduced.rainAnimations, 0, 'SVG animations are removed with reduced motion')
assert.equal(reduced.appSceneAnimations, 0, 'scene image keeps no animation under reduced motion')
assert.equal(reduced.reduce, true, 'reduced-motion emulation reaches SVG subframe')

await evaluate("document.getElementById('motion-probe')?.remove()")
await send('Emulation.setEmulatedMedia', { features: [] })

report.result = 'all scene and motion checks passed'
report.failures = failures
report.consoleEvents = consoleEvents
assert.deepEqual(failures, [], 'no failed requests')
assert.deepEqual(consoleEvents, [], 'no console errors')

await writeFile(new URL('scene-motion-checks.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ result: report.result, newScenes: Object.keys(report.newScenes), failures, consoleEvents }, null, 2))
socket.close()
