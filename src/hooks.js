import { useEffect, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}=+*^?#01'

// Decoding "scramble" effect: characters resolve left to right
export function useScramble(text, frames = 20) {
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (!text) return setOut(text)
    let frame = 0
    let raf
    const tick = () => {
      frame++
      const p = frame / frames
      setOut(
        text
          .split('')
          .map((ch, i) => (ch === ' ' || i / text.length < p ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      )
      if (frame < frames) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [text, frames])
  return out
}

export function useLondonTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}
