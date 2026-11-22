import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'elsewhere-expansion-'))
let story
let checkpoint
try {
  const compiler = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url))
  const source = fileURLToPath(new URL('../src/story/expansion.ts', import.meta.url))
  const checkpointSource = fileURLToPath(new URL('../src/story/checkpoint.ts', import.meta.url))
  const result = spawnSync(process.execPath, [
    compiler,
    source,
    checkpointSource,
    '--ignoreConfig',
    '--outDir', temporaryDirectory,
    '--module', 'esnext',
    '--target', 'es2022',
    '--moduleResolution', 'bundler',
    '--resolveJsonModule',
    '--skipLibCheck',
  ], { encoding: 'utf8' })
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`)
  story = await import(pathToFileURL(join(temporaryDirectory, 'expansion.js')).href)
  checkpoint = await import(pathToFileURL(join(temporaryDirectory, 'checkpoint.js')).href)
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}

const {
  advanceCareer,
  advanceCareerPage,
  canOpenFinale,
  careers,
  chooseCareerFirst,
  chooseCareerSecond,
  createCareerProgress,
  createExpansionState,
  getCareerEnding,
  getCareerLetter,
  getCareerLine,
  getCareerPage,
  getFinaleLines,
  getFinaleOpening,
  getPrologueText,
  markCareerRead,
  resetExpansionState,
  validateExpansionData,
} = story

function walk(career, firstId, secondId, identity = 'steady') {
  let progress = createCareerProgress(career.id, identity)
  for (let index = 0; index < career.dialogue.length - 1; index += 1) {
    progress = advanceCareer(progress)
  }
  progress = advanceCareer(progress)
  assert.equal(progress.phase, 'identity')
  assert.equal(getCareerLine(progress).text, career.identityResponses[identity])
  progress = advanceCareer(progress)
  assert.equal(progress.phase, 'first-choice')
  progress = chooseCareerFirst(progress, firstId)
  assert.equal(progress.phase, 'first-feedback')
  while (progress.phase === 'first-feedback') progress = advanceCareer(progress)
  assert.equal(progress.phase, 'transition')
  while (progress.phase === 'transition') progress = advanceCareer(progress)
  assert.equal(progress.phase, 'second-choice')
  progress = chooseCareerSecond(progress, secondId)
  assert.equal(progress.phase, 'second-feedback')
  while (progress.phase === 'second-feedback') progress = advanceCareer(progress)
  assert.equal(progress.phase, 'ending')
  const ending = getCareerEnding(progress)
  assert.ok(ending, `${career.id}/${firstId}/${secondId} has an ending`)
  const letter = getCareerLetter(progress)
  assert.equal(letter.opening, career.letterOpenings[identity])
  assert.equal(letter.body, ending.letter)
  progress = advanceCareer(progress)
  assert.equal(progress.phase, 'letter')
  return ending
}

test('扩展剧情数据完整，四职业各有两个选择和四个结局', () => {
  assert.deepEqual(validateExpansionData(), [])
  assert.equal(careers.length, 4)
  for (const career of careers) {
    assert.equal(career.firstChoice.options.length, 2)
    assert.equal(career.secondChoice.options.length, 2)
    assert.equal(career.endings.length, 4)
    assert.ok(career.dialogue.length >= 16)
    assert.ok(career.transition.length >= 2)
    for (const identity of ['steady', 'working', 'turning']) {
      assert.ok(career.identityResponses[identity])
      assert.ok(career.letterOpenings[identity])
    }
  }
})

test('四职业的四种组合都能走到不同的结局和信件', () => {
  const seen = []
  for (const career of careers) {
    for (const first of career.firstChoice.options) {
      for (const second of career.secondChoice.options) {
        const ending = walk(career, first.id, second.id)
        assert.equal(ending.firstId, first.id)
        assert.equal(ending.secondId, second.id)
        seen.push(ending.id)
      }
    }
  }
  assert.equal(new Set(seen).size, 16)
})

test('身份只影响回应和信件开头，不改变选项和结局', () => {
  for (const career of careers) {
    for (const identity of ['steady', 'working', 'turning']) {
      let progress = createCareerProgress(career.id, identity)
      while (progress.phase === 'dialogue') progress = advanceCareer(progress)
      assert.equal(getCareerLine(progress).text, career.identityResponses[identity])
      for (const [firstId, secondId] of [['awe', 'rest']]) {
        if (!career.firstChoice.options.some((option) => option.id === firstId)) continue
        assert.ok(career.endings.some((ending) => ending.firstId === firstId && ending.secondId === secondId))
      }
    }
  }
})

test('第一通结局与状态缺失时的序幕/尾声兜底文案可用', () => {
  assert.equal(getPrologueText('regret-make-space', 'steady').laterYou, '你刚把吉他擦干净，指尖还留着琴弦的金属味。')
  assert.equal(getPrologueText(null, null).laterYou, '雨刚停，手机还放在桌角。')
  assert.equal(getFinaleOpening('regret-make-space').startsWith('你第一次接我电话时'), true)
  assert.equal(getFinaleOpening(null), '你第一次接我电话时，话没说完。我后来也练了几次。')
})

test('读完任一条信件后解锁尾声入口，重置清空记录', () => {
  let state = createExpansionState()
  assert.equal(canOpenFinale(state), false)
  state = markCareerRead(state, 'doctor')
  assert.equal(canOpenFinale(state), true)
  assert.deepEqual(state.readCareers, ['doctor'])
  assert.deepEqual(resetExpansionState(), { identity: null, firstEnding: null, readCareers: [], finaleSeen: false })
})

test('分组推进覆盖每句职业对白，第一处选择在十次以内到达', () => {
  for (const career of careers) {
    let progress = createCareerProgress(career.id, 'steady')
    const heard = []
    let clicks = 0
    while (progress.phase === 'dialogue' && clicks < 10) {
      heard.push(...getCareerPage(progress))
      progress = advanceCareerPage(progress)
      clicks++
    }
    assert.deepEqual(heard, career.dialogue)
    assert.equal(progress.phase, 'identity')
    assert.equal(advanceCareerPage(progress).phase, 'first-choice')
    assert.ok(clicks + 1 <= 10)
  }
})

function letterFor(career, ending) {
  return {
    ...createCareerProgress(career.id, 'steady'),
    firstChoiceId: ending.firstId,
    secondChoiceId: ending.secondId,
    phase: 'letter',
  }
}

test('十六封信都有不同的尾声回扣，并保留琴弦提示', () => {
  const callbacks = new Set()
  for (const career of careers) {
    for (const ending of career.endings) {
      const lines = getFinaleLines('regret-make-space', letterFor(career, ending))
      const recall = lines.find(({ id }) => id === 'career-recall')
      assert.ok(recall && !recall.text.includes('好几个世界'))
      assert.equal(lines.filter(({ id }) => id === 'guitar-cue').length, 1)
      callbacks.add(recall.text)
    }
  }
  assert.equal(callbacks.size, 16)
})

test('存档能恢复分岔位置和同职业的不同来信，并丢弃损坏记录', () => {
  const storage = new Map()
  globalThis.window = { localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  } }
  try {
    const [doctor] = careers
    const letters = doctor.endings.slice(0, 2).map((ending) => letterFor(doctor, ending))
    const save = {
      view: 'career',
      progress: { nodeId: 'regret-make-space', choiceId: 'regret', nextStepId: 'make-space' },
      identity: 'steady',
      career: { ...createCareerProgress(doctor.id, 'steady'), phase: 'first-choice' },
      letters,
      finaleStep: 0,
      finaleSeen: false,
      hubIntroSeen: true,
      dialogueLog: [{ speaker: '你', text: '你听起来像三天没睡。' }],
    }
    checkpoint.storeCheckpoint(save)
    assert.deepEqual(checkpoint.loadCheckpoint(), save)

    checkpoint.storeCheckpoint({ ...save, career: { ...save.career, phase: 'second-choice' } })
    assert.equal(checkpoint.loadCheckpoint().view, 'hub')
    assert.deepEqual(checkpoint.loadCheckpoint().letters, letters)

    checkpoint.storeCheckpoint({ ...save, progress: { nodeId: '__proto__' } })
    assert.equal(checkpoint.loadCheckpoint(), null)
    checkpoint.storeCheckpoint(null)
    assert.equal(checkpoint.loadCheckpoint(), null)
  } finally {
    delete globalThis.window
  }
})
