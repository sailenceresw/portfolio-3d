import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { intro } from '../intro.js'

// Camera position and look-at target for the intro, overview and each section
const views = {
  intro: { pos: [0, 1.7, 9.6], look: [0, 1.7, 0] },
  home: { pos: [7.6, 5.2, 7.8], look: [-0.6, 1.0, -1.0] },
  projects: { pos: [0, 1.75, -0.7], look: [0, 1.38, -3.62] },
  about: { pos: [-1.25, 1.6, -0.6], look: [-4.5, 1.3, -0.6] },
  skills: { pos: [-2.65, 1.95, -0.3], look: [-2.65, 1.95, -3.95] },
  contact: { pos: [3.25, 1.95, -0.95], look: [3.25, 2.15, -3.9] },
}

const UP = new THREE.Vector3(0, 1, 0)

export default function CameraRig({ focus }) {
  const look = useRef(new THREE.Vector3(...views.intro.look))
  const [p, l, side] = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], [])

  useFrame(({ camera, pointer, size, clock }, dt) => {
    const inIntro = !intro.done && intro.t < 6.8
    const v = inIntro ? views.intro : views[focus] || views.home
    const narrow = size.width < 760
    p.set(...v.pos)
    l.set(...v.look)

    if (inIntro) {
      p.x += pointer.x * 0.4
      p.y += pointer.y * 0.25
    } else if (!focus) {
      // a portrait screen can't show the whole room at a readable size, so
      // phones get a slow pan across it; desktop drifts with the mouse
      if (narrow) {
        l.set(0.1, 1.3, -2.0)
        p.sub(l).multiplyScalar(1.8).add(l)
        const sway = Math.sin(clock.elapsedTime * 0.22)
        l.x += sway * 2.2
        l.z -= sway * 1.2
      }
      p.x += pointer.x * 0.7
      p.y += pointer.y * 0.4
    } else if (narrow) {
      // bottom sheet covers the lower half: back off and lift the object up
      p.sub(l).multiplyScalar(1.35).add(l)
      p.y -= 0.45
      l.y -= 0.45
    } else {
      // side panel covers the right: shift the view so the object sits left
      side.subVectors(l, p).normalize().cross(UP).normalize()
      p.addScaledVector(side, 0.55)
      l.addScaledVector(side, 0.55)
    }

    // slower, cinematic swoop while the room assembles
    const speed = intro.done ? 2.4 : 1.1
    const k = 1 - Math.exp(-dt * speed)
    camera.position.lerp(p, k)
    look.current.lerp(l, k)
    camera.lookAt(look.current)
  })

  return null
}
