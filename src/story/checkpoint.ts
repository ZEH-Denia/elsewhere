import {
  advanceCareer,
  chooseCareerFirst,
  chooseCareerSecond,
  createCareerProgress,
  finale,
  getCareerEntry,
  identities,
  type CareerProgress,
} from './expansion.js'
import type { PlayerIdentity, StoryLine } from './expansionTypes'
import { getOpeningNode, normalizeOpeningProgress, openingNodes, type OpeningProgress } from './opening.js'

const checkpointViews = ['intro', 'incoming', 'call', 'identity', 'hub', 'career', 'finale'] as const
const storageKey = 'elsewhere.checkpoint.v1'

export type CheckpointView = (typeof checkpointViews)[number]

export interface Checkpoint {
  view: CheckpointView
  progress: OpeningProgress
  identity: PlayerIdentity | null
  career: CareerProgress | null
  letters: CareerProgress[]
  finaleStep: number
  finaleSeen: boolean
  hubIntroSeen: boolean
  dialogueLog: StoryLine[]
}

export function letterKey(letter: CareerProgress) {
  return [letter.careerId, letter.firstChoiceId, letter.secondChoiceId].join('/')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Restore only positions reachable through the story, including the selected feedback and letter.
function readCareer(value: unknown, identity: PlayerIdentity | null): CareerProgress | null {
  if (!identity || !isRecord(value) || typeof value.careerId !== 'string') return null
  const story = getCareerEntry(value.careerId)
  if (!story || value.identity !== identity) return null

  let step = createCareerProgress(story.id, identity)
  for (;;) {
    if (step.phase === value.phase && step.lineIndex === value.lineIndex &&
        step.feedbackIndex === value.feedbackIndex && step.firstChoiceId === value.firstChoiceId &&
        step.secondChoiceId === value.secondChoiceId) return step

    const next = step.phase === 'first-choice'
      ? chooseCareerFirst(step, String(value.firstChoiceId))
      : step.phase === 'second-choice'
        ? chooseCareerSecond(step, String(value.secondChoiceId))
        : advanceCareer(step)
    if (next === step) return null
    step = next
  }
}

export function loadCheckpoint(): Checkpoint | null {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null')
    if (!isRecord(value) || !isRecord(value.progress) || typeof value.progress.nodeId !== 'string' ||
        !Object.hasOwn(openingNodes, value.progress.nodeId)) return null
    const view = checkpointViews.find((item) => item === value.view)
    if (!view) return null

    const progress = normalizeOpeningProgress(value.progress as unknown as OpeningProgress)
    const identity = identities.find(({ id }) => id === value.identity)?.id ?? null
    const expectedEnding = getOpeningNode(progress.nodeId).kind === 'end'
    if (['identity', 'hub', 'career', 'finale'].includes(view) && !expectedEnding) return null
    if (['hub', 'career', 'finale'].includes(view) && !identity) return null

    const career = view === 'career' ? readCareer(value.career, identity) : null
    const letters = new Map<string, CareerProgress>()
    if (Array.isArray(value.letters)) {
      for (const entry of value.letters) {
        const letter = readCareer(entry, identity)
        if (letter?.phase === 'letter') letters.set(letterKey(letter), letter)
      }
    }
    const rawStep = value.finaleStep
    const finaleStep = typeof rawStep === 'number' && Number.isInteger(rawStep) && rawStep >= 0
      ? Math.min(rawStep, finale.lines.length + 1)
      : 0
    const dialogueLog = Array.isArray(value.dialogueLog)
      ? value.dialogueLog.slice(-100).filter((line): line is StoryLine => isRecord(line) &&
        ['另一个你', '你', '你（内心）', '旁白'].includes(String(line.speaker)) &&
        typeof line.text === 'string' && line.text.length > 0 && line.text.length <= 520)
      : []

    return {
      view: (view === 'career' && !career) || (view === 'finale' && letters.size === 0) ? 'hub' : view,
      progress, identity, career, letters: [...letters.values()], finaleStep,
      finaleSeen: value.finaleSeen === true,
      hubIntroSeen: value.hubIntroSeen === true,
      dialogueLog,
    }
  } catch {
    return null
  }
}

export function storeCheckpoint(checkpoint: Checkpoint | null) {
  try {
    if (checkpoint) window.localStorage.setItem(storageKey, JSON.stringify(checkpoint))
    else window.localStorage.removeItem(storageKey)
  } catch {
    // A blocked or full store still allows play in the current tab.
  }
}

export function soundsAreEnabled() {
  try {
    return window.localStorage.getItem('elsewhere.sound') !== 'muted'
  } catch {
    return true
  }
}

export function storeSoundPreference(enabled: boolean) {
  try {
    window.localStorage.setItem('elsewhere.sound', enabled ? 'enabled' : 'muted')
  } catch {
    // Keep the setting for the current tab.
  }
}
