import { useEffect, useRef, useState } from 'react'

const sceneNames = [
  'home',
  'incoming',
  'opening',
  'connection',
  'doubt',
  'music',
  'reality',
  'rehearsal',
  'desk',
  'question',
  'first-choice',
  'regret',
  'regret-quiet',
  'cherish',
  'cherish-morning',
  'second-choice',
  'make-space',
  'reach-out',
  'closing',
  'farewell',
  'ending-regret-space',
  'ending-regret-reach',
  'ending-cherish-space',
  'ending-cherish-reach',
] as const

export type SceneName = (typeof sceneNames)[number]

export function SceneBackground({ scene, preview = null }: { scene: SceneName; preview?: SceneName | null }) {
  const [outgoing, setOutgoing] = useState<SceneName | null>(null)
  const [previewScene, setPreviewScene] = useState<SceneName | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const previousScene = useRef(scene)
  const activePreview = preview && preview !== scene ? preview : null
  const mountedScenes = [...new Set([scene, outgoing, previewScene].filter((name): name is SceneName => Boolean(name)))]

  useEffect(() => {
    for (const name of sceneNames) {
      const image = new Image()
      image.src = `/backgrounds/${name}.svg`
    }
  }, [])

  useEffect(() => {
    if (previousScene.current === scene) return
    setOutgoing(previousScene.current)
    previousScene.current = scene
    const timer = window.setTimeout(() => setOutgoing(null), 240)
    return () => window.clearTimeout(timer)
  }, [scene])

  useEffect(() => {
    if (!activePreview) {
      setPreviewVisible(false)
      const timer = window.setTimeout(() => setPreviewScene(null), 220)
      return () => window.clearTimeout(timer)
    }

    setPreviewScene(activePreview)
    const frame = window.requestAnimationFrame(() => setPreviewVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [activePreview])

  return (
    <div className={`scene-background${activePreview ? ' is-previewing' : ''}`} data-scene={scene} aria-hidden="true">
      {mountedScenes.map((name) => {
        const classes = ['scene-background-image']
        if (name === scene) classes.push('scene-current', 'is-active')
        if (name === outgoing) classes.push('scene-previous', 'is-outgoing')
        if (name === previewScene && name !== scene) classes.push('scene-preview')
        if (name === previewScene && name !== scene && activePreview && previewVisible) classes.push('is-preview-visible')

        return (
          <img
            key={name}
            className={classes.join(' ')}
            src={`/backgrounds/${name}.svg`}
            alt=""
            draggable={false}
          />
        )
      })}
    </div>
  )
}
