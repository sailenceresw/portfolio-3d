import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import Panel from './components/Panel.jsx'
import Classic from './components/Classic.jsx'
import Boot from './components/Boot.jsx'
import IntroOverlay from './components/IntroOverlay.jsx'
import Hud from './components/Hud.jsx'
import Cursor from './components/Cursor.jsx'
import { intro, skipIntro } from './intro.js'
import { sound } from './sound.js'

const Experience = lazy(() => import('./three/Experience.jsx'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const webgl = hasWebGL()
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [mode, setMode] = useState(webgl && !reducedMotion ? '3d' : '2d')
  const [phase, setPhase] = useState(intro.done ? 'room' : 'boot') // boot → intro → room
  const [loaded, setLoaded] = useState(false)
  const [focus, setFocusState] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const setFocus = useCallback((id) => {
    if (id) sound.whoosh()
    else sound.blip()
    setFocusState(id)
  }, [])

  const start = useCallback((withSound) => {
    sound.setEnabled(withSound)
    setSoundOn(withSound)
    sound.whoosh()
    intro.started = true
    setPhase('intro')
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (phase === 'intro') skipIntro()
      else setFocus(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, setFocus])

  // Let the camera start its flight before the panel slides in
  useEffect(() => {
    if (!focus) return setPanelOpen(false)
    const t = setTimeout(() => setPanelOpen(true), 600)
    return () => clearTimeout(t)
  }, [focus])

  const toggleSound = () => {
    sound.setEnabled(!soundOn)
    setSoundOn(!soundOn)
  }

  const to2D = () => {
    setFocusState(null)
    setMode('2d')
  }

  if (mode === '2d') {
    return (
      <Classic
        onSwitch={
          webgl
            ? () => {
                setPhase(intro.done ? 'room' : 'boot')
                setMode('3d')
              }
            : null
        }
      />
    )
  }

  const ready = phase === 'room'

  return (
    <div className={`app phase-${phase}`}>
      <Suspense fallback={null}>
        <Experience
          focus={focus}
          onSelect={setFocus}
          ready={ready}
          onLoaded={() => setLoaded(true)}
          onIntroDone={() => setPhase('room')}
        />
      </Suspense>

      <Boot visible={phase === 'boot'} loaded={loaded} onStart={start} onTwoD={to2D} />
      {phase === 'intro' && <IntroOverlay />}
      <Hud visible={ready} focus={focus} onFocus={setFocus} soundOn={soundOn} onSound={toggleSound} on2D={to2D} />
      <Panel section={panelOpen ? focus : null} onClose={() => setFocus(null)} />
      <Cursor />
    </div>
  )
}
