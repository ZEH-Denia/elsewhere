export type CallSound = 'connect' | 'guitar'

const circle = 2 * Math.PI
const guitarHarmonics = [0.52, 0.32, 0.19, 0.13, 0.1, 0.07, 0.05, 0.03]

function connectionSample(time: number) {
  const secondTone = time >= 0.087
  const elapsed = secondTone ? time - 0.087 : time
  const pitch = secondTone ? 698.46 : 523.25
  const envelope = Math.min(1, elapsed / 0.008) * Math.exp(-elapsed * 26)
  const gap = !secondTone && elapsed > 0.075
  return gap ? 0 : 0.12 * envelope * (
    Math.sin(circle * pitch * elapsed) + 0.16 * Math.sin(circle * pitch * 2 * elapsed)
  )
}

// An open D string. Higher harmonics decay fastest, so the attack is sharper than the tail.
function guitarSample(time: number) {
  const vibration = guitarHarmonics.reduce((sample, amplitude, index) => {
    const harmonic = index + 1
    const frequency = 146.83 * harmonic * (1 + 0.00009 * harmonic ** 2)
    const decay = Math.exp(-time * (4.8 + 1.1 * harmonic))
    return sample + amplitude * decay * Math.sin(circle * frequency * time + index * 0.63)
  }, 0)
  const attack = Math.min(1, time / 0.004)
  const release = Math.min(1, (0.82 - time) / 0.06)
  return 0.24 * vibration * attack * release
}

export function createCallSound(context: AudioContext, sound: CallSound) {
  const duration = sound === 'connect' ? 0.25 : 0.82
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
  const samples = buffer.getChannelData(0)
  const sample = sound === 'connect' ? connectionSample : guitarSample
  for (let i = 0; i < samples.length; i++) samples[i] = sample(i / context.sampleRate)

  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  return source
}
