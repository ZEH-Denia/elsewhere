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

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const entry = pending.get(message.id)
    if (!entry) return
    pending.delete(message.id)
    message.error ? entry.reject(message.error) : entry.resolve(message.result)
    return
  }
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

async function settle(milliseconds = 300) {
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
  await writeFile(`${assets}/${name}.png`, Buffer.from(screenshot.data, 'base64'))
}

async function clickButton(text) {
  const point = await evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('button')).find((element) => element.innerText.trim() === ${JSON.stringify(text)})
    if (!button) return null
    button.scrollIntoView({ block: 'center', inline: 'center' })
    const rect = button.getBoundingClientRect()
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  })()`)
  assert.ok(point, `button not found: ${text}`)
  await settle(100)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
  await settle()
}

async function enlargeText() {
  await evaluate(`(() => {
    const selectors = 'h1, h2, p, button, .eyebrow, .quiet-note, .caller-name, .caller-origin, .world-labels > span, .dialogue-progress, .dialogue-speaker, .dialogue-text, .choice-option, .end-choice'
    for (const element of document.querySelectorAll(selectors)) {
      if (element.dataset.originalFontSize) continue
      const size = getComputedStyle(element).fontSize
      element.dataset.originalFontSize = size
      element.style.fontSize = (parseFloat(size) * 2) + 'px'
    }
  })()`)
  await settle()
}

async function readLayout(label) {
  const result = await evaluate(`(() => {
    const root = document.documentElement
    const active = document.activeElement
    return {
      label: ${JSON.stringify(label)},
      viewport: { width: innerWidth, height: innerHeight },
      clientWidth: root.clientWidth,
      documentWidth: root.scrollWidth,
      documentHeight: root.scrollHeight,
      horizontalOverflow: root.scrollWidth > root.clientWidth,
      bodyFontSize: getComputedStyle(document.body).fontSize,
      activeText: active.innerText,
    }
  })()`)
  assert.equal(result.horizontalOverflow, false, `${label}: horizontal overflow`)
  return result
}

async function scrollToBottom() {
  const result = await evaluate(`(() => {
    scrollTo(0, document.documentElement.scrollHeight)
    return new Promise((resolve) => setTimeout(() => {
      const footer = document.querySelector('.app-footer').getBoundingClientRect()
      resolve({
        scrollY,
        maxScroll: document.documentElement.scrollHeight - innerHeight,
        footerIntersects: footer.top < innerHeight && footer.bottom > 0,
      })
    }, 200))
  })()`)
  assert.equal(result.footerIntersects, true)
  return result
}

function channel(value) {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance(rgb) {
  const values = rgb.match(/[\d.]+/g).slice(0, 3).map(Number)
  return 0.2126 * channel(values[0]) + 0.7152 * channel(values[1]) + 0.0722 * channel(values[2])
}

function contrast(foreground, background) {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false })
await navigate()

const colors = await evaluate(`(() => ({
  base: getComputedStyle(document.body).backgroundColor,
  soft: getComputedStyle(document.querySelector('.home-intro')).color,
  dim: getComputedStyle(document.querySelector('.quiet-note')).color,
  mist: getComputedStyle(document.querySelector('#home-title')).color,
  action: getComputedStyle(document.querySelector('.primary-action')).backgroundColor,
  actionInk: getComputedStyle(document.querySelector('.primary-action')).color,
}))()`)
const contrastSamples = [
  { sample: '首页正文 soft / 深蓝底', foreground: colors.soft, background: colors.base },
  { sample: '辅助说明 dim / 深蓝底', foreground: colors.dim, background: colors.base },
  { sample: '主标题 mist / 深蓝底', foreground: colors.mist, background: colors.base },
  { sample: '主按钮文字 / 主按钮底', foreground: colors.actionInk, background: colors.action },
].map((entry) => ({ ...entry, ratio: Number(contrast(entry.foreground, entry.background).toFixed(2)) }))
for (const sample of contrastSamples) assert.ok(sample.ratio >= 4.5, `${sample.sample}: ${sample.ratio}`)

const textZoom = []
await enlargeText()
textZoom.push(await readLayout('首页 200% 文本放大'))
await capture('home-200-text-390x844')
textZoom.push({ label: '首页底部滚动', ...(await scrollToBottom()) })
await capture('home-200-text-scrolled-390x844')

await navigate()
await clickButton('开始体验')
await clickButton('进入来电')
await clickButton('接听')
for (let index = 0; index < 4; index += 1) await clickButton('继续')
assert.equal(await evaluate(`document.querySelector('.dialogue-text').innerText`), '我刚结束一次排练。能演自己写的歌很开心，可下个月的演出费还没着落。')
await enlargeText()
textZoom.push(await readLayout('第五条长对话 200% 文本放大'))
await capture('call-05-200-text-390x844')
const continueReachable = await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('button')).find((element) => element.innerText.trim() === '继续')
  button.scrollIntoView({ block: 'center' })
  const rect = button.getBoundingClientRect()
  return { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height, inViewport: rect.top >= 0 && rect.bottom <= innerHeight }
})()`)
assert.equal(continueReachable.inViewport, true)
assert.ok(continueReachable.height >= 44)
textZoom.push({ label: '长对话继续按钮', ...continueReachable })
await capture('call-05-200-text-scrolled-390x844')

await writeFile(`${assets}/accessibility-results.json`, JSON.stringify({
  method: 'Edge DevTools Protocol；仅在测试 DOM 中将指定文本计算字号放大至 200%，未修改应用源码；不是系统或原生浏览器缩放。',
  contrastSamples,
  textZoom,
}, null, 2) + '\n')
console.log(JSON.stringify({ contrastSamples, textZoom }, null, 2))
socket.close()
