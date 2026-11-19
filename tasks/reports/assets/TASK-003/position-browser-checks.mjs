import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const cdpPort = process.env.CDP_PORT || '9224'
const targetId = process.env.TARGET_ID
const desktopViewport = [Number(process.env.DESKTOP_WIDTH) || 1440, Number(process.env.DESKTOP_HEIGHT) || 900]
const pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json()
const target = pages.find((page) => targetId
  ? page.id === targetId && page.type === 'page'
  : (page.url === 'about:blank' || page.url.startsWith('http://127.0.0.1:4173/')) && page.type === 'page')
assert.ok(target, 'TASK-003 blank Edge target is available')
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 0
const pending = new Map()
const network = []
const failures = []
const consoleEvents = []
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.id) {
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(JSON.stringify(message.error)))
    else request.resolve(message.result)
    return
  }
  if (message.method === 'Network.requestWillBeSent') {
    network.push({ url: message.params.request.url, type: message.params.type })
  }
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    failures.push({ kind: 'http', status: message.params.response.status, url: message.params.response.url })
  }
  if (message.method === 'Network.loadingFailed') {
    failures.push({ kind: 'loadingFailed', error: message.params.errorText })
  }
  if (message.method === 'Runtime.exceptionThrown') {
    consoleEvents.push({ kind: 'exception', detail: message.params.exceptionDetails })
  }
  if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
    consoleEvents.push({ kind: message.params.type, args: message.params.args })
  }
  if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry.level)) {
    consoleEvents.push({ kind: 'log', entry: message.params.entry })
  }
})

function send(method, params = {}) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}

async function waitFor(expression, timeout = 5000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await new Promise((resolve) => setTimeout(resolve, 40))
  }
  throw new Error(`Timed out: ${expression}`)
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 30))
}

async function setViewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await settle()
}

async function navigateHome() {
  await send('Page.navigate', { url: 'http://127.0.0.1:4173/' })
  await waitFor("document.querySelector('h1')?.textContent.includes('未接来电')")
  await settle()
}

async function buttonCenter(label) {
  const point = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((element) => element.textContent.trim() === ${JSON.stringify(label)} && element.getBoundingClientRect().width > 0)
    if (!button) return null
    button.scrollIntoView({ block: 'center' })
    const rect = button.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })()`)
  assert.ok(point, `Button exists: ${label}`)
  return point
}

async function clickText(label) {
  const point = await buttonCenter(label)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  await settle()
}

async function journeyPosition(label) {
  const position = await evaluate(`(() => {
    const button = [...document.querySelectorAll('.journey-actions .primary-action')].find((element) => element.textContent.trim() === ${JSON.stringify(label)})
    if (!button) return null
    const rect = button.getBoundingClientRect()
    return { label: ${JSON.stringify(label)}, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height }
  })()`)
  assert.ok(position, `Journey button exists: ${label}`)
  return position
}

async function doubleClickText(label) {
  const point = await buttonCenter(label)
  for (const clickCount of [1, 2]) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount })
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount })
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  await settle()
}

async function pressKey(key, keyCode) {
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    code: key === ' ' ? 'Space' : key,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
    text: key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined,
    unmodifiedText: key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined,
  })
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code: key === ' ' ? 'Space' : key,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
  })
  await settle()
}

const enter = () => pressKey('Enter', 13)
const space = () => pressKey(' ', 32)
const escape = () => pressKey('Escape', 27)
const tab = () => pressKey('Tab', 9)

async function focusButton(label) {
  for (let index = 0; index < 20; index += 1) {
    const active = await evaluate("document.activeElement?.textContent?.trim() || ''")
    if (active === label) return
    await tab()
  }
  throw new Error(`Keyboard could not focus: ${label}`)
}

async function activateButton(label, key = 'Enter') {
  await focusButton(label)
  if (key === 'Space') await space()
  else await enter()
}

async function screenshot(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const width = Math.ceil(metrics.cssContentSize.width)
  const height = Math.ceil(metrics.cssContentSize.height)
  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  })
  await writeFile(new URL(`position-${name.replaceAll('1440', String(desktopViewport[0]))}.png`, import.meta.url), Buffer.from(result.data, 'base64'))
}

async function state() {
  await waitFor("document.querySelector('.scene-current')?.complete && document.querySelector('.scene-current')?.naturalWidth > 0")
  await waitFor("[...document.querySelectorAll('.scene-background-image')].every((image) => image.complete && image.naturalWidth > 0)")
  await waitFor("!document.querySelector('.scene-previous')")
  const snapshot = await evaluate(`(() => ({
    scene: document.querySelector('.scene-current')?.getAttribute('src') || '',
    sceneLoaded: document.querySelector('.scene-current')?.naturalWidth > 0,
    previewing: document.querySelector('.scene-background')?.classList.contains('is-previewing') || false,
    sceneTransform: getComputedStyle(document.querySelector('.scene-current')).transform,
    sceneLayerCount: document.querySelectorAll('.scene-background-image').length,
    loadedSceneCount: [...document.querySelectorAll('.scene-background-image')].filter((image) => image.complete && image.naturalWidth > 0).length,
    activeSceneCount: document.querySelectorAll('.scene-background-image.is-active').length,
    sceneAnimationName: getComputedStyle(document.querySelector('.scene-current')).animationName,
    viewport: { width: innerWidth, height: innerHeight },
    document: {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      clientWidth: document.documentElement.clientWidth
    },
    heading: document.querySelector('h1')?.textContent.trim() || '',
    secondChoice: document.querySelector('.dialogue-progress')?.textContent.trim() === '第二次选择',
    speaker: document.querySelector('.choice-stage .dialogue-speaker')?.textContent.trim() || '',
    dialogueSpeaker: document.querySelector('.dialogue-card .dialogue-speaker')?.textContent.trim() || '',
    question: document.querySelector('#choice-title')?.textContent.trim() || '',
    line: document.querySelector('.dialogue-text')?.textContent.trim() || '',
    livePoliteness: document.querySelector('[aria-live]')?.getAttribute('aria-live') || '',
    liveText: document.querySelector('[aria-live]')?.textContent.trim() || '',
    endingId: document.querySelector('[data-ending-id]')?.getAttribute('data-ending-id') || '',
    endingTitle: document.querySelector('#end-title')?.textContent.trim() || '',
    endingSummary: document.querySelector('.end-reflection > p:last-child')?.textContent.trim() || '',
    endingChoices: [...document.querySelectorAll('.end-choice')].map((element) => element.textContent.trim()),
    active: {
      tag: document.activeElement?.tagName || '',
      id: document.activeElement?.id || '',
      text: document.activeElement?.textContent?.trim() || '',
      focusVisible: document.activeElement?.matches?.(':focus-visible') || false
    },
    dialogOpen: document.querySelector('dialog')?.open || false,
    buttons: [...document.querySelectorAll('button')].filter((element) => element.getBoundingClientRect().width > 0).map((element) => {
      const rect = element.getBoundingClientRect()
      return { text: element.textContent.trim(), width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom }
    })
  }))()`)
  if (snapshot.viewport.width >= 900) {
    assert.ok(snapshot.document.height <= snapshot.viewport.height, `Desktop fits without vertical scrolling: ${snapshot.heading || snapshot.question || snapshot.line} ${snapshot.document.height}>${snapshot.viewport.height}`)
  }
  return snapshot
}

function assertLayout(snapshot) {
  assert.ok(snapshot.document.width <= snapshot.viewport.width, `No horizontal overflow at ${snapshot.viewport.width}`)
  for (const button of snapshot.buttons) {
    assert.ok(button.width >= 44 && button.height >= 44, `Touch target: ${button.text} ${button.width}x${button.height}`)
  }
}

function assertScene(snapshot, scene) {
  assert.equal(snapshot.scene, `/backgrounds/${scene}.svg`)
  assert.equal(snapshot.sceneLoaded, true)
  assert.equal(snapshot.sceneLayerCount, 16)
  assert.equal(snapshot.loadedSceneCount, 16)
  assert.equal(snapshot.activeSceneCount, 1)
  assert.equal(snapshot.sceneAnimationName, 'none')
}

const expectedOpening = [
  '喂？先别挂——如果我说，我也是你呢？',
  '这是什么恶作剧？',
  '那年填志愿，我把工程改成了音乐。你没改，对吧？',
  '……没有。我留在了原来的路上，当时觉得它更稳妥。',
  '我刚排练完。能唱自己写的歌，我很开心。可下个月的演出费，还没有着落。',
  '我在准备实习，日子有了安排。可那把吉他，已经很久没碰过了。',
  '所以我想问你：现在，你最想对另一个自己说什么？',
]
const firstOptions = {
  regret: {
    label: '我有点遗憾，当年没有继续学音乐。',
    feedback: '我有时也会想，如果当年选了工程，是不是就能少一些不安。也许我们都看到了对方那边的光。',
    innerFeedback: '……原来，你也会不安。',
  },
  cherish: {
    label: '我很珍惜，现在拥有的生活。',
    feedback: '那就不必急着否定它。我舍不得舞台，也羡慕你身边那份安稳的日常。',
    innerFeedback: '我想先认真过好今天。',
  },
}
const secondOptions = {
  space: {
    label: '给喜欢的事留一点时间。',
    feedback: '不用急着证明什么。先给自己留一小段时间，也许就够了。',
  },
  reach: {
    label: '找一个信任的人聊一聊。',
    feedback: '说出来，不一定马上有答案，但你不必一个人把所有事想完。',
  },
}
const endings = {
  'regret/space': ['regret-make-space', '把旋律找回来', '你坦然面对了那份遗憾，也决定先为音乐留出一点时间。那条没走的路并未消失，它可以从一次小小的练习重新开始。'],
  'regret/reach': ['regret-reach-out', '让遗憾被听见', '你承认了心里的遗憾，也愿意向信任的人开口。那些没说出口的心事，有了被听见的可能。'],
  'cherish/space': ['cherish-make-space', '给今天留一首歌', '你珍惜现在的生活，也为喜欢的事留出了位置。安稳与热爱，也许能在同一天里慢慢相遇。'],
  'cherish/reach': ['cherish-reach-out', '和身边的人分享', '你珍惜眼前的日子，也愿意把心里的想法说出来。被理解的日常，也许会多出一点新的可能。'],
}

async function startCall() {
  const journeyPositions = [await journeyPosition('开始体验')]
  await clickText('开始体验')
  const introCopy = await evaluate("[...document.querySelectorAll('.intro-copy p')].map((element) => element.textContent.trim())")
  assert.deepEqual(introCopy, [
    '想象一下电话另一端的声音：那么熟悉，却来自你不曾抵达的人生。',
    '这是一段虚构的平行人生，不代表对未来的预测。',
  ])
  assertScene(await state(), 'home')
  assertLayout(await state())
  journeyPositions.push(await journeyPosition('进入来电'))
  const introWidth = (await state()).viewport.width
  if (!report.regressions[`introAction${introWidth}`]) {
    await screenshot(`intro-action-${introWidth}`)
    report.regressions[`introAction${introWidth}`] = true
  }
  await clickText('进入来电')
  const incomingNote = await evaluate("document.querySelector('.incoming-copy > p:last-child')?.textContent.trim()")
  assert.equal(incomingNote, '这不是一次真实的通话。你可以随时结束，也可以听听另一条路上的自己。')
  assertScene(await state(), 'incoming')
  assertLayout(await state())
  journeyPositions.push(await journeyPosition('接听'))
  const incomingWidth = (await state()).viewport.width
  if (!report.regressions[`incomingAction${incomingWidth}`]) {
    await screenshot(`incoming-action-${incomingWidth}`)
    report.regressions[`incomingAction${incomingWidth}`] = true
  }
  const journeyViewport = (await state()).viewport
  if (journeyViewport.width >= 900) {
    for (const position of journeyPositions.slice(1)) {
      assert.equal(position.x, journeyPositions[0].x, `Primary action X stays stable at ${journeyViewport.width}`)
      assert.equal(position.y, journeyPositions[0].y, `Primary action Y stays stable at ${journeyViewport.height}`)
    }
  }
  report.regressions.journeyPositions ??= []
  report.regressions.journeyPositions.push({ viewport: journeyViewport, positions: journeyPositions })
  await clickText('接听')
  assert.equal((await state()).line, expectedOpening[0])
  assertScene(await state(), 'opening')
  return { introCopy, incomingNote }
}

async function reachFirstChoice() {
  const sceneSequence = ['opening', 'opening', 'music', 'reality', 'music', 'reality', 'opening']
  const lines = [(await state()).line]
  assertScene(await state(), sceneSequence[0])
  for (let index = 0; index < 7; index += 1) {
    await clickText('继续')
    const snapshot = await state()
    if (index < 6) {
      lines.push(snapshot.line)
      assertScene(snapshot, sceneSequence[index + 1])
    } else {
      assertScene(snapshot, 'first-choice')
    }
  }
  assert.deepEqual(lines, expectedOpening)
  assert.equal((await state()).question, '你想怎么回答？')
  return lines
}

async function reachSecondChoice(firstKey, rapid = false) {
  const first = firstOptions[firstKey]
  if (!rapid) {
    const point = await buttonCenter(first.label)
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y })
    await settle()
    const preview = await state()
    assertScene(preview, firstKey === 'regret' ? 'regret' : 'cherish')
    assert.equal(preview.previewing, true)
    assert.equal(preview.sceneTransform, 'none')
    if ((report.regressions.mousePreviews?.length ?? 0) === 0) await screenshot('01-regret-first-preview')
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
    await settle()
    const restored = await state()
    assertScene(restored, 'first-choice')
    assert.equal(restored.previewing, false)
    report.regressions.mousePreviews ??= []
    report.regressions.mousePreviews.push({ firstKey, preview: preview.scene, restored: restored.scene })
  }
  if (rapid) await doubleClickText(first.label)
  else await clickText(first.label)
  const feedback = await state()
  assert.equal(feedback.line, first.feedback)
  assert.equal(feedback.dialogueSpeaker, '另一个你')
  assertScene(feedback, firstKey === 'regret' ? 'regret' : 'cherish')
  await clickText('继续')
  const inner = await state()
  assert.equal(inner.line, first.innerFeedback)
  assert.equal(inner.dialogueSpeaker, '你（内心）')
  assert.equal(inner.liveText, `你（内心）：${first.innerFeedback}`)
  assertScene(inner, firstKey === 'regret' ? 'regret' : 'cherish')
  await clickText('继续')
  const narration = await state()
  assert.equal(narration.line, '电话里的杂音渐渐弱了下去。另一个你沉默片刻，轻轻开了口。')
  assert.equal(narration.dialogueSpeaker, '旁白')
  assert.equal(narration.livePoliteness, 'polite')
  assert.equal(narration.liveText, '旁白：电话里的杂音渐渐弱了下去。另一个你沉默片刻，轻轻开了口。')
  assertScene(narration, 'opening')
  await clickText('继续')
  const snapshot = await state()
  assert.equal(snapshot.secondChoice, true)
  assert.equal(snapshot.speaker, '另一个你')
  assert.equal(snapshot.question, '如果明天就能为自己做一件小事，你想从哪里开始？')
  assertScene(snapshot, 'second-choice')
  assertLayout(snapshot)
  return snapshot
}

async function chooseSecond(secondKey, rapid = false) {
  const second = secondOptions[secondKey]
  if (!rapid) {
    const point = await buttonCenter(second.label)
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y })
    await settle()
    const preview = await state()
    assertScene(preview, secondKey === 'space' ? 'make-space' : 'reach-out')
    assert.equal(preview.previewing, true)
    if ((report.regressions.mouseSecondPreviews?.length ?? 0) === 0) await screenshot('01-make-space-preview')
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
    await settle()
    const restored = await state()
    assertScene(restored, 'second-choice')
    assert.equal(restored.previewing, false)
    report.regressions.mouseSecondPreviews ??= []
    report.regressions.mouseSecondPreviews.push({ secondKey, preview: preview.scene, restored: restored.scene })
  }
  if (rapid) await doubleClickText(second.label)
  else await clickText(second.label)
  const snapshot = await state()
  assert.equal(snapshot.line, second.feedback)
  assert.equal(snapshot.livePoliteness, 'polite')
  assert.equal(snapshot.liveText, `另一个你：${second.feedback}`)
  assertScene(snapshot, secondKey === 'space' ? 'make-space' : 'reach-out')
}

async function finishEnding(firstKey, secondKey) {
  await clickText('继续')
  const farewell = await state()
  assert.equal(farewell.line, '谢谢你接起这通电话。愿我们，都能好好生活。')
  assertScene(farewell, 'farewell')
  await clickText('继续')
  const snapshot = await state()
  const expected = endings[`${firstKey}/${secondKey}`]
  assert.equal(snapshot.endingId, expected[0])
  assert.equal(snapshot.endingTitle, expected[1])
  assert.equal(snapshot.endingSummary, expected[2])
  assert.equal(snapshot.endingChoices.length, 2)
  assert.ok(snapshot.endingChoices[0].includes(firstOptions[firstKey].label))
  assert.ok(snapshot.endingChoices[1].includes(secondOptions[secondKey].label))
  assert.equal(snapshot.active.id, 'end-title')
  assertScene(snapshot, `${firstKey === 'regret' ? 'ending-regret' : 'ending-cherish'}-${secondKey}`)
  assertLayout(snapshot)
  return snapshot
}

async function playCombination(firstKey, secondKey, viewport, name, rapid = false) {
  await setViewport(...viewport)
  await navigateHome()
  assertLayout(await state())
  if (name.startsWith('01-') || name.startsWith('04-')) await screenshot(`${name}-home`)
  const copyChecks = await startCall()
  if (name.startsWith('01-') || name.startsWith('03-')) await screenshot(`${name}-dialogue`)
  const openingLines = await reachFirstChoice()
  const secondChoice = await reachSecondChoice(firstKey, rapid)
  await screenshot(`${name}-second-choice`)
  await chooseSecond(secondKey, rapid)
  const feedback = (await state()).line
  const ending = await finishEnding(firstKey, secondKey)
  await screenshot(`${name}-ending`)
  return { firstKey, secondKey, viewport, copyChecks, openingLines, secondChoice, feedback, ending }
}

async function cancelAndEscape(stage) {
  await clickText('结束通话')
  assert.equal((await state()).dialogOpen, true)
  await clickText('取消')
  let snapshot = await state()
  assert.equal(snapshot.dialogOpen, false)
  assert.equal(snapshot.active.text, '结束通话')
  await clickText('结束通话')
  await escape()
  snapshot = await state()
  assert.equal(snapshot.dialogOpen, false)
  assert.equal(snapshot.active.text, '结束通话')
  return { stage, afterCancelAndEscape: snapshot }
}

async function confirmExit() {
  await clickText('结束通话')
  await clickText('确认结束')
  const snapshot = await state()
  assert.equal(snapshot.dialogOpen, false)
  assert.equal(snapshot.heading.includes('未接来电'), true)
  assert.equal(snapshot.active.text, '开始体验')
  await enter()
  assert.equal((await state()).heading.includes('如果当年选择了音乐'), true)
  return snapshot
}

const report = {
  task: 'TASK-003',
  date: '2026-11-18',
  browser: 'Microsoft Edge 157.0.4341.60 / HeadlessChrome 157 via CDP, isolated temporary profile with --disable-extensions',
  preview: 'http://127.0.0.1:4173/',
  desktopViewport,
  combinations: [],
  regressions: {},
  keyboard: {},
  responsive: [],
  reducedMotion: {},
  network,
  failures,
  consoleEvents,
}

try {
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Log.enable')

  await setViewport(...desktopViewport)
  await navigateHome()
  assertScene(await state(), 'home')
  await screenshot('00-home-1440')

  const regretSpace = await playCombination('regret', 'space', [390, 844], '01-regret-make-space-390')
  report.combinations.push(regretSpace)
  report.responsive.push({ viewport: [390, 844], secondChoice: regretSpace.secondChoice, ending: regretSpace.ending })

  await clickText('重听这通来电')
  assert.equal((await state()).heading.includes('正在来电'), true)
  await clickText('接听')
  assert.equal((await state()).line, expectedOpening[0])
  await reachFirstChoice()
  await reachSecondChoice('regret')
  await chooseSecond('reach')
  const replayEnding = await finishEnding('regret', 'reach')
  await screenshot('02-regret-reach-out-390-ending')
  report.combinations.push({ firstKey: 'regret', secondKey: 'reach', viewport: [390, 844], replay: true, ending: replayEnding })
  report.regressions.replayReset = { returnedToIncoming: true, answeredAgain: true, differentEnding: replayEnding.endingId }
  await clickText('返回首页')
  assert.equal((await state()).active.text, '开始体验')
  report.regressions.returnHomeReset = await state()

  const cherishSpace = await playCombination('cherish', 'space', desktopViewport, '03-cherish-make-space-1440')
  report.combinations.push(cherishSpace)
  const cherishReach = await playCombination('cherish', 'reach', [320, 568], '04-cherish-reach-out-320')
  report.combinations.push(cherishReach)
  report.responsive.push({ viewport: [320, 568], secondChoice: cherishReach.secondChoice, ending: cherishReach.ending })

  await setViewport(390, 844)
  await navigateHome()
  await startCall()
  await reachFirstChoice()
  const beforeSecond = await reachSecondChoice('regret', true)
  report.regressions.beforeSecondChoice = await cancelAndEscape('next-step')
  assert.equal((await state()).question, beforeSecond.question)
  report.regressions.beforeSecondChoice.confirmedExit = await confirmExit()

  await navigateHome()
  await startCall()
  await reachFirstChoice()
  await reachSecondChoice('regret', true)
  await chooseSecond('space', true)
  report.regressions.afterSecondChoice = await cancelAndEscape('make-space-feedback')
  const afterEnding = await finishEnding('regret', 'space')
  report.regressions.afterSecondChoice.endingAfterCancellation = afterEnding
  report.regressions.rapidChoices = {
    firstFeedback: firstOptions.regret.feedback,
    secondFeedback: secondOptions.space.feedback,
    endingId: afterEnding.endingId,
    settledOnce: true,
  }

  await navigateHome()
  await startCall()
  await reachFirstChoice()
  await reachSecondChoice('regret')
  await chooseSecond('reach')
  report.regressions.afterSecondChoice.confirmedExit = await confirmExit()

  await navigateHome()
  await startCall()
  await reachFirstChoice()
  await reachSecondChoice('cherish')
  await chooseSecond('space')
  await send('Page.reload', { ignoreCache: true })
  await waitFor("document.querySelector('h1')?.textContent.includes('未接来电')")
  report.regressions.refreshReset = await state()
  assert.equal(report.regressions.refreshReset.endingId, '')
  assert.equal(report.regressions.refreshReset.heading.includes('未接来电'), true)

  await setViewport(...desktopViewport)
  await navigateHome()
  await tab()
  assert.equal((await state()).active.text, '开始体验')
  await enter()
  await activateButton('进入来电')
  await activateButton('接听', 'Space')
  for (let index = 0; index < 7; index += 1) {
    await activateButton('继续', index % 2 ? 'Space' : 'Enter')
  }
  assert.equal((await state()).active.id, 'choice-title')
  await focusButton(firstOptions.regret.label)
  const firstKeyboardPreview = await state()
  assertScene(firstKeyboardPreview, 'regret')
  assert.equal(firstKeyboardPreview.previewing, true)
  report.keyboard.firstChoicePreview = firstKeyboardPreview
  await enter()
  await activateButton('继续', 'Space')
  await activateButton('继续')
  await activateButton('继续', 'Space')
  assert.equal((await state()).active.id, 'choice-title')
  await focusButton(secondOptions.space.label)
  const secondKeyboardPreview = await state()
  assertScene(secondKeyboardPreview, 'make-space')
  assert.equal(secondKeyboardPreview.previewing, true)
  report.keyboard.secondChoicePreview = secondKeyboardPreview
  await space()
  await activateButton('继续')
  await activateButton('继续', 'Space')
  const keyboardEnding = await state()
  assert.equal(keyboardEnding.endingId, 'regret-make-space')
  assert.equal(keyboardEnding.active.id, 'end-title')
  assertLayout(keyboardEnding)
  await screenshot('05-keyboard-regret-make-space-1440-ending')
  report.keyboard.fullPath = keyboardEnding
  report.responsive.push({ viewport: desktopViewport, ending: keyboardEnding })

  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  report.reducedMotion = await evaluate(`(() => {
    const animated = document.querySelector('.screen-enter')
    const button = document.querySelector('button')
    const scene = document.querySelector('.scene-current')
    const animatedStyle = getComputedStyle(animated)
    const buttonStyle = getComputedStyle(button)
    return {
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationName: animatedStyle.animationName,
      animationDuration: animatedStyle.animationDuration,
      transitionDuration: buttonStyle.transitionDuration,
      sceneAnimationName: getComputedStyle(scene).animationName
    }
  })()`)
  assert.equal(report.reducedMotion.mediaMatches, true)
  assert.equal(report.reducedMotion.animationName, 'none')
  assert.equal(report.reducedMotion.sceneAnimationName, 'none')
  await send('Emulation.setEmulatedMedia', { features: [] })

  await navigateHome()
  await tab()
  await enter()
  await activateButton('进入来电')
  await activateButton('接听')
  for (let index = 0; index < 7; index += 1) await activateButton('继续')
  await activateButton(firstOptions.regret.label)
  await activateButton('继续')
  await activateButton('继续')
  await activateButton('继续')
  await activateButton('结束通话')
  await escape()
  assert.equal((await state()).active.text, '结束通话')
  await activateButton('结束通话')
  await tab()
  assert.equal((await state()).active.text, '确认结束')
  await enter()
  const keyboardExit = await state()
  assert.equal(keyboardExit.active.text, '开始体验')
  assert.equal(keyboardExit.active.focusVisible, true)
  await enter()
  assert.equal((await state()).heading.includes('如果当年选择了音乐'), true)
  report.keyboard.confirmedExit = keyboardExit

  const longestShort = await playCombination('regret', 'space', [320, 568], '06-longest-320')
  report.responsive.push({ viewport: [320, 568], longestEnding: longestShort.ending, secondChoice: longestShort.secondChoice })
  assert.ok(longestShort.ending.document.height > longestShort.ending.viewport.height, 'Short viewport scrolls naturally')

  assert.deepEqual(failures, [])
  assert.deepEqual(consoleEvents, [])
  const extensionRequests = network.filter(({ url }) => url.startsWith('chrome-extension://'))
  const applicationRequests = network.filter(({ url }) => !url.startsWith('data:') && !url.startsWith('chrome-extension://'))
  assert.ok(applicationRequests.every(({ url }) => url.startsWith('http://127.0.0.1:4173/')), 'Only local application requests')
  report.requestSummary = {
    count: network.length,
    urls: [...new Set(network.map(({ url }) => url))],
    externalApplicationRequests: applicationRequests.filter(({ url }) => !url.startsWith('http://127.0.0.1:4173/')),
    browserExtensionRequests: [...new Set(extensionRequests.map(({ url }) => url))],
    note: 'Application and browser-extension requests are classified separately; no external HTTP interface, font, or asset request was observed.',
  }
  report.result = 'all scripted assertions passed'
} catch (error) {
  report.result = 'failed'
  report.error = error.stack
  process.exitCode = 1
} finally {
  await writeFile(new URL(`position-browser-checks-${desktopViewport[0]}.json`, import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
  socket.close()
}

console.log(JSON.stringify({ result: report.result, combinations: report.combinations.length, requests: network.length, failures, consoleEvents, error: report.error }, null, 2))
