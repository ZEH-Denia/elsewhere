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
  'doctor',
  'doctor-triage',
  'doctor-break',
  'doctor-night',
  'teacher',
  'teacher-window',
  'teacher-office',
  'teacher-corridor',
  'designer',
  'designer-wall',
  'designer-night',
  'designer-sketch',
  'founder',
  'founder-meeting',
  'founder-window',
  'founder-server',
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

type SceneLayer = { key: number; name: SceneName }

const imageCache = new Map<SceneName, HTMLImageElement>()

function whenDecoded(name: SceneName) {
  let image = imageCache.get(name)
  if (!image) {
    image = new Image()
    image.src = `/backgrounds/${name}.svg`
    imageCache.set(name, image)
  }

  return image.decode().catch(
    () =>
      new Promise<void>((resolve) => {
        if (image.complete) {
          resolve()
          return
        }
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      }),
  )
}

function useFadeLayers(target: SceneName | null) {
  const [layers, setLayers] = useState<SceneLayer[]>([])
  const [readyKeys, setReadyKeys] = useState<number[]>([])
  const layersRef = useRef(layers)
  const keyRef = useRef(0)

  useEffect(() => {
    layersRef.current = layers
  }, [layers])

  useEffect(() => {
    if (!target) {
      setReadyKeys((current) => (current.length ? [] : current))
      const timer = window.setTimeout(() => setLayers((current) => (current.length ? [] : current)), 260)
      return () => window.clearTimeout(timer)
    }

    const top = layersRef.current[layersRef.current.length - 1]
    if (top && top.name === target) {
      void whenDecoded(target).then(() => {
        setReadyKeys((current) => (current.includes(top.key) ? current : [...current, top.key]))
      })
      return
    }

    const key = ++keyRef.current
    setLayers((current) => [...current, { key, name: target }])
    let cancelled = false
    void whenDecoded(target).then(() => {
      if (!cancelled) {
        setReadyKeys((current) => (current.includes(key) ? current : [...current, key]))
      }
    })
    return () => {
      cancelled = true
    }
  }, [target])

  useEffect(() => {
    const top = layers[layers.length - 1]
    if (!top || !readyKeys.includes(top.key)) return
    const timer = window.setTimeout(() => {
      setLayers((current) => {
        const last = current[current.length - 1]
        return last ? [last] : current
      })
    }, 320)
    return () => window.clearTimeout(timer)
  }, [layers, readyKeys])

  return { layers, readyKeys }
}

export function SceneBackground({
  scene,
  preview = null,
  previewTone,
}: {
  scene: SceneName
  preview?: SceneName | null
  previewTone?: 'cool' | 'warm'
}) {
  const activePreview = preview && preview !== scene ? preview : null
  const sceneLayers = useFadeLayers(scene)
  const previewLayers = useFadeLayers(activePreview)

  useEffect(() => {
    for (const name of sceneNames) {
      if (imageCache.has(name)) continue
      const image = new Image()
      image.src = `/backgrounds/${name}.svg`
      imageCache.set(name, image)
    }
  }, [])

  return (
    <div
      className={`scene-background${activePreview || previewTone ? ' is-previewing' : ''}`}
      data-scene={scene}
      data-preview-tone={previewTone}
      aria-hidden="true"
    >
      {sceneLayers.layers.map((layer, index) => {
        const isLatest = index === sceneLayers.layers.length - 1
        return (
          <div
            key={layer.key}
            className={`scene-layer${sceneLayers.readyKeys.includes(layer.key) ? ' is-visible' : ''}`}
            style={{ zIndex: index + 1 }}
          >
            <img
              className={`scene-background-image ${isLatest ? 'scene-current' : 'scene-previous'}`}
              src={`/backgrounds/${layer.name}.svg`}
              alt=""
              draggable={false}
            />
          </div>
        )
      })}
      {previewLayers.layers.map((layer, index) => (
        <div
          key={`preview-${layer.key}`}
          className={`scene-layer${previewLayers.readyKeys.includes(layer.key) ? ' is-visible' : ''}`}
          style={{ zIndex: 10 + index }}
        >
          <img className="scene-background-image scene-preview" src={`/backgrounds/${layer.name}.svg`} alt="" draggable={false} />
        </div>
      ))}
    </div>
  )
}
