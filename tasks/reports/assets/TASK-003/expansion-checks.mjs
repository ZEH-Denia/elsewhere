import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const pages = await (await fetch('http://127.0.0.1:9224/json/list')).json()
const target = pages.find((page) => page.type === 'page' && page.url.startsWith('http://127.0.0.1:4173')) ?? pages.find((page) => page.type === 'page')
assert.ok(target, 'browser target')
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
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) request.reject(new Error(JSON.stringify(message.error)))
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

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId
  pending.set(id, { resolve, reject })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const settle = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))
const waitFor = async (expression, timeout = 8000) => {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await settle(50)
  }
  throw new Error(`Timed out: ${expression}`)
}
const viewIs = (name) => `document.querySelector('.app-background')?.dataset.view === '${name}'`
const setViewport = async (width, height) => {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 })
  await settle(250)
}
const pointOf = async (selector, text = '') => {
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
const click = async (selector, text = '') => {
  const point = await pointOf(selector, text)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
  await settle(150)
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
  letter: document.querySelector('.letter-body')?.textContent?.trim() ?? null,
  hubCards: [...document.querySelectorAll('.hub-card')].map((element) => ({ text: element.textContent.replace(/\\s+/g, ' ').trim(), read: element.classList.contains('is-read') })),
  finaleLine: Boolean(document.querySelector('.hub-finale')),
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  finalTitle: document.querySelector('#finale-title')?.textContent?.trim() ?? null,
}))()`)

async function advanceUntil(predicate, selector = '.dialogue-continue', max = 40) {
  for (let index = 0; index < max; index += 1) {
    if (await evaluate(predicate)) return
    await click(selector)
    await settle(260)
  }
  throw new Error(`Did not reach condition: ${predicate}`)
}

async function reachFirstEnding() {
  await click('button', '开始体验')
  await waitFor(viewIs('intro'))
  await settle(450)
  await click('button', '进入来电')
  await waitFor(viewIs('incoming'))
  await settle(450)
  await click('button', '接听')
  await waitFor(viewIs('call'))
  await settle(450)
  await advanceUntil("Boolean(document.querySelector('.choice-option'))")
  await click('.choice-option', '我有点遗憾')
  await advanceUntil("document.querySelectorAll('.choice-option').length === 2")
  await click('.choice-option', '给喜欢的事留一点时间')
  await advanceUntil("Boolean(document.querySelector('.end-layout'))")
  await settle(450)
}

const report = { viewport: '1440x900 / 390x844', checks: [], shots: [], failures, consoleEvents }
await send('Network.enable')
await send('Runtime.enable')
await setViewport(1440, 900)
await send('Page.navigate', { url: `http://127.0.0.1:4173/?t=${Date.now()}` })
await waitFor(viewIs('home'))
await settle(500)

await reachFirstEnding()
const firstEnd = await state()
assert.ok(firstEnd.heading, 'first chapter ending is visible')
await click('button.primary-action', '继续')
await waitFor(viewIs('identity'))
await settle(450)
const identity = await state()
assert.equal(identity.heading.includes('现在的你'), true)
assert.equal((await evaluate("document.querySelectorAll('.identity-option').length")), 3)
report.checks.push({ name: 'first-ending-continue', ...firstEnd })
report.shots.push(await screenshot('expansion-identity-1440'))

await click('.identity-option', '已经开始工作')
await waitFor(viewIs('hub'))
await settle(500)
const hub = await state()
assert.equal(hub.hubCards.length, 4)
assert.ok(hub.hubCards.some((card) => card.text.includes('医生')))
assert.equal(hub.finaleLine, false)
const hubText = await evaluate("document.querySelector('.hub-script')?.textContent")
assert.ok(hubText.includes('线路没有完全断'))
assert.ok(hubText.includes('上次你说，想把旋律找回来'))
report.checks.push({ name: 'identity-and-hub', ...hub })
report.shots.push(await screenshot('expansion-hub-1440'))

await click('.hub-card', '医生')
await waitFor(viewIs('career'))
await settle(500)
const doctorStart = await state()
assert.ok(doctorStart.line.includes('凌晨两点十七分'))
const doctorScenes = new Set([await evaluate("document.querySelector('.scene-current')?.getAttribute('src')")])
assert.ok([...doctorScenes][0].endsWith('/doctor.svg'), 'doctor uses the doctor scene')
let identityResponseSeen = false
for (let index = 0; index < 35; index += 1) {
  const current = await state()
  if (current.progress?.includes('身份回应')) {
    identityResponseSeen = true
    assert.ok(current.line.includes('你想起明天早上的周报'))
  }
  if (current.choices.length) break
  doctorScenes.add(await evaluate("document.querySelector('.scene-current')?.getAttribute('src')"))
  await click('.dialogue-continue')
  await settle(280)
}
assert.equal(identityResponseSeen, true, 'working identity line appears before the first choice')
assert.equal(doctorScenes.size, 4, 'doctor dialogue rotates through four career scenes')
report.checks.push({ name: 'doctor-scene-rotation', scenes: [...doctorScenes] })
const doctorChoice = await state()
assert.deepEqual(doctorChoice.choices.map((text) => text.includes('我羡慕你') || text.includes('听起来很累')), [true, true])
report.checks.push({ name: 'doctor-identity-and-first-choice', ...doctorChoice })
report.shots.push(await screenshot('expansion-career-choice-1440'))

await click('.choice-option', '听起来很累')
await advanceUntil("document.querySelectorAll('.choice-option').length === 2")
await click('.choice-option', '给一个很久没联系的人')
await advanceUntil("Boolean(document.querySelector('.career-ending'))")
await settle(450)
const doctorEnding = await state()
assert.equal(doctorEnding.end, '凌晨的回拨')
report.checks.push({ name: 'doctor-ending', ...doctorEnding })
report.shots.push(await screenshot('expansion-career-ending-1440'))

await click('.career-ending .dialogue-continue')
await waitFor("Boolean(document.querySelector('#letter-title'))")
await settle(450)
const doctorLetter = await state()
assert.ok(doctorLetter.letter.includes('那天你让我去睡'))
const letterText = await evaluate("document.querySelector('.prelude-panel')?.textContent")
assert.ok(letterText.includes('你说你已经开始工作了'), 'working identity letter opening is used')
report.checks.push({ name: 'doctor-letter', ...doctorLetter })
report.shots.push(await screenshot('expansion-letter-1440'))

await click('button.primary-action', '读完，回总机')
await waitFor(viewIs('hub'))
await settle(450)
const readHub = await state()
assert.ok(readHub.hubCards.find((card) => card.text.includes('医生'))?.read)
assert.equal(readHub.finaleLine, true)
report.checks.push({ name: 'read-mark-and-unlock', ...readHub })
report.shots.push(await screenshot('expansion-hub-read-1440'))

await click('.hub-finale .primary-action')
await waitFor(viewIs('finale'))
await settle(500)
const finaleStart = await state()
assert.ok(finaleStart.line.includes('你第一次接我电话时'))
report.checks.push({ name: 'finale-opening', ...finaleStart })
report.shots.push(await screenshot('expansion-finale-1440'))

await advanceUntil("Boolean(document.querySelector('#finale-title'))")
await settle(450)
const finaleLetter = await state()
assert.equal(finaleLetter.finalTitle, '下次换你打给我')
assert.ok(finaleLetter.letter.includes('琴我没收起来'))
report.checks.push({ name: 'finale-letter', ...finaleLetter })
report.shots.push(await screenshot('expansion-finale-letter-1440'))

await click('button.primary-action', '返回总机')
await waitFor(viewIs('hub'))
await settle(450)
const afterFinale = await state()
assert.ok(afterFinale.hubCards.find((card) => card.text.includes('医生'))?.read)
assert.equal(afterFinale.finaleLine, true)
report.checks.push({ name: 'return-to-hub', ...afterFinale })

await click('.hub-card', '教师')
await waitFor(viewIs('career'))
await settle(450)
await click('.header-end-call')
await waitFor("document.querySelector('.confirm-dialog')?.open === true")
const endDialog = await evaluate("document.querySelector('#confirm-title')?.textContent")
assert.ok(endDialog.includes('返回总机'), 'career end-call offers return to hub')
await click('.confirm-dialog button', '取消')
await waitFor("document.querySelector('.confirm-dialog')?.open === false")
assert.equal((await state()).view, 'career')
await click('.header-end-call')
await waitFor("document.querySelector('.confirm-dialog')?.open === true")
await click('.confirm-dialog button', '确认返回总机')
await waitFor(viewIs('hub'))
await settle(450)
const afterExit = await state()
assert.ok(afterExit.hubCards.find((card) => card.text.includes('医生'))?.read)
assert.equal(afterExit.hubCards.find((card) => card.text.includes('教师'))?.read, false)
assert.equal(afterExit.finaleLine, true)
report.checks.push({ name: 'career-exit-preserves-read', ...afterExit })

for (const [label, id] of [['设计师', 'designer'], ['创业者', 'founder']]) {
  await click('.hub-card', label)
  await waitFor(viewIs('career'))
  await settle(450)
  assert.ok((await evaluate("document.querySelector('.scene-current')?.getAttribute('src')")).endsWith(`/${id}.svg`), `${label} uses its own scene`)
  report.shots.push(await screenshot(`expansion-career-${id}-1440`))
  await click('.header-end-call')
  await waitFor("document.querySelector('.confirm-dialog')?.open === true")
  await click('.confirm-dialog button', '确认返回总机')
  await waitFor(viewIs('hub'))
  await settle(300)
}

await setViewport(390, 844)
await settle(500)
const mobileHub = await state()
assert.equal(mobileHub.overflow, false)
assert.equal(mobileHub.hubCards.length, 4)
report.checks.push({ name: 'mobile-hub-390', ...mobileHub })
report.shots.push(await screenshot('expansion-hub-390'))

await click('.hub-card', '教师')
await waitFor(viewIs('career'))
await settle(450)
const mobileCareer = await state()
assert.equal(mobileCareer.overflow, false)
assert.ok((await evaluate("document.querySelector('.scene-current')?.getAttribute('src')")).endsWith('/teacher.svg'), 'teacher uses the teacher scene on mobile')
report.checks.push({ name: 'mobile-career-390', ...mobileCareer })
report.shots.push(await screenshot('expansion-career-390'))

await setViewport(1024, 768)
await settle(400)
const compactCareer = await state()
assert.equal(compactCareer.overflow, false, '1024 career page has no horizontal overflow')
report.checks.push({ name: 'compact-career-1024', ...compactCareer })
report.shots.push(await screenshot('expansion-career-1024'))

await click('.header-end-call')
await waitFor("document.querySelector('.confirm-dialog')?.open === true")
await click('.confirm-dialog button', '确认返回总机')
await waitFor(viewIs('hub'))
await settle(450)
const compactHub = await state()
assert.equal(compactHub.overflow, false, '1024 hub has no horizontal overflow')
report.checks.push({ name: 'compact-hub-1024', ...compactHub })
report.shots.push(await screenshot('expansion-hub-1024'))

await setViewport(320, 568)
await settle(450)
const narrowHub = await state()
assert.equal(narrowHub.overflow, false, '320 hub has no horizontal overflow')
report.checks.push({ name: 'narrow-hub-320', ...narrowHub })
report.shots.push(await screenshot('expansion-hub-320'))

await click('.hub-card', '设计师')
await waitFor(viewIs('career'))
await settle(450)
const narrowCareer = await state()
assert.equal(narrowCareer.overflow, false, '320 career page has no horizontal overflow')
report.checks.push({ name: 'narrow-career-320', ...narrowCareer })
report.shots.push(await screenshot('expansion-career-320'))

assert.deepEqual(failures, [], 'no failed requests')
assert.deepEqual(consoleEvents, [], 'no console errors')
report.result = 'all expansion UI checks passed'
await writeFile(new URL('expansion-checks.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ result: report.result, checks: report.checks.length, failures, consoleEvents }, null, 2))
socket.close()