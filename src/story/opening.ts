export const choiceIds = ['regret', 'cherish-present'] as const
export const nextStepIds = ['make-space', 'reach-out'] as const

export type ChoiceId = (typeof choiceIds)[number]
export type NextStepId = (typeof nextStepIds)[number]
export type EndingId = 'regret-make-space' | 'regret-reach-out' | 'cherish-make-space' | 'cherish-reach-out'
export type Speaker = '你' | '你（内心）' | '另一个你'
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
    text: '喂？先别挂——如果我说，我也是你呢？',
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
    text: '那年填志愿，我把工程改成了音乐。你没改，对吧？',
    next: 'opening-04',
  },
  {
    id: 'opening-04',
    kind: 'dialogue',
    speaker: '你',
    text: '……没有。我留在了原来的路上，当时觉得它更稳妥。',
    next: 'opening-05',
  },
  {
    id: 'opening-05',
    kind: 'dialogue',
    speaker: '另一个你',
    text: '我刚排练完。能唱自己写的歌，我很开心。可下个月的演出费，还没有着落。',
    next: 'opening-06',
  },
  {
    id: 'opening-06',
    kind: 'dialogue',
    speaker: '你',
    text: '我在准备实习，日子有了安排。可那把吉他，已经很久没碰过了。',
    next: 'opening-07',
  },
  {
    id: 'opening-07',
    kind: 'dialogue',
    speaker: '另一个你',
    text: '所以我想问你：现在，你最想对另一个自己说什么？',
    next: 'first-response',
  },
]

export const firstChoice: ChoiceNode = {
  id: 'first-response',
  kind: 'choice',
  options: [
    {
      id: 'regret',
      label: '我有点遗憾，当年没有继续学音乐。',
      feedback: [
        {
          id: 'regret-feedback-01',
          kind: 'feedback',
          speaker: '另一个你',
          text: '我有时也会想，如果当年选了工程，是不是就能少一些不安。也许我们都看到了对方那边的光。',
          next: 'regret-feedback-02',
        },
        {
          id: 'regret-feedback-02',
          kind: 'feedback',
          speaker: '你（内心）',
          text: '……原来，你也会不安。',
          next: 'opening-closing',
        },
      ],
    },
    {
      id: 'cherish-present',
      label: '我很珍惜，现在拥有的生活。',
      feedback: [
        {
          id: 'cherish-feedback-01',
          kind: 'feedback',
          speaker: '另一个你',
          text: '那就不必急着否定它。我舍不得舞台，也羡慕你身边那份安稳的日常。',
          next: 'cherish-feedback-02',
        },
        {
          id: 'cherish-feedback-02',
          kind: 'feedback',
          speaker: '你（内心）',
          text: '我想先认真过好今天。',
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
  text: '电话里的杂音渐渐弱了下去。另一个你沉默片刻，轻轻开了口。',
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
          text: '不用急着证明什么。先给自己留一小段时间，也许就够了。',
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
          text: '说出来，不一定马上有答案，但你不必一个人把所有事想完。',
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
  text: '谢谢你接起这通电话。愿我们，都能好好生活。',
  next: null,
}

export const endings: EndNode[] = [
  {
    id: 'regret-make-space',
    kind: 'end',
    choiceId: 'regret',
    nextStepId: 'make-space',
    title: '把旋律找回来',
    summary: '你坦然面对了那份遗憾，也决定先为音乐留出一点时间。那条没走的路并未消失，它可以从一次小小的练习重新开始。',
  },
  {
    id: 'regret-reach-out',
    kind: 'end',
    choiceId: 'regret',
    nextStepId: 'reach-out',
    title: '让遗憾被听见',
    summary: '你承认了心里的遗憾，也愿意向信任的人开口。那些没说出口的心事，有了被听见的可能。',
  },
  {
    id: 'cherish-make-space',
    kind: 'end',
    choiceId: 'cherish-present',
    nextStepId: 'make-space',
    title: '给今天留一首歌',
    summary: '你珍惜现在的生活，也为喜欢的事留出了位置。安稳与热爱，也许能在同一天里慢慢相遇。',
  },
  {
    id: 'cherish-reach-out',
    kind: 'end',
    choiceId: 'cherish-present',
    nextStepId: 'reach-out',
    title: '和身边的人分享',
    summary: '你珍惜眼前的日子，也愿意把心里的想法说出来。被理解的日常，也许会多出一点新的可能。',
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
  const endingIds = choiceIds.flatMap((choiceId) => (
    nextStepIds.map((nextStepId) => getEndingId(choiceId, nextStepId))
  ))

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

  for (const choiceId of choiceIds) {
    for (const nextStepId of nextStepIds) {
      const combination = `${choiceId}/${nextStepId}`
      const endingId = getEndingId(choiceId, nextStepId)
      const ending = nodes[endingId]

      if (!ending) {
        errors.push(`${combination} references missing ending ${endingId}`)
      } else if (ending.kind !== 'end') {
        errors.push(`${combination} ending ${endingId} is not an end node`)
      } else if (ending.choiceId !== choiceId || ending.nextStepId !== nextStepId) {
        errors.push(`ending ${endingId} maps ${ending.choiceId}/${ending.nextStepId}, expected ${combination}`)
      }

      const reached = new Set<string>()
      const pending: OpeningProgress[] = [createInitialOpeningProgress()]
      let reachesEnding = false

      for (let index = 0; index < pending.length; index += 1) {
        const current = pending[index]
        const stateKey = `${current.nodeId}|${current.choiceId ?? '-'}|${current.nextStepId ?? '-'}`
        if (reached.has(stateKey)) continue
        reached.add(stateKey)
        const node = nodes[current.nodeId]
        if (!node) continue

        if (node.kind === 'end') {
          if (current.nodeId === endingId && current.choiceId === choiceId && current.nextStepId === nextStepId) {
            reachesEnding = true
          }
          continue
        }

        const nextStates: OpeningProgress[] = []
        if (node.kind === 'dialogue') {
          if (node.next) nextStates.push({ nodeId: node.next, choiceId: null, nextStepId: null })
        } else if (node.kind === 'choice') {
          if (node.id === 'first-response') {
            const option = node.options.find(({ id }) => id === choiceId)
            if (option) {
              nextStates.push({ nodeId: option.feedback[0].id, choiceId, nextStepId: null })
            }
          } else if (current.choiceId === choiceId) {
            const option = node.options.find(({ id }) => id === nextStepId)
            if (option) nextStates.push({ nodeId: option.feedback[0].id, choiceId, nextStepId })
          }
        } else if (node.kind === 'feedback') {
          const firstNode = nodes['first-response']
          const firstOption = firstNode?.kind === 'choice'
            ? firstNode.options.find((option) => option.feedback.some(({ id }) => id === node.id))
            : undefined
          const secondNode = nodes['next-step']
          const secondOption = secondNode?.kind === 'choice'
            ? secondNode.options.find((option) => option.feedback.some(({ id }) => id === node.id))
            : undefined
          const matchesFirst = firstOption && current.choiceId === firstOption.id && !current.nextStepId
          const matchesSecond = secondOption && current.choiceId === choiceId && current.nextStepId === secondOption.id
          if ((matchesFirst || matchesSecond) && node.next) nextStates.push({ ...current, nodeId: node.next })
        } else if (node.id === 'opening-closing') {
          if (current.choiceId === choiceId && node.next) {
            nextStates.push({ nodeId: node.next, choiceId, nextStepId: null })
          }
        } else if (current.choiceId === choiceId && current.nextStepId === nextStepId) {
          nextStates.push({ ...current, nodeId: node.next ?? endingId })
        }

        pending.push(...nextStates.filter((state) => {
          const key = `${state.nodeId}|${state.choiceId ?? '-'}|${state.nextStepId ?? '-'}`
          return !reached.has(key)
        }))
      }

      if (!reachesEnding) errors.push(`${combination} cannot reach ending ${endingId}`)
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
          ? endingIds
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
