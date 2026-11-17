export const choiceIds = ['regret', 'cherish-present'] as const

export type ChoiceId = (typeof choiceIds)[number]
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
  | 'opening-end'

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
  id: ChoiceId
  label: string
  feedback: [FeedbackNode, FeedbackNode]
}

export interface ChoiceNode {
  id: 'first-response'
  kind: 'choice'
  options: [ChoiceOption, ChoiceOption]
}

export interface ClosingNode {
  id: 'opening-closing'
  kind: 'closing'
  speaker: '另一个你'
  text: string
  next: 'opening-end'
}

export interface EndNode {
  id: 'opening-end'
  kind: 'end'
  title: string
  summaries: Record<ChoiceId, string>
}

export type OpeningNode = DialogueNode | FeedbackNode | ChoiceNode | ClosingNode | EndNode

export interface OpeningProgress {
  nodeId: OpeningNodeId
  choiceId: ChoiceId | null
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

export const closingNode: ClosingNode = {
  id: 'opening-closing',
  kind: 'closing',
  speaker: '另一个你',
  text: '电话快断了。至少这一次，我们听见了彼此。',
  next: 'opening-end',
}

export const openingEnd: EndNode = {
  id: 'opening-end',
  kind: 'end',
  title: '第一通来电，暂时结束。',
  summaries: {
    regret: '你说出了遗憾，也给一次小小的尝试留了位置。',
    'cherish-present': '你珍惜当下，也没有关上另一种可能。',
  },
}

export const openingNodes = {
  ...Object.fromEntries(openingDialogue.map((node) => [node.id, node])),
  ...Object.fromEntries(firstChoice.options.flatMap((option) => option.feedback.map((node) => [node.id, node]))),
  'first-response': firstChoice,
  'opening-closing': closingNode,
  'opening-end': openingEnd,
} as Record<OpeningNodeId, OpeningNode>

export function validateOpeningStory(nodes: Record<string, OpeningNode> = openingNodes): string[] {
  const errors: string[] = []
  const records = Object.values(nodes)

  if (!nodes['opening-01']) errors.push('missing opening-01')

  for (const node of records) {
    if ('next' in node && !nodes[node.next]) {
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
        : 'next' in node ? [node.next] : []
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
  return { nodeId: 'opening-01', choiceId: null }
}

export function getOpeningNode(nodeId: string): OpeningNode {
  return (openingNodes as Record<string, OpeningNode | undefined>)[nodeId] ?? openingNodes['opening-01']
}

export function normalizeOpeningProgress(progress: OpeningProgress): OpeningProgress {
  const node = (openingNodes as Record<string, OpeningNode | undefined>)[progress.nodeId]
  if (!node) return createInitialOpeningProgress()

  if (node.kind === 'feedback') {
    const option = firstChoice.options.find(({ id }) => id === progress.choiceId)
    if (!option?.feedback.some(({ id }) => id === node.id)) {
      return { nodeId: 'first-response', choiceId: null }
    }
  }

  if ((node.kind === 'closing' || node.kind === 'end') && !progress.choiceId) {
    return { nodeId: 'first-response', choiceId: null }
  }

  if ((node.kind === 'dialogue' || node.kind === 'choice') && progress.choiceId) {
    return { nodeId: node.id, choiceId: null }
  }

  return progress
}

export function advanceOpening(progress: OpeningProgress): OpeningProgress {
  const current = normalizeOpeningProgress(progress)
  const node = getOpeningNode(current.nodeId)

  if (node.kind === 'dialogue' || node.kind === 'feedback' || node.kind === 'closing') {
    return { ...current, nodeId: node.next }
  }

  return current
}

export function chooseOpening(progress: OpeningProgress, choiceId: ChoiceId): OpeningProgress {
  const current = normalizeOpeningProgress(progress)
  const node = getOpeningNode(current.nodeId)
  if (node.kind !== 'choice') return current

  const option = node.options.find(({ id }) => id === choiceId)
  if (!option) return current

  return { nodeId: option.feedback[0].id, choiceId }
}
