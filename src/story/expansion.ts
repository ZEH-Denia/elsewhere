import { expansionData } from './expansionData.js'
import type {
  CareerEnding,
  CareerId,
  CareerStory,
  PlayerIdentity,
  StoryChoice,
  StoryLine,
} from './expansionTypes'

export type CareerPhase =
  | 'dialogue'
  | 'identity'
  | 'first-choice'
  | 'first-feedback'
  | 'transition'
  | 'second-choice'
  | 'second-feedback'
  | 'ending'
  | 'letter'

export interface CareerProgress {
  careerId: CareerId
  identity: PlayerIdentity
  phase: CareerPhase
  lineIndex: number
  feedbackIndex: number
  firstChoiceId: string | null
  secondChoiceId: string | null
}

export interface ExpansionState {
  identity: PlayerIdentity | null
  firstEnding: string | null
  readCareers: CareerId[]
  finaleSeen: boolean
}

export const identities = expansionData.identities
export const careers = expansionData.careers
export const prologue = expansionData.prologue
export const finale = expansionData.finale

export function getCareer(id: CareerId): CareerStory {
  const career = careers.find((entry) => entry.id === id)
  if (!career) throw new Error(`unknown career ${id}`)
  return career
}

export function getCareerEntry(id: string): CareerStory | undefined {
  return careers.find((entry) => entry.id === id)
}

export function createCareerProgress(careerId: CareerId, identity: PlayerIdentity): CareerProgress {
  return {
    careerId,
    identity,
    phase: 'dialogue',
    lineIndex: 0,
    feedbackIndex: 0,
    firstChoiceId: null,
    secondChoiceId: null,
  }
}

export function getCareerLine(progress: CareerProgress): StoryLine | null {
  const career = getCareer(progress.careerId)
  if (progress.phase === 'dialogue') return career.dialogue[progress.lineIndex] ?? null
  if (progress.phase === 'identity') {
    return {
      speaker: '你（内心）',
      text: career.identityResponses[progress.identity],
    }
  }
  if (progress.phase === 'transition') return career.transition[progress.lineIndex] ?? null
  const current = currentChoice(progress)
  return current?.options.find((option) => option.id === activeChoiceId(progress))?.feedback[progress.feedbackIndex] ?? null
}

const dialoguePageStarts: Record<CareerId, number[]> = {
  doctor: [0, 1, 4, 8, 12, 14, 16],
  teacher: [0, 1, 4, 6, 9, 12, 14],
  designer: [0, 1, 3, 6, 8, 12, 14, 16],
  founder: [0, 1, 4, 8, 10, 12, 14, 16],
}

export function getCareerPage(progress: CareerProgress): StoryLine[] {
  if (progress.phase !== 'dialogue') {
    const line = getCareerLine(progress)
    return line ? [line] : []
  }
  const dialogue = getCareer(progress.careerId).dialogue
  const nextStart = dialoguePageStarts[progress.careerId].find((index) => index > progress.lineIndex)
  return dialogue.slice(progress.lineIndex, nextStart)
}

export function advanceCareerPage(progress: CareerProgress): CareerProgress {
  const count = Math.max(1, getCareerPage(progress).length)
  let next = progress
  for (let i = 0; i < count; i++) next = advanceCareer(next)
  return next
}

export function getCareerChoice(progress: CareerProgress): StoryChoice | null {
  if (progress.phase === 'first-choice') return getCareer(progress.careerId).firstChoice
  if (progress.phase === 'second-choice') return getCareer(progress.careerId).secondChoice
  return null
}

export function getCareerEnding(progress: CareerProgress): CareerEnding | null {
  if (progress.phase !== 'ending' && progress.phase !== 'letter') return null
  if (!progress.firstChoiceId || !progress.secondChoiceId) return null
  return getCareer(progress.careerId).endings.find(
    (ending) => ending.firstId === progress.firstChoiceId && ending.secondId === progress.secondChoiceId,
  ) ?? null
}

export function getCareerLetter(progress: CareerProgress): { opening: string; body: string } | null {
  const ending = getCareerEnding(progress)
  if (!ending) return null
  return {
    opening: getCareer(progress.careerId).letterOpenings[progress.identity],
    body: ending.letter,
  }
}

export function advanceCareer(progress: CareerProgress): CareerProgress {
  const career = getCareer(progress.careerId)

  if (progress.phase === 'dialogue') {
    if (progress.lineIndex + 1 < career.dialogue.length) {
      return { ...progress, lineIndex: progress.lineIndex + 1 }
    }
    return { ...progress, phase: 'identity', lineIndex: 0 }
  }

  if (progress.phase === 'identity') {
    return { ...progress, phase: 'first-choice', lineIndex: 0 }
  }

  if (progress.phase === 'first-feedback') {
    const option = career.firstChoice.options.find((entry) => entry.id === progress.firstChoiceId)
    if (option && progress.feedbackIndex + 1 < option.feedback.length) {
      return { ...progress, feedbackIndex: progress.feedbackIndex + 1 }
    }
    return { ...progress, phase: 'transition', lineIndex: 0, feedbackIndex: 0 }
  }

  if (progress.phase === 'transition') {
    if (progress.lineIndex + 1 < career.transition.length) {
      return { ...progress, lineIndex: progress.lineIndex + 1 }
    }
    return { ...progress, phase: 'second-choice', lineIndex: 0 }
  }

  if (progress.phase === 'second-feedback') {
    const option = career.secondChoice.options.find((entry) => entry.id === progress.secondChoiceId)
    if (option && progress.feedbackIndex + 1 < option.feedback.length) {
      return { ...progress, feedbackIndex: progress.feedbackIndex + 1 }
    }
    return { ...progress, phase: 'ending', lineIndex: 0, feedbackIndex: 0 }
  }

  if (progress.phase === 'ending') {
    return { ...progress, phase: 'letter' }
  }

  return progress
}

export function chooseCareerFirst(progress: CareerProgress, optionId: string): CareerProgress {
  if (progress.phase !== 'first-choice') return progress
  const option = getCareer(progress.careerId).firstChoice.options.find((entry) => entry.id === optionId)
  if (!option) return progress
  return {
    ...progress,
    firstChoiceId: option.id,
    secondChoiceId: null,
    phase: 'first-feedback',
    feedbackIndex: 0,
  }
}

export function chooseCareerSecond(progress: CareerProgress, optionId: string): CareerProgress {
  if (progress.phase !== 'second-choice' || !progress.firstChoiceId) return progress
  const option = getCareer(progress.careerId).secondChoice.options.find((entry) => entry.id === optionId)
  if (!option) return progress
  return {
    ...progress,
    secondChoiceId: option.id,
    phase: 'second-feedback',
    feedbackIndex: 0,
  }
}

export function finishCareerLetter(progress: CareerProgress): CareerId {
  return progress.careerId
}

export function getPrologueText(firstEnding: string | null, identity: PlayerIdentity | null) {
  return {
    laterYou: firstEnding
      ? expansionData.prologue.laterYou[firstEnding] ?? expansionData.prologue.fallbackLaterYou
      : expansionData.prologue.fallbackLaterYou,
    musicOpening: firstEnding
      ? expansionData.prologue.musicOpening[firstEnding] ?? expansionData.prologue.fallbackOpening
      : expansionData.prologue.fallbackOpening,
    identity,
  }
}

export function getFinaleOpening(firstEnding: string | null) {
  return firstEnding
    ? expansionData.finale.opening[firstEnding] ?? expansionData.finale.fallbackOpening
    : expansionData.finale.fallbackOpening
}

const finaleRecalls: Record<string, string> = {
  'doctor-awe-rest': '还好。我听见了医院那条线。那天值完班，那边的你走出医院，天居然还没黑。',
  'doctor-awe-reach': '还好。我听见了医院那条线。那边的你后来和大学室友约了一顿饭，这次没等什么合适的理由。',
  'doctor-care-rest': '还好。我听见了医院那条线。那边的你后来交班时，终于说了一句：“我需要十分钟。”',
  'doctor-care-reach': '还好。我听见了医院那条线。对方回了一句“你终于想起我了”，那边的你差点在走廊里笑出来。',
  'teacher-envy-stay': '还好。我听见了教室那条线。那边的你写了一页，觉得难看，也没把它删掉。',
  'teacher-envy-talk': '还好。我听见了教室那条线。学生画了最后一排的窗，还在窗边添了一个没那么累的老师。',
  'teacher-witness-stay': '还好。我听见了教室那条线。那边的你把“先放一放”换成了“先留一页”。',
  'teacher-witness-talk': '还好。我听见了教室那条线。那张像生气的土豆的速写，现在和学生的画贴在一起。',
  'designer-admire-deliver': '还好。我听见了设计那条线。第十二版过了，背景里的小人还在。',
  'designer-admire-close': '还好。我听见了设计那条线。那边的你睡了十个小时，醒来先画了自己的东西。',
  'designer-see-deliver': '还好。我听见了设计那条线。拒掉那个项目以后，那边的你把速写本画到了第七页。',
  'designer-see-close': '还好。我听见了设计那条线。那本只印了十份的小册子，第一页就是那个没再藏起来的小人。',
  'founder-freedom-partner': '还好。我听见了办公室那条线。朋友来时没带简历，带了两杯咖啡。',
  'founder-freedom-rest': '还好。我听见了办公室那条线。那边的你在江边坐到天黑，后来试着把周会挪到了周二。',
  'founder-alone-partner': '还好。我听见了办公室那条线。工资发出去的那天，那边的你终于承认，自己也需要有人拉一把。',
  'founder-alone-rest': '还好。我听见了办公室那条线。新办公室还是三张桌子，不过这次窗外有棵树。',
}

export function getFinaleLines(firstEnding: string | null, latestLetter?: CareerProgress): StoryLine[] {
  const ending = latestLetter ? getCareerEnding(latestLetter) : null
  const recall = ending ? finaleRecalls[ending.id] : undefined
  return [
    { speaker: '另一个你', text: getFinaleOpening(firstEnding) },
    ...finale.lines.map((line) => line.id === 'career-recall' && recall ? { ...line, text: recall } : line),
  ]
}

export function createExpansionState(): ExpansionState {
  return {
    identity: null,
    firstEnding: null,
    readCareers: [],
    finaleSeen: false,
  }
}

export function resetExpansionState(): ExpansionState {
  return createExpansionState()
}

export function markCareerRead(state: ExpansionState, careerId: CareerId): ExpansionState {
  return state.readCareers.includes(careerId)
    ? state
    : { ...state, readCareers: [...state.readCareers, careerId] }
}

export function canOpenFinale(state: ExpansionState): boolean {
  return state.readCareers.length > 0
}

export function validateExpansionData(): string[] {
  const errors: string[] = []
  const identityIds = new Set(expansionData.identities.map((identity) => identity.id))
  if (identityIds.size !== 3) errors.push('expected three identities')
  if (expansionData.careers.length !== 4) errors.push('expected four careers')

  for (const career of expansionData.careers) {
    if (!career.dialogue.length) errors.push(`${career.id} has no dialogue`)
    if (career.dialogue.some((line) => !line.text.trim())) errors.push(`${career.id} has an empty dialogue line`)
    for (const identity of expansionData.identities) {
      if (!career.identityResponses[identity.id]?.trim()) errors.push(`${career.id} missing ${identity.id} identity response`)
      if (!career.letterOpenings[identity.id]?.trim()) errors.push(`${career.id} missing ${identity.id} letter opening`)
    }
    for (const choice of [career.firstChoice, career.secondChoice]) {
      if (choice.options.length !== 2) errors.push(`${career.id} choice ${choice.id} must have two options`)
      const ids = new Set(choice.options.map((option) => option.id))
      if (ids.size !== 2) errors.push(`${career.id} choice ${choice.id} has duplicate option ids`)
      for (const option of choice.options) {
        if (!option.feedback.length) errors.push(`${career.id} ${choice.id}/${option.id} has no feedback`)
      }
    }
    if (career.endings.length !== 4) errors.push(`${career.id} must have four endings`)
    const combos = new Set(career.endings.map((ending) => `${ending.firstId}/${ending.secondId}`))
    if (combos.size !== 4) errors.push(`${career.id} ending combinations are not unique`)
    for (const ending of career.endings) {
      if (!ending.title.trim() || !ending.summary.trim() || !ending.letter.trim()) errors.push(`${ending.id} is incomplete`)
    }
  }

  return errors
}

function currentChoice(progress: CareerProgress): StoryChoice | null {
  if (progress.phase === 'first-feedback') return getCareer(progress.careerId).firstChoice
  if (progress.phase === 'second-feedback') return getCareer(progress.careerId).secondChoice
  return null
}

function activeChoiceId(progress: CareerProgress): string | null {
  return progress.phase === 'first-feedback' ? progress.firstChoiceId : progress.secondChoiceId
}
