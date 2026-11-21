export type PlayerIdentity = 'steady' | 'working' | 'turning'
export type CareerId = 'doctor' | 'teacher' | 'designer' | 'founder'
export type ExpansionSpeaker = '另一个你' | '你' | '你（内心）' | '旁白'

export interface StoryLine {
  id?: string
  speaker: ExpansionSpeaker
  text: string
}

export interface StoryOption {
  id: string
  label: string
  feedback: StoryLine[]
}

export interface StoryChoice {
  id: string
  prompt: string
  options: [StoryOption, StoryOption]
}

export interface CareerEnding {
  id: string
  firstId: string
  secondId: string
  title: string
  summary: string
  lastLine: string
  letter: string
}

export interface CareerStory {
  id: CareerId
  title: string
  scene: string
  profile: string
  dialogue: StoryLine[]
  identityResponses: Record<PlayerIdentity, string>
  firstChoice: StoryChoice
  transition: StoryLine[]
  secondChoice: StoryChoice
  endings: CareerEnding[]
  letterOpenings: Record<PlayerIdentity, string>
}

export interface HubCard {
  id: CareerId
  label: string
  time: string
  hook: string
}

export interface IdentityOption {
  id: PlayerIdentity
  label: string
  description: string
}

export interface PrologueData {
  laterYou: Record<string, string>
  fallbackLaterYou: string
  musicOpening: Record<string, string>
  fallbackOpening: string
  bridge: StoryLine[]
  handoff: StoryLine[]
  cards: HubCard[]
}

export interface FinaleData {
  opening: Record<string, string>
  fallbackOpening: string
  lines: StoryLine[]
  letter: string
}

export interface ExpansionData {
  identities: IdentityOption[]
  prologue: PrologueData
  careers: CareerStory[]
  finale: FinaleData
}