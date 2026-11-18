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

export function SceneBackground({ scene }: { scene: SceneName }) {
  return (
    <div className="scene-background" aria-hidden="true">
      <img
        key={scene}
        className="scene-background-image"
        src={`/backgrounds/${scene}.svg`}
        alt=""
        draggable={false}
      />
      <div className="scene-background-scrim" />
    </div>
  )
}
