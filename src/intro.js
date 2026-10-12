// Shared, mutable intro timeline. Read every frame by the 3D scene and the
// overlay, so it lives outside React state.
//
//   0.4 – 2.6   cloud  → name
//   4.0 – 5.6   name   → brain
//   6.6 – 8.8   brain  → room surfaces (camera swoops to the room)
//   8.2 – 10.4  room dissolves in from the floor up, particles fade out
export const INTRO_END = 10.6

export const intro = { started: false, t: 0, done: false }

// lets automated visual tests jump through the timeline (dev server only)
if (import.meta.env.DEV) window.__intro = intro

// Chromatic-aberration "glitch" pulse, 0..1, decays in the scene
export const fx = { pulse: 0 }

export function skipIntro() {
  if (intro.started && !intro.done && intro.t < 7.4) intro.t = 7.4
}

export const ramp = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
