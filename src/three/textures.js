import * as THREE from 'three'
import { skills } from '../data.js'

const MONO = '"JetBrains Mono", Consolas, "Courier New", monospace'
const SYNE = '"Syne", "Arial Black", sans-serif'

// Canvas texture that can redraw itself once web fonts have loaded
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.userData.redraw = () => {
    ctx.clearRect(0, 0, w, h)
    draw(ctx, w, h)
    tex.needsUpdate = true
  }
  tex.userData.redraw()
  return tex
}

// ---------------------------------------------------------------- terminal
const SCRIPT = [
  { cmd: 'whoami' },
  { out: 'manish_bishwokarma · MSc AI Technology @ Northumbria London', color: '#e8ecff' },
  { cmd: 'ls ~/projects' },
  { out: 'khabardar/  feeling_frame/  agent_maya/  pizza_and_co/  three_amigos/', color: '#ff8ae2' },
  { cmd: 'head -1 khabardar/README.md' },
  { out: 'Anonymous anti-corruption reporting, anchored on-chain.', color: '#9aa3c7' },
  { cmd: 'flutter run feeling_frame --ai-captions' },
  { out: '✓ speech → captions · stabilised · chroma-key ready', color: '#7dffb2' },
  { cmd: 'python -m maya --mode simulation' },
  { out: '[L1] feed connected · BTCUSDT 1m', color: '#ffd36b' },
  { out: '[L2] CVD divergence + absorption at VAL', color: '#ffd36b' },
  { out: '[L4] risk ok · size 0.5% · stop placed', color: '#ffd36b' },
  { out: '[L5] simulated fill · no real orders', color: '#7dffb2' },
  { cmd: 'echo "click the screen to open my projects"' },
  { out: 'click the screen to open my projects', color: '#7df9ff' },
]
const CPS = 26 // typing speed, characters per second

export function createTerminal() {
  let t = 0.6
  const lines = SCRIPT.map((l) => {
    const text = l.cmd ?? l.out
    const start = t
    t += l.cmd ? text.length / CPS + 0.45 : 0.14
    return { ...l, text, start }
  })
  const total = t + 4

  let time = 0
  const tex = canvasTexture(1600, 606, (ctx, w, h) => {
    const tt = time % total
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#0b1226')
    g.addColorStop(1, '#05070f')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#121a33'
    ctx.fillRect(0, 0, w, 50)
    ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(90 + i * 30, 25, 9, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.font = `500 22px ${MONO}`
    ctx.fillStyle = '#7a84ab'
    ctx.textAlign = 'center'
    ctx.fillText('zsh — manish@portfolio', w / 2, 33)
    ctx.textAlign = 'left'

    ctx.font = `500 30px ${MONO}`
    const shown = lines.filter((l) => l.start <= tt).slice(-11)
    let lastX = 90
    let lastY = 112
    shown.forEach((l, i) => {
      const y = 112 + i * 44
      let x = 90
      if (l.cmd) {
        ctx.fillStyle = '#7df9ff'
        ctx.fillText('❯', x, y)
        x += 40
        const typed = l.text.slice(0, Math.floor((tt - l.start) * CPS))
        ctx.fillStyle = '#ffffff'
        ctx.fillText(typed, x, y)
        x += ctx.measureText(typed).width
      } else {
        ctx.fillStyle = l.color
        ctx.fillText(l.text, x, y)
        x += ctx.measureText(l.text).width
      }
      lastX = x
      lastY = y
    })
    if (Math.floor(tt * 2) % 2 === 0) {
      ctx.fillStyle = '#7df9ff'
      ctx.fillRect(lastX + 8, lastY - 24, 16, 30)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.025)'
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1)
  })
  // the screen is the inside of a curved cylinder: mirror horizontally
  tex.wrapS = THREE.RepeatWrapping
  tex.repeat.x = -1

  let lastTick = -1
  return {
    texture: tex,
    update(elapsed) {
      const tick = Math.floor(elapsed * 14)
      if (tick === lastTick) return
      lastTick = tick
      time = elapsed
      tex.userData.redraw()
    },
  }
}

// ------------------------------------------------------------- skills board
export function skillsTexture() {
  return canvasTexture(1100, 650, (ctx) => {
    ctx.shadowColor = '#7df9ff'
    ctx.shadowBlur = 18
    ctx.fillStyle = '#7df9ff'
    ctx.font = `800 62px ${SYNE}`
    ctx.fillText('SKILLS.SYS', 44, 86)
    ctx.shadowBlur = 0
    ctx.font = `500 20px ${MONO}`
    ctx.fillStyle = '#6f7aa3'
    ctx.fillText('// stack loaded — click to open', 48, 120)

    const heads = ['#ff5bd1', '#c6ff4a', '#7df9ff', '#a98bff', '#ffb347', '#ffffff']
    skills.forEach((s, i) => {
      const x = 44 + (i % 3) * 350
      const y = 175 + Math.floor(i / 3) * 235
      ctx.shadowColor = heads[i]
      ctx.shadowBlur = 12
      ctx.fillStyle = heads[i]
      ctx.font = `700 34px ${SYNE}`
      ctx.fillText(s.group, x, y)
      ctx.shadowBlur = 0
      ctx.fillStyle = '#dfe6ff'
      ctx.font = `400 23px ${MONO}`
      s.items.slice(0, 4).forEach((it, j) => ctx.fillText('› ' + it, x + 4, y + 44 + j * 36))
    })
  })
}

// --------------------------------------------------------------- neon sign
export function neonTexture() {
  return canvasTexture(1024, 384, (ctx, w, h) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 18
    ctx.fillStyle = '#ffffff'
    ctx.font = 'italic 700 150px "Brush Script MT", "Segoe Script", cursive'
    ctx.fillText("let's talk", w / 2, h / 2 - 30)
    ctx.font = `600 42px ${MONO}`
    ctx.fillText('contact →', w / 2, h / 2 + 105)
  })
}

// ------------------------------------------------------------------- phone
export function phoneTexture() {
  return canvasTexture(256, 512, (ctx, w) => {
    const g = ctx.createLinearGradient(0, 0, w, 512)
    g.addColorStop(0, '#2a1b5c')
    g.addColorStop(1, '#0d2a4a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, 512)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = `700 60px ${SYNE}`
    ctx.fillText('09:41', w / 2, 140)
    ctx.font = `500 18px ${MONO}`
    ctx.fillStyle = '#7df9ff'
    ctx.fillText('1 new message', w / 2, 190)
  })
}

// -------------------------------------------------------- London skyline
export function skylineTexture() {
  return canvasTexture(1200, 760, (ctx, w, h) => {
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#06071c')
    sky.addColorStop(0.55, '#1f1442')
    sky.addColorStop(0.82, '#5a2457')
    sky.addColorStop(1, '#0a0a18')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.6})`
      ctx.fillRect(rnd() * w, rnd() * h * 0.55, 1.6, 1.6)
    }
    ctx.shadowColor = '#ffe9c4'
    ctx.shadowBlur = 40
    ctx.fillStyle = '#fff1d8'
    ctx.beginPath()
    ctx.arc(980, 140, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    const ground = 640
    // distant blocks
    ctx.fillStyle = '#1a1531'
    for (let x = 0; x < w; x += 40 + rnd() * 30) ctx.fillRect(x, ground - 60 - rnd() * 140, 46, 400)

    // London Eye
    ctx.strokeStyle = '#c86bff'
    ctx.shadowColor = '#c86bff'
    ctx.shadowBlur = 14
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(260, 470, 150, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 1.5
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(260, 470)
      ctx.lineTo(260 + Math.cos(a) * 150, 470 + Math.sin(a) * 150)
      ctx.stroke()
    }
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(200, ground)
    ctx.lineTo(260, 470)
    ctx.lineTo(320, ground)
    ctx.stroke()
    ctx.shadowBlur = 0

    // The Shard
    ctx.fillStyle = '#100d22'
    ctx.beginPath()
    ctx.moveTo(760, 170)
    ctx.lineTo(700, ground)
    ctx.lineTo(830, ground)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(125,249,255,0.35)'
    ctx.lineWidth = 1
    for (let y = 230; y < ground; y += 18) {
      const half = ((y - 170) / (ground - 170)) * 65
      ctx.beginPath()
      ctx.moveTo(762 - half + 4, y)
      ctx.lineTo(762 + half - 4, y)
      ctx.stroke()
    }

    // Elizabeth Tower (Big Ben)
    ctx.fillStyle = '#100d22'
    ctx.fillRect(500, 330, 54, ground - 330)
    ctx.beginPath()
    ctx.moveTo(496, 330)
    ctx.lineTo(527, 240)
    ctx.lineTo(558, 330)
    ctx.closePath()
    ctx.fill()
    ctx.shadowColor = '#ffd98a'
    ctx.shadowBlur = 20
    ctx.fillStyle = '#ffd98a'
    ctx.beginPath()
    ctx.arc(527, 368, 17, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // near buildings with lit windows
    for (let x = -20; x < w; x += 70 + rnd() * 50) {
      const bh = 70 + rnd() * 150
      const bw = 60 + rnd() * 50
      ctx.fillStyle = '#08070f'
      ctx.fillRect(x, ground - bh, bw, bh + 200)
      for (let wy = ground - bh + 12; wy < ground - 6; wy += 16) {
        for (let wx = x + 8; wx < x + bw - 8; wx += 14) {
          if (rnd() > 0.62) {
            ctx.fillStyle = rnd() > 0.8 ? '#7df9ff' : '#ffcf7a'
            ctx.fillRect(wx, wy, 6, 8)
          }
        }
      }
    }
    // river with reflections
    ctx.fillStyle = '#060814'
    ctx.fillRect(0, ground, w, h - ground)
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,207,122,0.5)' : 'rgba(200,107,255,0.45)'
      ctx.fillRect(rnd() * w, ground + 10 + rnd() * (h - ground - 20), 10 + rnd() * 40, 2)
    }
  })
}

// ------------------------------------------------------------ certificate
export function certificateTexture() {
  return canvasTexture(700, 500, (ctx, w, h) => {
    ctx.fillStyle = '#f4efe2'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#b08d3c'
    ctx.lineWidth = 6
    ctx.strokeRect(22, 22, w - 44, h - 44)
    ctx.lineWidth = 1.5
    ctx.strokeRect(36, 36, w - 72, h - 72)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#3b2f1a'
    ctx.font = '600 26px Georgia, serif'
    ctx.fillText('TEESSIDE UNIVERSITY', w / 2, 110)
    ctx.font = 'italic 24px Georgia, serif'
    ctx.fillText('Bachelor of Science (Honours)', w / 2, 180)
    ctx.font = '700 42px Georgia, serif'
    ctx.fillText('Computer Science', w / 2, 240)
    ctx.font = 'italic 24px Georgia, serif'
    ctx.fillText('awarded to', w / 2, 300)
    ctx.font = '600 34px Georgia, serif'
    ctx.fillText('Manish Bishwokarma', w / 2, 350)
    ctx.font = '22px Georgia, serif'
    ctx.fillText('2024', w / 2, 420)
  })
}

// --------------------------------------------------------------------- rug
export function rugTexture() {
  return canvasTexture(512, 512, (ctx, w) => {
    const c = w / 2
    const rings = ['#2a1f45', '#3b2a5e', '#2a1f45', '#5b2bd6', '#2a1f45', '#3b2a5e', '#1f1833']
    rings.forEach((col, i) => {
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.arc(c, c, c - i * 34, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.strokeStyle = 'rgba(125,249,255,0.35)'
    ctx.lineWidth = 2
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(c + Math.cos(a) * 60, c + Math.sin(a) * 60)
      ctx.lineTo(c + Math.cos(a) * 120, c + Math.sin(a) * 120)
      ctx.stroke()
    }
  })
}
