import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'elsewhere-expansion-'))
let story
try {
  const compiler = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url))
  const source = fileURLToPath(new URL('../src/story/expansion.ts', import.meta.url))
  const result = spawnSync(process.execPath, [
    compiler,
    source,
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
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}

const {
  advanceCareer,
  canOpenFinale,
  careers,
  chooseCareerFirst,
  chooseCareerSecond,
  createCareerProgress,
  createExpansionState,
  getCareerEnding,
  getCareerLetter,
  getCareerLine,
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