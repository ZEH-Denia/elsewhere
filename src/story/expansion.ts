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