import { profile, about, education, languages, projects, skills, experience } from '../data.js'

const pad = (n) => String(n).padStart(2, '0')

export function Projects() {
  return (
    <div className="projects">
      {projects.map((p, i) => (
        <article key={p.name} className={`proj ${p.featured ? 'is-featured' : ''}`} style={{ '--i': i }}>
          <span className="proj-idx">{pad(i + 1)}</span>
          <div className="proj-body">
            <div className="proj-meta">
              <span>{p.kind}</span>
              <span>{p.year}</span>
            </div>
            <h3>
              {p.name}
              {p.featured && <em>featured</em>}
            </h3>
            <p>{p.summary}</p>
            <ul className="tags">
              {p.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
            {p.repo && (
              <a className="arrow-link" href={p.repo} target="_blank" rel="noreferrer">
                Source code <span>↗</span>
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

export function About() {
  const [lead, ...rest] = about
  return (
    <div className="stack">
      <p className="statement">{lead}</p>
      {rest.map((para) => <p key={para}>{para}</p>)}
      <h3 className="sub"><span>//</span> Education</h3>
      <ol className="timeline">
        {education.map((e) => (
          <li key={e.degree}>
            <span className="period">{e.period}</span>
            <strong>{e.degree}</strong>
            <span className="muted">{e.school}</span>
            <p>{e.detail}</p>
          </li>
        ))}
      </ol>
      <h3 className="sub"><span>//</span> Languages</h3>
      <ul className="tags">{languages.map((l) => <li key={l}>{l}</li>)}</ul>
    </div>
  )
}

export function Skills() {
  return (
    <div className="stack">
      <div className="skill-grid">
        {skills.map((s, i) => (
          <div key={s.group} className="skill" style={{ '--i': i }}>
            <h4><span>{pad(i + 1)}</span>{s.group}</h4>
            <ul className="tags">{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
          </div>
        ))}
      </div>
      <h3 className="sub"><span>//</span> Experience</h3>
      <ol className="timeline">
        {experience.map((x) => (
          <li key={x.role + x.org}>
            <span className="period">{x.period}</span>
            <strong>{x.role}</strong>
            <span className="muted">{x.org}</span>
            <ul className="points">{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Contact() {
  const links = [
    { k: 'Email', v: profile.email, href: `mailto:${profile.email}` },
    profile.phone && { k: 'Phone', v: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
    profile.linkedin && { k: 'LinkedIn', v: 'manish-bishwokarma', href: profile.linkedin, ext: true },
    { k: 'GitHub', v: 'sailenceresw', href: profile.github, ext: true },
    profile.cv && { k: 'CV', v: 'Download PDF', href: profile.cv, download: true },
  ].filter(Boolean)

  return (
    <div className="stack">
      <p className="statement big">Let’s build something intelligent.</p>
      <p>I’m open to graduate and junior roles in AI, software engineering and FinTech, and to collaborations. Email is the fastest way to reach me.</p>
      <ul className="contact-rows">
        {links.map((l) => (
          <li key={l.k}>
            <a href={l.href} target={l.ext ? '_blank' : undefined} rel={l.ext ? 'noreferrer' : undefined} download={l.download}>
              <span className="k">{l.k}</span>
              <span className="v">{l.v}</span>
              <span className="arrow">↗</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="muted mono small">Based in {profile.location}.</p>
    </div>
  )
}

export const views = { projects: Projects, about: About, skills: Skills, contact: Contact }
