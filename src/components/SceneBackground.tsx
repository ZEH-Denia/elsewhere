import { useEffect, useRef, useState } from 'react'

const sceneNames = [
  'home',
  'incoming',
  'opening',
  'music',
  'reality',
  'first-choice',
  'regret',
  'cherish',
  'second-choice',
  'make-space',
  'reach-out',
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
      return
    }

    setPreviewScene(activePreview)
    const frame = window.requestAnimationFrame(() => setPreviewVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [activePreview])

  return (
    <div className={`scene-background${activePreview ? ' is-previewing' : ''}`} data-scene={scene} aria-hidden="true">
      {sceneNames.map((name) => {
        const classes = ['scene-background-image']
        if (name === scene) classes.push('scene-current', 'is-active')
        if (name === outgoing) classes.push('scene-previous', 'is-outgoing')
        if (name === previewScene) classes.push('scene-preview')
        if (name === previewScene && activePreview && previewVisible) classes.push('is-preview-visible')

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
