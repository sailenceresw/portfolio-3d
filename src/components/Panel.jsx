import { useEffect, useState } from 'react'
import { sections } from '../data.js'
import { views } from './Sections.jsx'
import { useScramble } from '../hooks.js'

// Slide-in panel shown once the camera has flown to an object.
// Keeps the last section rendered while sliding out.
export default function Panel({ section, onClose }) {
  const [shown, setShown] = useState(section)
  useEffect(() => {
    if (section) setShown(section)
  }, [section])

  const i = sections.findIndex((s) => s.id === shown)
  const meta = sections[i]
  const title = useScramble(section ? meta?.label : '')
  const View = shown && views[shown]

  return (
    <aside className={`panel ${section ? 'open' : ''}`} aria-hidden={!section}>
      {View && (
        <>
          <header className="panel-head">
            <span className="panel-num">0{i + 1}</span>
            <div>
              <p className="panel-kicker">// opened from {meta.object}</p>
              <h2>{title || meta.label}</h2>
            </div>
            <button className="close" onClick={onClose} aria-label="Back to the room">
              <span>esc</span> ✕
            </button>
          </header>
          <div className="panel-body" key={shown}>
            <View />
          </div>
        </>
      )}
    </aside>
  )
}
