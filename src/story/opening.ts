export const choiceIds = ['regret', 'cherish-present'] as const
export const nextStepIds = ['make-space', 'reach-out'] as const

export type ChoiceId = (typeof choiceIds)[number]
export type NextStepId = (typeof nextStepIds)[number]
export type EndingId = 'regret-make-space' | 'regret-reach-out' | 'cherish-make-space' | 'cherish-reach-out'
export type Speaker = '你' | '另一个你'
export type OpeningNodeId =
  | 'opening-01'
  | 'opening-02'
  | 'opening-03'
  | 'opening-04'
  | 'opening-05'
  | 'opening-06'
  | 'opening-07'
  | 'first-response'
  | 'regret-feedback-01'
  | 'regret-feedback-02'
  | 'cherish-feedback-01'
  | 'cherish-feedback-02'
  | 'opening-closing'
  | 'next-step'
  | 'make-space-feedback'
  | 'reach-out-feedback'
  | 'call-farewell'
  | EndingId

export interface DialogueNode {
  id: OpeningNodeId
  kind: 'dialogue'
  speaker: Speaker
  text: string
  next: OpeningNodeId
}

export interface FeedbackNode {
  id: OpeningNodeId
  kind: 'feedback'
  speaker: Speaker
  text: string
  next: OpeningNodeId
}

export interface ChoiceOption {
  id: ChoiceId | NextStepId
  label: string
  feedback: [FeedbackNode, ...FeedbackNode[]]
}

export interface ChoiceNode {
  id: 'first-response' | 'next-step'
  kind: 'choice'
  options: [ChoiceOption, ChoiceOption]
}

export interface ClosingNode {
  id: 'opening-closing' | 'call-farewell'
  kind: 'closing'
  speaker: '另一个你' | '旁白'
  text: string
  next: 'next-step' | null
}

export interface EndNode {
  id: EndingId
  kind: 'end'
  choiceId: ChoiceId
  nextStepId: NextStepId
  title: string
  summary: string
}

export type OpeningNode = DialogueNode | FeedbackNode | ChoiceNode | ClosingNode | EndNode

export interface OpeningProgress {
  nodeId: OpeningNodeId
  choiceId: ChoiceId | null
  nextStepId: NextStepId | null
}

export const openingDialogue: DialogueNode[] = [
  {
    id: 'opening-01',
    kind: 'dialogue',
    speaker: '另一个你',
    text: '喂？先别挂。如果我说，我也是你呢？',
    next: 'opening-02',
  },
  {
    id: 'opening-02',
    kind: 'dialogue',
    speaker: '你',
    text: '这是什么恶作剧？',
    next: 'opening-03',
  },
  {
    id: 'opening-03',
    kind: 'dialogue',
    speaker: '另一个你',
    text: '那年填志愿，我把工程改成了音乐。你是不是没有改？',
    next: 'opening-04',
  },
  {
    id: 'opening-04',
    kind: 'dialogue',
    speaker: '你',
    text: '……没有。我留在了那条更稳妥的路上。',
    next: 'opening-05',
  },
  {
    id: 'opening-05',
    kind: 'dialogue',
    speaker: '另一个你',
    text: '我刚结束一次排练。能演自己写的歌很开心，可下个月的演出费还没着落。',
    next: 'opening-06',
  },
  {
    id: 'opening-06',
    kind: 'dialogue',
    speaker: '你',
    text: '我在准备实习。生活有了安排，但那把吉他已经很久没碰过。',
    next: 'opening-07',
  },
  {
    id: 'opening-07',
    kind: 'dialogue',
    speaker: '另一个你',
    text: '所以我想问，你现在最想对另一个自己说什么？',
    next: 'first-response',
  },
]

export const firstChoice: ChoiceNode = {
  id: 'first-response',
  kind: 'choice',
  options: [
    {
      id: 'regret',
      label: '我有点遗憾，没继续学音乐。',
      feedback: [
        {
          id: 'regret-feedback-01',
          kind: 'feedback',
          speaker: '另一个你',
          text: '我也会想，如果当年选了工程，会不会少一些不安。也许我们都看见了另一边的光。',
          next: 'regret-feedback-02',
        },
        {
          id: 'regret-feedback-02',
          kind: 'feedback',
          speaker: '你',
          text: '也许可以先把那把吉他找出来，不用马上推翻整个生活。',
          next: 'opening-closing',
        },
      ],
    },
    {
      id: 'cherish-present',
      label: '我也有想珍惜的，当下的生活。',
      feedback: [
        {
          id: 'cherish-feedback-01',
          kind: 'feedback',
          speaker: '另一个你',
          text: '那就先别急着否定它。我舍不得舞台，也羡慕你身边那些安稳的日常。',
          next: 'cherish-feedback-02',
        },
        {
          id: 'cherish-feedback-02',
          kind: 'feedback',
          speaker: '你',
          text: '我想先认真过好今天，也给喜欢的事留一个位置。',
          next: 'opening-closing',
        },
      ],
    },
  ],
}

export const openingClosing: ClosingNode = {
  id: 'opening-closing',
  kind: 'closing',
  speaker: '旁白',
  text: '电话里的杂音慢慢弱了下去。另一个你还在等你的回答。',
  next: 'next-step',
}

export const secondChoice: ChoiceNode = {
  id: 'next-step',
  kind: 'choice',
  options: [
    {
      id: 'make-space',
      label: '给喜欢的事留一点时间。',
      feedback: [
        {
          id: 'make-space-feedback',
          kind: 'feedback',
          speaker: '另一个你',
          text: '不用急着证明什么。先给自己留下一小段时间，也许就够了。',
          next: 'call-farewell',
        },
      ],
    },
    {
      id: 'reach-out',
      label: '找一个信任的人聊一聊。',
      feedback: [
        {
          id: 'reach-out-feedback',
          kind: 'feedback',
          speaker: '另一个你',
          text: '说出来不一定马上有答案，但你不必一个人想完所有事。',
          next: 'call-farewell',
        },
      ],
    },
  ],
}

export const callFarewell: ClosingNode = {
  id: 'call-farewell',
  kind: 'closing',
  speaker: '另一个你',
  text: '谢谢你接起这通电话。我们都继续好好生活吧。',
  next: null,
}

export const endings: EndNode[] = [
  {
    id: 'regret-make-space',
    kind: 'end',
    choiceId: 'regret',
    nextStepId: 'make-space',
    title: '把旋律找回来',
    summary: '你承认了遗憾，决定先为音乐留出一点时间。另一条路没有消失，它可以从一个小小的练习开始。',
  },
  {
    id: 'regret-reach-out',
    kind: 'end',
    choiceId: 'regret',
    nextStepId: 'reach-out',
    title: '让遗憾被听见',
    summary: '你承认了遗憾，也愿意找信任的人聊聊。那些未说出口的愿望，终于有了被听见的机会。',
  },
  {
    id: 'cherish-make-space',
    kind: 'end',
    choiceId: 'cherish-present',
    nextStepId: 'make-space',
    title: '给今天留一首歌',
    summary: '你珍惜已有的生活，也为喜欢的事留下位置。安稳与热爱，可以在同一天里慢慢相遇。',
  },
  {
    id: 'cherish-reach-out',
    kind: 'end',
    choiceId: 'cherish-present',
    nextStepId: 'reach-out',
    title: '和身边的人分享',
    summary: '你珍惜当下，也愿意把自己的想法说出来。平凡的日子因为彼此理解，多了一点新的可能。',
  },
]

const endingNodes = Object.fromEntries(endings.map((node) => [node.id, node]))

export const openingNodes = {
  ...Object.fromEntries(openingDialogue.map((node) => [node.id, node])),
  ...Object.fromEntries(firstChoice.options.flatMap((option) => option.feedback.map((node) => [node.id, node]))),
  ...Object.fromEntries(secondChoice.options.flatMap((option) => option.feedback.map((node) => [node.id, node]))),
  ...endingNodes,
  'first-response': firstChoice,
  'opening-closing': openingClosing,
  'next-step': secondChoice,
  'call-farewell': callFarewell,
} as Record<OpeningNodeId, OpeningNode>

const endingByChoice: Record<ChoiceId, Record<NextStepId, EndingId>> = {
  regret: {
    'make-space': 'regret-make-space',
    'reach-out': 'regret-reach-out',
  },
  'cherish-present': {
    'make-space': 'cherish-make-space',
    'reach-out': 'cherish-reach-out',
  },
}

function isChoiceId(value: unknown): value is ChoiceId {
  return choiceIds.includes(value as ChoiceId)
}

function isNextStepId(value: unknown): value is NextStepId {
  return nextStepIds.includes(value as NextStepId)
}

export function getEndingId(choiceId: ChoiceId, nextStepId: NextStepId): EndingId {
  return endingByChoice[choiceId][nextStepId]
}

export function validateOpeningStory(nodes: Record<string, OpeningNode> = openingNodes): string[] {
  const errors: string[] = []
  const records = Object.values(nodes)

  if (!nodes['opening-01']) errors.push('missing opening-01')

  for (const node of records) {
    if ('next' in node && node.next && !nodes[node.next]) {
      errors.push(`${node.id} references missing node ${node.next}`)
    }
    if (node.kind === 'choice') {
      for (const option of node.options) {
        for (const feedback of option.feedback) {
          if (!nodes[feedback.id]) errors.push(`${node.id} references missing node ${feedback.id}`)
        }
      }
    }
  }

  const canReachEnd = new Set(records.filter(({ kind }) => kind === 'end').map(({ id }) => id))
  if (canReachEnd.size === 0) errors.push('story has no ending')

  let changed = true
  while (changed) {
    changed = false
    for (const node of records) {
      if (canReachEnd.has(node.id)) continue
      const nextIds = node.kind === 'choice'
        ? node.options.map((option) => option.feedback[0].id)
        : node.id === 'call-farewell'
          ? endings.map(({ id }) => id)
          : 'next' in node && node.next ? [node.next] : []
      if (nextIds.some((id) => canReachEnd.has(id))) {
        canReachEnd.add(node.id)
        changed = true
      }
    }
  }

  for (const node of records) {
    if (!canReachEnd.has(node.id)) errors.push(`${node.id} cannot reach an ending`)
  }

  return errors
}

export function createInitialOpeningProgress(): OpeningProgress {
  return { nodeId: 'opening-01', choiceId: null, nextStepId: null }
}

export function getOpeningNode(nodeId: string): OpeningNode {
  return (openingNodes as Record<string, OpeningNode | undefined>)[nodeId] ?? openingNodes['opening-01']
}

export function normalizeOpeningProgress(progress: OpeningProgress): OpeningProgress {
  const node = (openingNodes as Record<string, OpeningNode | undefined>)[progress.nodeId]
  if (!node) return createInitialOpeningProgress()

  const choiceId = isChoiceId(progress.choiceId) ? progress.choiceId : null
  const nextStepId = isNextStepId(progress.nextStepId) ? progress.nextStepId : null
  const current = { nodeId: node.id, choiceId, nextStepId }

  if (node.kind === 'dialogue' || node.id === 'first-response') {
    return { nodeId: node.id, choiceId: null, nextStepId: null }
  }

  if (node.kind === 'feedback') {
    const firstOption = firstChoice.options.find((option) => option.feedback.some(({ id }) => id === node.id))
    if (firstOption) {
      if (firstOption.id !== choiceId) return { nodeId: 'first-response', choiceId: null, nextStepId: null }
      return { nodeId: node.id, choiceId, nextStepId: null }
    }

    const secondOption = secondChoice.options.find((option) => option.feedback.some(({ id }) => id === node.id))
    if (!choiceId) return { nodeId: 'first-response', choiceId: null, nextStepId: null }
    if (secondOption?.id !== nextStepId) return { nodeId: 'next-step', choiceId, nextStepId: null }
    return current
  }

  if (node.id === 'opening-closing' || node.id === 'next-step') {
    if (!choiceId) return { nodeId: 'first-response', choiceId: null, nextStepId: null }
    return { nodeId: node.id, choiceId, nextStepId: null }
  }

  if (node.id === 'call-farewell' || node.kind === 'end') {
    if (!choiceId) return { nodeId: 'first-response', choiceId: null, nextStepId: null }
    if (!nextStepId) return { nodeId: 'next-step', choiceId, nextStepId: null }
    if (node.kind === 'end') return { ...current, nodeId: getEndingId(choiceId, nextStepId) }
  }

  return current
}

export function advanceOpening(progress: OpeningProgress): OpeningProgress {
  const current = normalizeOpeningProgress(progress)
  const node = getOpeningNode(current.nodeId)

  if (node.kind === 'dialogue' || node.kind === 'feedback') {
    return { ...current, nodeId: node.next }
  }

  if (node.kind === 'closing') {
    if (node.next) return { ...current, nodeId: node.next }
    if (current.choiceId && current.nextStepId) {
      return { ...current, nodeId: getEndingId(current.choiceId, current.nextStepId) }
    }
  }

  return current
}

export function chooseOpening(
  progress: OpeningProgress,
  optionId: ChoiceId | NextStepId,
): OpeningProgress {
  const current = normalizeOpeningProgress(progress)
  const node = getOpeningNode(current.nodeId)
  if (node.kind !== 'choice') return current

  if (node.id === 'first-response') {
    const option = firstChoice.options.find(({ id }) => id === optionId)
    if (!option) return current
    return { nodeId: option.feedback[0].id, choiceId: option.id as ChoiceId, nextStepId: null }
  }

  const option = secondChoice.options.find(({ id }) => id === optionId)
  if (!option || !current.choiceId) return current
  return { ...current, nodeId: option.feedback[0].id, nextStepId: option.id as NextStepId }
}
