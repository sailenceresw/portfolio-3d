import { profile, sections } from '../data.js'
import { useLondonTime } from '../hooks.js'

export function Monogram() {
  return (
    <svg className="monogram" viewBox="0 0 40 40" aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="9" />
      <text x="20" y="26.5" textAnchor="middle">MB</text>
    </svg>
  )
}

// Framed heads-up display around the 3D room
export default function Hud({ visible, focus, onFocus, soundOn, onSound, on2D }) {
  const time = useLondonTime()
  return (
    <div className={`hud ${visible ? 'show' : ''}`}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

      <button className="brand" onClick={() => onFocus(null)}>
        <Monogram />
        <span>
          <strong>{profile.name}</strong>
          <em>{profile.title}</em>
        </span>
      </button>

      <nav className="menu">
        {sections.map((s, i) => (
          <button key={s.id} className={focus === s.id ? 'active' : ''} onClick={() => onFocus(s.id)}>
            <span>0{i + 1}</span>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="status">
        <p><i /> Open to graduate roles</p>
        <p className="mono">London · {time}</p>
      </div>

      <div className="tools">
        <span id="cam-readout" className="mono readout" />
        <button onClick={onSound} aria-pressed={soundOn}>
          <span className={`eq ${soundOn ? 'on' : ''}`}><i /><i /><i /></span>
          {soundOn ? 'Sound on' : 'Sound off'}
        </button>
        <button onClick={on2D}>2D view</button>
      </div>

      <p className={`hint ${focus ? 'hidden' : ''}`}>Click anything glowing — or use the menu</p>
    </div>
  )
}
