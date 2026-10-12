import { useEffect, useRef } from 'react'

const fine = window.matchMedia('(pointer: fine)').matches

// Dot + trailing ring. The ring grows and shows a label over 3D hotspots
// (body[data-hover], set by the room) and over buttons/links.
export default function Cursor() {
  const dot = useRef()
  const ring = useRef()
  const label = useRef()

  useEffect(() => {
    if (!fine) return
    document.documentElement.classList.add('custom-cursor')
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const trail = { ...pos }
    let raf

    const move = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const ui = e.target.closest?.('button, a')
      document.body.toggleAttribute('data-hover-ui', !!ui)
    }
    const loop = () => {
      trail.x += (pos.x - trail.x) * 0.18
      trail.y += (pos.y - trail.y) * 0.18
      dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      ring.current.style.transform = `translate(${trail.x}px, ${trail.y}px)`
      const h = document.body.dataset.hover
      label.current.textContent = h ? `open ${h}` : ''
      ring.current.classList.toggle('big', !!h)
      ring.current.classList.toggle('ui', !h && document.body.hasAttribute('data-hover-ui'))
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    loop()
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('custom-cursor')
    }
  }, [])

  if (!fine) return null
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring">
        <span ref={label} />
      </div>
    </>
  )
}
