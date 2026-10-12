import { profile, sections } from '../data.js'
import { views } from './Sections.jsx'
import { Monogram } from './Hud.jsx'

// Plain scrolling version of the site: used when WebGL is unavailable,
// when reduced motion is requested, or when the visitor picks "2D view".
export default function Classic({ onSwitch }) {
  return (
    <div className="classic">
      <header className="classic-top">
        <Monogram />
        <nav>
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`}><span>0{i + 1}</span>{s.label}</a>
          ))}
        </nav>
      </header>
      <section className="classic-hero">
        <p className="eyebrow">{profile.title} · {profile.location}</p>
        <h1>{profile.name.split(' ').map((w) => <span key={w}>{w}</span>)}</h1>
        <p className="lead">{profile.tagline}</p>
        {onSwitch && <button className="btn primary" onClick={onSwitch}>Enter the 3D experience →</button>}
      </section>
      {sections.map((s, i) => {
        const View = views[s.id]
        return (
          <section key={s.id} id={s.id} className="classic-section">
            <h2><span>0{i + 1}</span>{s.label}</h2>
            <View />
          </section>
        )
      })}
      <footer className="classic-foot">© {new Date().getFullYear()} {profile.name} · Built with React &amp; Three.js</footer>
    </div>
  )
}
