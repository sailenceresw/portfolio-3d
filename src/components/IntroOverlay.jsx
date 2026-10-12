import { useEffect, useRef, useState } from 'react'
import { intro, skipIntro, INTRO_END } from '../intro.js'

const CAPS = [
  { from: 0.8, to: 4.0, eyebrow: 'hello world — I am', sub: 'AI & Software Developer · London' },
  { from: 4.3, to: 6.6, eyebrow: 'currently studying', title: 'MSc AI Technology', sub: 'Northumbria University London' },
  { from: 6.9, to: 10.2, eyebrow: 'loading', sub: 'assembling my workspace…' },
]

// Film-style captions, timecode and skip control over the particle intro
export default function IntroOverlay() {
  const [cap, setCap] = useState(-1)
  const bar = useRef()
  const tc = useRef()

  useEffect(() => {
    let raf
    const loop = () => {
      const t = intro.t
      setCap(CAPS.findIndex((c) => t >= c.from && t < c.to))
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, t / INTRO_END)})`
      if (tc.current) {
        const f = Math.floor((t % 1) * 24)
        tc.current.textContent = `00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f).padStart(2, '0')}`
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="intro-ui">
      <div className="intro-rec">
        <i /> REC <span ref={tc} />
      </div>
      {CAPS.map((c, i) => (
        <div key={i} className={`intro-cap ${cap === i ? 'on' : ''}`}>
          <p className="eyebrow">{c.eyebrow}</p>
          {c.title && <h2>{c.title}</h2>}
          <p className="intro-sub">{c.sub}</p>
        </div>
      ))}
      <button className="intro-skip" onClick={skipIntro}>
        Skip intro <span>esc</span>
      </button>
      <div className="intro-bar">
        <i ref={bar} />
      </div>
    </div>
  )
}
