# Manish Bishwokarma: 3D Portfolio (v2)

A cinematic portfolio built with React, Three.js (React Three Fiber) and custom GLSL shaders.

**Flow:** boot screen → ~24k GPU particles form the name → morph into a rotating AI brain → fly apart and land on the room's surfaces → the room dissolves in from the floor up → an interactive room you explore by clicking objects.

| Object | Section |
|---|---|
| Curved monitor (live terminal) | Projects |
| Bookshelf + graduation cap | About & Education |
| Holo skills board | Skills & Experience |
| Neon "let's talk" sign / phone | Contact |

There is also a **2D view**. It loads automatically without WebGL or when the visitor asks for reduced motion.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in ./dist
```

## Edit content

All text lives in `src/data.js`. The monitor terminal, skills board and other in-room screens are drawn in code (`src/three/textures.js`), and the skills board reads from `data.js`.

- **CV download:** put the PDF in `public/` and set `profile.cv` to its file name.
- **Intro timing:** see `src/intro.js` (phase times) and `src/components/IntroOverlay.jsx` (captions).
- **Camera framing per section:** `views` in `src/three/CameraRig.jsx`.

## How the effects work

| File | Effect |
|---|---|
| `three/Particles.jsx` | Particle morph shader: cloud → name → brain → room surfaces, plus turbulence and mouse repel |
| `three/shapes.js` | Point targets: text sampled from a canvas, procedural brain, area-weighted mesh surface sampling |
| `three/reveal.jsx` | Shader patch on every room material: noisy floor-up dissolve with a glowing edge |
| `three/Experience.jsx` | Lights, procedural environment, bloom, chromatic-aberration glitch, film grain |
| `sound.js` | Synthesised ambient drone, hover blip and whoosh (Web Audio, no files) |
