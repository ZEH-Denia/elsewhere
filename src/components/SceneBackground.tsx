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

export function SceneBackground({ scene, preview = false }: { scene: SceneName; preview?: boolean }) {
  return (
    <div className={`scene-background${preview ? ' is-previewing' : ''}`} data-scene={scene} aria-hidden="true">
      {sceneNames.map((name) => (
        <img
          key={name}
          className={`scene-background-image${name === scene ? ' scene-current is-active' : ''}`}
          src={`/backgrounds/${name}.svg`}
          alt=""
          draggable={false}
        />
      ))}
      <div className="scene-background-scrim" />
    </div>
  )
}
