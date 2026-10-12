// Tiny synthesised sound kit (Web Audio, no audio files):
// an ambient drone, a hover blip and a transition whoosh.

let ctx = null
let master = null
let ambientOn = false
let enabled = false

function ensure() {
  if (ctx) return
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
}

function startAmbient() {
  if (ambientOn || !ctx) return
  ambientOn = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 420
  filter.Q.value = 2
  const g = ctx.createGain()
  g.gain.value = 0.05
  ;[55, 55.3, 82.4].forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = i === 2 ? 'sine' : 'sawtooth'
    o.frequency.value = f
    o.connect(filter)
    o.start()
  })
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.06
  const depth = ctx.createGain()
  depth.gain.value = 180
  lfo.connect(depth)
  depth.connect(filter.frequency)
  lfo.start()
  filter.connect(g)
  g.connect(master)
}

export const sound = {
  get enabled() {
    return enabled
  },

  setEnabled(on) {
    enabled = on
    if (on) {
      ensure()
      if (!ctx) return
      ctx.resume()
      startAmbient()
    }
    if (master) master.gain.setTargetAtTime(on ? 0.6 : 0, ctx.currentTime, 0.4)
  },

  blip() {
    if (!enabled || !ctx) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(1400, t)
    o.frequency.exponentialRampToValueAtTime(2200, t + 0.05)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
    o.connect(g)
    g.connect(master)
    o.start(t)
    o.stop(t + 0.1)
  },

  whoosh() {
    if (!enabled || !ctx) return
    const t = ctx.currentTime
    const len = Math.floor(ctx.sampleRate * 0.6)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.2
    bp.frequency.setValueAtTime(300, t)
    bp.frequency.exponentialRampToValueAtTime(2600, t + 0.45)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.08)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    src.connect(bp)
    bp.connect(g)
    g.connect(master)
    src.start(t)
  },
}
