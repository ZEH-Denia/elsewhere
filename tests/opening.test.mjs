import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'elsewhere-opening-'))
let story
try {
  const compiler = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url))
  const source = fileURLToPath(new URL('../src/story/opening.ts', import.meta.url))
  const result = spawnSync(process.execPath, [
    compiler,
    source,
    '--ignoreConfig',
    '--outDir', temporaryDirectory,
    '--module', 'esnext',
    '--target', 'es2022',
    '--moduleResolution', 'bundler',
    '--skipLibCheck',
  ], { encoding: 'utf8' })
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`)
  story = await import(pathToFileURL(join(temporaryDirectory, 'opening.js')).href)
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}
const {
  advanceOpening,
  callFarewell,
  chooseOpening,
  createInitialOpeningProgress,
  endings,
  firstChoice,
  getEndingId,
  getOpeningNode,
  normalizeOpeningProgress,
  openingClosing,
  openingDialogue,
  openingNodes,
  secondChoice,
  validateOpeningStory,
} = story

function reachFirstChoice() {
  let progress = createInitialOpeningProgress()
  for (const node of openingDialogue) {
    assert.equal(progress.nodeId, node.id)
    progress = advanceOpening(progress)
  }
  assert.equal(progress.nodeId, 'first-response')
  return progress
}

function reachSecondChoice(choiceId) {
  const firstOption = firstChoice.options.find(({ id }) => id === choiceId)
  let progress = chooseOpening(reachFirstChoice(), choiceId)
  assert.equal(progress.nodeId, firstOption.feedback[0].id)
  progress = advanceOpening(progress)
  assert.equal(progress.nodeId, firstOption.feedback[1].id)
  progress = advanceOpening(progress)
  assert.equal(progress.nodeId, 'opening-closing')
  progress = advanceOpening(progress)
  assert.deepEqual(progress, { nodeId: 'next-step', choiceId, nextStepId: null })
  return progress
}

test('保留七条主线与首次反馈，使用指定旁白、第二次问题和共同末句', () => {
  assert.deepEqual(openingDialogue.map(({ speaker, text }) => [speaker, text]), [
    ['另一个你', '喂？先别挂。如果我说，我也是你呢？'],
    ['你', '这是什么恶作剧？'],
    ['另一个你', '那年填志愿，我把工程改成了音乐。你是不是没有改？'],
    ['你', '……没有。我留在了那条更稳妥的路上。'],
    ['另一个你', '我刚结束一次排练。能演自己写的歌很开心，可下个月的演出费还没着落。'],
    ['你', '我在准备实习。生活有了安排，但那把吉他已经很久没碰过。'],
    ['另一个你', '所以我想问，你现在最想对另一个自己说什么？'],
  ])
  assert.equal(openingDialogue.length, 7)
  assert.deepEqual(firstChoice.options.map(({ label }) => label), [
    '我有点遗憾，没继续学音乐。',
    '我也有想珍惜的，当下的生活。',
  ])
  assert.equal(openingClosing.speaker, '旁白')
  assert.equal(openingClosing.text, '电话里的杂音慢慢弱了下去。另一个你还在等你的回答。')
  assert.equal(secondChoice.id, 'next-step')
  assert.deepEqual(secondChoice.options.map(({ label }) => label), [
    '给喜欢的事留一点时间。',
    '找一个信任的人聊一聊。',
  ])
  assert.equal(callFarewell.text, '谢谢你接起这通电话。我们都继续好好生活吧。')
})

test('七条主线按序进入第一次选择，两次选择都不能被继续或跨组选项绕过', () => {
  const first = reachFirstChoice()
  assert.deepEqual(first, { nodeId: 'first-response', choiceId: null, nextStepId: null })
  assert.deepEqual(advanceOpening(first), first)
  assert.deepEqual(chooseOpening(first, 'make-space'), first)

  const second = reachSecondChoice('regret')
  assert.deepEqual(advanceOpening(second), second)
  assert.deepEqual(chooseOpening(second, 'cherish-present'), second)
  assert.deepEqual(chooseOpening(second, 'unknown-option'), second)
})

test('四个组合均实际经过第二轮反馈、共同末句并到达唯一映射结局', () => {
  const expected = {
    'regret/make-space': ['regret-make-space', '把旋律找回来', '你承认了遗憾，决定先为音乐留出一点时间。另一条路没有消失，它可以从一个小小的练习开始。'],
    'regret/reach-out': ['regret-reach-out', '让遗憾被听见', '你承认了遗憾，也愿意找信任的人聊聊。那些未说出口的愿望，终于有了被听见的机会。'],
    'cherish-present/make-space': ['cherish-make-space', '给今天留一首歌', '你珍惜已有的生活，也为喜欢的事留下位置。安稳与热爱，可以在同一天里慢慢相遇。'],
    'cherish-present/reach-out': ['cherish-reach-out', '和身边的人分享', '你珍惜当下，也愿意把自己的想法说出来。平凡的日子因为彼此理解，多了一点新的可能。'],
  }

  for (const firstOption of firstChoice.options) {
    for (const secondOption of secondChoice.options) {
      const key = `${firstOption.id}/${secondOption.id}`
      let progress = chooseOpening(reachSecondChoice(firstOption.id), secondOption.id)
      assert.equal(progress.nodeId, secondOption.feedback[0].id)
      assert.equal(progress.choiceId, firstOption.id)
      assert.equal(progress.nextStepId, secondOption.id)
      progress = advanceOpening(progress)
      assert.equal(progress.nodeId, 'call-farewell')
      progress = advanceOpening(progress)
      assert.equal(progress.nodeId, expected[key][0])
      assert.equal(progress.nodeId, getEndingId(firstOption.id, secondOption.id))

      const ending = getOpeningNode(progress.nodeId)
      assert.equal(ending.kind, 'end')
      assert.equal(ending.title, expected[key][1])
      assert.equal(ending.summary, expected[key][2])
      assert.equal(ending.choiceId, firstOption.id)
      assert.equal(ending.nextStepId, secondOption.id)
      assert.deepEqual(advanceOpening(progress), progress)
    }
  }
})

test('两条首次路径均可达两个第二次选项，两次选择分别改变结局且标题摘要互不重复', () => {
  assert.equal(endings.length, 4)
  assert.equal(new Set(endings.map(({ id }) => id)).size, 4)
  assert.equal(new Set(endings.map(({ title }) => title)).size, 4)
  assert.equal(new Set(endings.map(({ summary }) => summary)).size, 4)

  for (const choiceId of firstChoice.options.map(({ id }) => id)) {
    const second = reachSecondChoice(choiceId)
    for (const nextStepId of secondChoice.options.map(({ id }) => id)) {
      const progress = chooseOpening(second, nextStepId)
      assert.equal(getOpeningNode(progress.nodeId).kind, 'feedback')
      assert.equal(progress.nextStepId, nextStepId)
    }
  }

  assert.notEqual(getEndingId('regret', 'make-space'), getEndingId('cherish-present', 'make-space'))
  assert.notEqual(getEndingId('regret', 'make-space'), getEndingId('regret', 'reach-out'))
})

test('快速重复选择不会改选、跳过反馈或重复结算', () => {
  const first = reachFirstChoice()
  const selectedFirst = chooseOpening(first, 'regret')
  assert.deepEqual(chooseOpening(selectedFirst, 'regret'), selectedFirst)
  assert.deepEqual(chooseOpening(selectedFirst, 'cherish-present'), selectedFirst)

  const second = reachSecondChoice('regret')
  const selectedSecond = chooseOpening(second, 'make-space')
  assert.deepEqual(chooseOpening(selectedSecond, 'make-space'), selectedSecond)
  assert.deepEqual(chooseOpening(selectedSecond, 'reach-out'), selectedSecond)
  const farewell = advanceOpening(selectedSecond)
  assert.deepEqual(advanceOpening(advanceOpening(farewell)), advanceOpening(farewell))
})

test('重听重置全部进度，异常节点与不一致选择安全恢复', () => {
  const initial = createInitialOpeningProgress()
  assert.deepEqual(initial, { nodeId: 'opening-01', choiceId: null, nextStepId: null })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'missing', choiceId: 'regret', nextStepId: 'make-space' }), initial)
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'regret-feedback-01', choiceId: 'cherish-present', nextStepId: null }), {
    nodeId: 'first-response', choiceId: null, nextStepId: null,
  })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'make-space-feedback', choiceId: 'regret', nextStepId: 'reach-out' }), {
    nodeId: 'next-step', choiceId: 'regret', nextStepId: null,
  })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'next-step', choiceId: null, nextStepId: 'make-space' }), {
    nodeId: 'first-response', choiceId: null, nextStepId: null,
  })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'regret-reach-out', choiceId: 'regret', nextStepId: null }), {
    nodeId: 'next-step', choiceId: 'regret', nextStepId: null,
  })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'regret-reach-out', choiceId: 'regret', nextStepId: 'make-space' }), {
    nodeId: 'regret-make-space', choiceId: 'regret', nextStepId: 'make-space',
  })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'opening-03', choiceId: 'regret', nextStepId: 'make-space' }), {
    nodeId: 'opening-03', choiceId: null, nextStepId: null,
  })
})

test('剧情引用完整，全部二十一个节点均能到达四个结束节点之一', () => {
  assert.deepEqual(validateOpeningStory(), [])
  assert.equal(Object.keys(openingNodes).length, 21)
})

test('剧情检查发现第二轮反馈的缺失引用', () => {
  const malformed = {
    ...openingNodes,
    'make-space-feedback': { ...openingNodes['make-space-feedback'], next: 'missing-second-node' },
  }
  const errors = validateOpeningStory(malformed)
  assert.ok(errors.some((error) => error.includes('references missing node missing-second-node')))
})

test('剧情检查发现无法到达结束的循环', () => {
  const withoutEndings = Object.fromEntries(Object.entries(openingNodes).filter(([, node]) => node.kind !== 'end'))
  const cyclic = {
    ...withoutEndings,
    'call-farewell': { ...openingNodes['call-farewell'], next: 'opening-01' },
  }
  const errors = validateOpeningStory(cyclic)
  assert.ok(errors.includes('story has no ending'))
  assert.ok(errors.includes('call-farewell cannot reach an ending'))
})
