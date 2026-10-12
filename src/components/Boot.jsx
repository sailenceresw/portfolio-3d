import { useEffect, useState } from 'react'
import { profile } from '../data.js'

const LINES = [
  'initialising manish.exe',
  'loading msc_ai_technology · northumbria_london',
  'compiling particle shaders',
  'sampling room geometry',
  'calibrating neon',
]

// Terminal-style loading screen with the enter choice
export default function Boot({ visible, loaded, onStart, onTwoD }) {
  const [n, setN] = useState(0)
  const [gone, setGone] = useState(!visible)

  useEffect(() => {
    if (n >= LINES.length) return
    const t = setTimeout(() => setN(n + 1), 240 + Math.random() * 220)
    return () => clearTimeout(t)
  }, [n])

  useEffect(() => {
    if (visible) return
    const t = setTimeout(() => setGone(true), 1000)
    return () => clearTimeout(t)
  }, [visible])

  const done = n >= LINES.length && loaded

  useEffect(() => {
    if (!done || !visible) return
    const onKey = (e) => e.key === 'Enter' && onStart(true)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, visible, onStart])

  if (gone) return null
  const pct = Math.round((n / LINES.length) * (loaded ? 100 : 92))

  return (
    <div className={`boot ${visible ? '' : 'out'}`}>
      <div className="boot-grid" aria-hidden />
      <div className="boot-inner">
        <p className="boot-tag">Portfolio — {new Date().getFullYear()} · v2.0</p>
        <h1 className="boot-name">
          {profile.name.split(' ').map((w) => (
            <span key={w}>{w}</span>
          ))}
        </h1>
        <ul className="boot-log">
          {LINES.slice(0, n).map((l) => (
            <li key={l}>
              <b>[ ok ]</b> {l}
            </li>
          ))}
        </ul>
        <div className="boot-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="boot-row">
          <span className="boot-pct">{String(pct).padStart(3, '0')}%</span>
          <div className={`boot-actions ${done ? 'show' : ''}`}>
            <button className="btn primary" onClick={() => onStart(true)} disabled={!done}>
              Enter with sound
            </button>
            <button className="btn" onClick={() => onStart(false)} disabled={!done}>
              Enter silently
            </button>
          </div>
        </div>
        <button className="boot-2d" onClick={onTwoD}>
          Prefer a simple page? View the 2D version →
        </button>
      </div>
    </div>
  )
}
