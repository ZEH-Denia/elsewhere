import { useEffect, useState } from 'react'

export type SceneName =
  | 'home'
  | 'incoming'
  | 'opening'
  | 'music'
  | 'reality'
  | 'first-choice'
  | 'regret'
  | 'cherish'
  | 'second-choice'
  | 'make-space'
  | 'reach-out'
  | 'farewell'
  | 'ending-regret-space'
  | 'ending-regret-reach'
  | 'ending-cherish-space'
  | 'ending-cherish-reach'

export function SceneBackground({ scene, preview = false }: { scene: SceneName; preview?: boolean }) {
  const [currentScene, setCurrentScene] = useState(scene)
  const [previousScene, setPreviousScene] = useState<SceneName | null>(null)

  useEffect(() => {
    if (scene === currentScene) return
    setPreviousScene(currentScene)
    setCurrentScene(scene)
  }, [scene, currentScene])

  useEffect(() => {
    if (!previousScene) return
    const timeout = window.setTimeout(() => setPreviousScene(null), 220)
    return () => window.clearTimeout(timeout)
  }, [previousScene])

  return (
    <div className={`scene-background${preview ? ' is-previewing' : ''}`} data-scene={currentScene} aria-hidden="true">
      {previousScene && (
        <img
          key={previousScene}
          className="scene-background-image scene-previous"
          src={`/backgrounds/${previousScene}.svg`}
          alt=""
          draggable={false}
        />
      )}
      <img
        key={currentScene}
        className={`scene-background-image scene-current${previousScene ? ' is-entering' : ''}`}
        src={`/backgrounds/${currentScene}.svg`}
        alt=""
        draggable={false}
      />
      <div className="scene-background-scrim" />
    </div>
  )
}
