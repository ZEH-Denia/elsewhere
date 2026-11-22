import { useEffect, useRef, useState } from 'react'
import { SceneCamera, cameraProfiles } from './SceneCamera'

const sceneNames = [
  'home',
  'home-hero',
  'intro',
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
  'hub',
  'letter',
  'finale',
] as const

export type SceneName = (typeof sceneNames)[number]

type SceneLayer = { key: number; name: SceneName; src: string | null }

const imageCache = new Map<string, HTMLImageElement>()

const svgFallbacks: Partial<Record<SceneName, string>> = {
  'home-hero': 'home',
  intro: 'home',
  hub: 'connection',
  letter: 'home',
  finale: 'connection',
}

const scenePreloads: Partial<Record<SceneName, readonly SceneName[]>> = {
  home: ['intro'],
  'home-hero': ['intro'],
  intro: ['incoming'],
  incoming: ['connection'],
  question: ['first-choice', 'regret', 'cherish'],
  'first-choice': ['regret', 'cherish'],
  closing: ['second-choice', 'make-space', 'reach-out'],
  'second-choice': ['make-space', 'reach-out'],
  hub: ['doctor', 'teacher', 'designer', 'founder'],
}

function sceneImageUrl(name: SceneName) {
  const extension = name === 'home' ? 'svg' : 'webp'
  return `/backgrounds/${name}.${extension}`
}

function getSceneImage(src: string) {
  let image = imageCache.get(src)
  if (!image) {
    image = new Image()
    image.src = src
    imageCache.set(src, image)
  }
  return image
}

async function decodes(src: string) {
  const image = getSceneImage(src)
  try {
    await image.decode()
    if (image.naturalWidth > 0) return true
  } catch {
    // A requested image can fail to load or decode.
  }
  if (imageCache.get(src) === image) imageCache.delete(src)
  return false
}

async function loadScene(name: SceneName): Promise<string | null> {
  const primary = sceneImageUrl(name)
  if (await decodes(primary)) return primary
  if (name === 'home') return null
  const fallback = `/backgrounds/${svgFallbacks[name] ?? name}.svg`
  return await decodes(fallback) ? fallback : null
}

function useFadeLayers(target: SceneName | null) {
  const [layers, setLayers] = useState<SceneLayer[]>([])
  const layersRef = useRef(layers)
  const keyRef = useRef(0)

  useEffect(() => {
    layersRef.current = layers
  }, [layers])

  useEffect(() => {
    if (!target) {
      const timer = window.setTimeout(() => setLayers((current) => (current.length ? [] : current)), 260)
      return () => window.clearTimeout(timer)
    }

    const top = layersRef.current[layersRef.current.length - 1]
    if (top?.name === target && top.src) return

    const key = top?.name === target ? top.key : ++keyRef.current
    if (top?.key !== key) {
      setLayers((current) => [...current.filter((layer) => layer.src), { key, name: target, src: null }])
    }
    let cancelled = false
    void loadScene(target).then((src) => {
      if (cancelled) return
      setLayers((current) => src
        ? current.map((layer) => layer.key === key ? { ...layer, src } : layer)
        : current.filter((layer) => layer.key !== key))
    })
    return () => {
      cancelled = true
    }
  }, [target])

  useEffect(() => {
    const top = layers[layers.length - 1]
    if (!top?.src || layers.length === 1) return
    const timer = window.setTimeout(() => {
      setLayers((current) => current[current.length - 1]?.key === top.key ? [top] : current)
    }, 320)
    return () => window.clearTimeout(timer)
  }, [layers])

  return layers
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
  const currentLayer = sceneLayers[sceneLayers.length - 1]

  useEffect(() => {
    for (const name of scenePreloads[scene] ?? []) getSceneImage(sceneImageUrl(name))
  }, [scene])

  return (
    <div
      className={`scene-background${activePreview || previewTone ? ' is-previewing' : ''}`}
      data-scene={scene}
      data-art-ready={currentLayer?.src === sceneImageUrl(scene)}
      data-preview-tone={previewTone}
      aria-hidden="true"
    >
      {sceneLayers.map((layer, index) => {
        const isLatest = index === sceneLayers.length - 1
        const profile = isLatest && layer.name === scene && !activePreview && !previewTone
          ? cameraProfiles[scene]
          : undefined
        const cameraImage = profile && layer.src === sceneImageUrl(scene)
          ? imageCache.get(layer.src)
          : undefined
        return (
          <div
            key={layer.key}
            className={`scene-layer${layer.src ? ' is-visible' : ''}`}
            style={{ zIndex: index + 1 }}
          >
            {layer.src && <img
              className={`scene-background-image ${isLatest ? 'scene-current' : 'scene-previous'}`}
              src={layer.src}
              alt=""
              draggable={false}
            />}
            {profile && cameraImage && <SceneCamera image={cameraImage} profile={profile} />}
          </div>
        )
      })}
      {previewLayers.map((layer, index) => (
        <div
          key={`preview-${layer.key}`}
          className={`scene-layer${activePreview && layer.src ? ' is-visible' : ''}`}
          style={{ zIndex: 10 + index }}
        >
          {layer.src && <img className="scene-background-image scene-preview" src={layer.src} alt="" draggable={false} />}
        </div>
      ))}
    </div>
  )
}
