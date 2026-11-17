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
  chooseOpening,
  createInitialOpeningProgress,
  firstChoice,
  getOpeningNode,
  normalizeOpeningProgress,
  openingDialogue,
  openingEnd,
  openingNodes,
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

test('首通稿严格保留七条主线、两个选项与共同收束', () => {
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
  assert.equal(firstChoice.options.length, 2)
  assert.deepEqual(firstChoice.options.map(({ label }) => label), [
    '我有点遗憾，没继续学音乐。',
    '我也有想珍惜的，当下的生活。',
  ])
  assert.equal(getOpeningNode('opening-closing').text, '电话快断了。至少这一次，我们听见了彼此。')
  assert.equal(openingEnd.title, '第一通来电，暂时结束。')
})

test('七条主线按序进入第一次选择，继续操作不能跳过选择', () => {
  const choice = reachFirstChoice()
  assert.deepEqual(choice, { nodeId: 'first-response', choiceId: null })
  assert.deepEqual(advanceOpening(choice), choice)
})

test('两个选项分别经过两条反馈并到达不同总结', () => {
  const choice = reachFirstChoice()
  const summaries = []

  for (const option of firstChoice.options) {
    let progress = chooseOpening(choice, option.id)
    assert.equal(progress.nodeId, option.feedback[0].id)
    assert.equal(progress.choiceId, option.id)

    const otherOption = firstChoice.options.find(({ id }) => id !== option.id)
    assert.deepEqual(chooseOpening(progress, otherOption.id), progress)

    progress = advanceOpening(progress)
    assert.equal(progress.nodeId, option.feedback[1].id)
    progress = advanceOpening(progress)
    assert.equal(progress.nodeId, 'opening-closing')
    progress = advanceOpening(progress)
    assert.equal(progress.nodeId, 'opening-end')
    assert.equal(progress.choiceId, option.id)
    assert.deepEqual(advanceOpening(progress), progress)
    summaries.push(openingEnd.summaries[option.id])
  }

  assert.notEqual(summaries[0], summaries[1])
})

test('重听重置节点与选择，异常进度回到可继续状态', () => {
  assert.deepEqual(createInitialOpeningProgress(), { nodeId: 'opening-01', choiceId: null })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'missing', choiceId: 'regret' }), createInitialOpeningProgress())
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'regret-feedback-01', choiceId: 'cherish-present' }), {
    nodeId: 'first-response',
    choiceId: null,
  })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'opening-end', choiceId: null }), {
    nodeId: 'first-response',
    choiceId: null,
  })
  assert.deepEqual(normalizeOpeningProgress({ nodeId: 'opening-03', choiceId: 'regret' }), {
    nodeId: 'opening-03',
    choiceId: null,
  })
})

test('剧情引用完整，所有节点均能到达结束', () => {
  assert.deepEqual(validateOpeningStory(), [])
  assert.equal(Object.keys(openingNodes).length, 14)
})

test('剧情检查发现缺失引用', () => {
  const malformed = {
    ...openingNodes,
    'opening-03': { ...openingNodes['opening-03'], next: 'missing-node' },
  }
  const errors = validateOpeningStory(malformed)
  assert.ok(errors.some((error) => error.includes('references missing node missing-node')))
})

test('剧情检查发现无法到达结束的循环', () => {
  const { 'opening-end': removedEnd, ...withoutEnd } = openingNodes
  assert.equal(removedEnd.kind, 'end')
  const cyclic = {
    ...withoutEnd,
    'opening-closing': { ...openingNodes['opening-closing'], next: 'opening-01' },
  }
  const errors = validateOpeningStory(cyclic)
  assert.ok(errors.includes('story has no ending'))
  assert.ok(errors.includes('opening-closing cannot reach an ending'))
})
