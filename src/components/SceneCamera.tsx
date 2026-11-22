import { useEffect, useRef } from 'react'
import type { SceneName } from './SceneBackground'

type Point = readonly [x: number, y: number]
type Region = readonly [x: number, y: number, radiusX: number, radiusY: number]
type CameraProfile = {
  focus: Point
  track: Point
  near: readonly Region[]
}

// Coordinates follow the original WebP, independent of the viewport crop.
export const cameraProfiles: Partial<Record<SceneName, CameraProfile>> = {
  connection: {
    focus: [0.51, 0.53],
    track: [0.015, -0.004],
    near: [[0.20, 0.34, 0.23, 0.38], [0.49, 0.55, 0.13, 0.15], [0.79, 0.46, 0.16, 0.34]],
  },
  doctor: {
    focus: [0.71, 0.45],
    track: [-0.023, 0.006],
    near: [[0.70, 0.40, 0.15, 0.40], [0.83, 0.55, 0.16, 0.31], [0.10, 0.48, 0.14, 0.46]],
  },
  teacher: {
    focus: [0.69, 0.47],
    track: [-0.020, 0.003],
    near: [[0.78, 0.60, 0.27, 0.34], [0.21, 0.62, 0.25, 0.33]],
  },
  designer: {
    focus: [0.74, 0.47],
    track: [-0.021, -0.005],
    near: [[0.73, 0.50, 0.32, 0.36], [0.47, 0.64, 0.17, 0.34], [0.80, 0.23, 0.16, 0.26]],
  },
  founder: {
    focus: [0.63, 0.47],
    track: [0.021, 0.005],
    near: [[0.78, 0.54, 0.23, 0.34], [0.23, 0.49, 0.23, 0.34], [0.10, 0.78, 0.16, 0.20]],
  },
  finale: {
    focus: [0.74, 0.47],
    track: [-0.018, -0.005],
    near: [[0.73, 0.48, 0.17, 0.31], [0.83, 0.45, 0.13, 0.22]],
  },
}

const duration = 680
const vertexSource = `
  attribute vec2 position;
  varying vec2 viewport;
  void main() {
    viewport = (position * vec2(1.0, -1.0) + 1.0) * 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  uniform sampler2D art;
  uniform sampler2D depthMap;
  uniform vec2 crop;
  uniform vec2 focus;
  uniform vec2 track;
  uniform float remaining;
  varying vec2 viewport;
  void main() {
    vec2 uv = viewport * crop + (1.0 - crop) * vec2(0.5, 0.46);
    float depth = texture2D(depthMap, uv).r;
    vec2 border = min(uv, 1.0 - uv);
    float edge = smoothstep(0.0, 0.12, min(border.x, border.y));
    vec2 zoom = (uv - focus) * (0.026 + depth * 0.082);
    vec2 parallax = track * (0.24 + depth * 0.94);
    vec2 samplePoint = uv + (zoom - parallax) * remaining * edge;
    gl_FragColor = texture2D(art, samplePoint);
  }
`

function depthCanvas(profile: CameraProfile) {
  const map = document.createElement('canvas')
  map.width = 256
  map.height = 144
  const context = map.getContext('2d')
  if (!context) return null
  context.fillStyle = '#222'
  context.fillRect(0, 0, map.width, map.height)
  for (const [x, y, rx, ry] of profile.near) {
    context.save()
    context.translate(x * map.width, y * map.height)
    context.scale(rx * map.width, ry * map.height)
    const light = context.createRadialGradient(0, 0, 0, 0, 0, 1)
    light.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
    light.addColorStop(0.44, 'rgba(255, 255, 255, 0.76)')
    light.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = light
    context.fillRect(-1, -1, 2, 2)
    context.restore()
  }
  return map
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

function createPass(canvas: HTMLCanvasElement, image: HTMLImageElement, profile: CameraProfile) {
  const map = depthCanvas(profile)
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false })
  if (!map || !gl) return null

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  const quad = gl.createBuffer()
  const art = gl.createTexture()
  const depth = gl.createTexture()
  const dispose = () => {
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    gl.deleteProgram(program)
    gl.deleteBuffer(quad)
    gl.deleteTexture(art)
    gl.deleteTexture(depth)
  }
  if (!vertex || !fragment || !program || !quad || !art || !depth) {
    dispose()
    return null
  }

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose()
    return null
  }

  try {
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.uniform2f(gl.getUniformLocation(program, 'focus'), ...profile.focus)
    gl.uniform2f(gl.getUniformLocation(program, 'track'), ...profile.track)
    const sources = [[art, 'art', image], [depth, 'depthMap', map]] as const
    sources.forEach(([texture, name, source], unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
      gl.uniform1i(gl.getUniformLocation(program, name), unit)
    })
    if (gl.getError() !== gl.NO_ERROR) {
      dispose()
      return null
    }
  } catch {
    dispose()
    return null
  }

  const crop = gl.getUniformLocation(program, 'crop')
  const remaining = gl.getUniformLocation(program, 'remaining')
  return {
    draw(rest: number) {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0 || gl.isContextLost()) return false
      const scale = Math.min(window.devicePixelRatio || 1, 1600 / width)
      const renderWidth = Math.max(1, Math.round(width * scale))
      const renderHeight = Math.max(1, Math.round(height * scale))
      if (canvas.width !== renderWidth) canvas.width = renderWidth
      if (canvas.height !== renderHeight) canvas.height = renderHeight
      gl.viewport(0, 0, renderWidth, renderHeight)
      const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      gl.uniform2f(crop, width / (image.naturalWidth * cover), height / (image.naturalHeight * cover))
      gl.uniform1f(remaining, rest)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      return true
    },
    dispose,
  }
}

export function SceneCamera({ image, profile }: { image: HTMLImageElement; profile: CameraProfile }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const motion = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)')
    if (!canvas || !motion.matches || document.hidden) return
    const pass = createPass(canvas, image, profile)
    if (!pass) return

    let frame = 0
    let start: number | null = null
    let stopped = false
    const stop = () => {
      if (stopped) return
      stopped = true
      window.cancelAnimationFrame(frame)
      delete canvas.dataset.playing
      pass.dispose()
    }
    const draw = (now: number) => {
      start ??= now
      const progress = Math.min(1, (now - start) / duration)
      // The last frame matches the underlying cover image exactly.
      const rest = 1 - (progress * progress * (3 - 2 * progress))
      if (progress === 1 || !pass.draw(rest)) {
        stop()
        return
      }
      if (!canvas.dataset.playing) canvas.dataset.playing = 'true'
      frame = window.requestAnimationFrame(draw)
    }
    const visibilityChanged = () => {
      if (document.hidden) stop()
    }
    motion.addEventListener('change', stop)
    document.addEventListener('visibilitychange', visibilityChanged)
    canvas.addEventListener('webglcontextlost', stop)
    frame = window.requestAnimationFrame(draw)
    return () => {
      stop()
      motion.removeEventListener('change', stop)
      document.removeEventListener('visibilitychange', visibilityChanged)
      canvas.removeEventListener('webglcontextlost', stop)
    }
  }, [image, profile])

  return <canvas ref={ref} className="scene-camera" />
}
