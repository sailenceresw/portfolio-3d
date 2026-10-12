import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import Room from './Room.jsx'
import Particles from './Particles.jsx'
import CameraRig from './CameraRig.jsx'
import Dust from './Dust.jsx'
import { reveal } from './reveal.jsx'
import { intro, fx, ramp, INTRO_END } from '../intro.js'

// Advances the intro timeline and drives the room dissolve
function Director({ keyLight, onLoaded, onIntroDone }) {
  const loaded = useRef(false)
  useEffect(() => {
    if (intro.done) {
      reveal.uReveal.value = 100
      keyLight.current.intensity = 1.1
    }
  }, [keyLight])

  useFrame((_, dt) => {
    if (!loaded.current) {
      loaded.current = true
      onLoaded()
    }
    if (!intro.started || intro.done) return
    intro.t += Math.min(dt, 0.05)
    const r = ramp(intro.t, 8.2, 10.4)
    reveal.uReveal.value = -0.6 + r * 4.8
    keyLight.current.intensity = 1.1 * r
    if (intro.t >= INTRO_END) {
      intro.done = true
      reveal.uReveal.value = 100
      fx.pulse = 1
      onIntroDone()
    }
  })
  return null
}

// Writes the live camera position into the HUD readout
function CamReadout() {
  const frame = useRef(0)
  useFrame(({ camera }) => {
    if (frame.current++ % 6) return
    const el = document.getElementById('cam-readout')
    if (el) {
      const { x, y, z } = camera.position
      el.textContent = `CAM ${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`
    }
  })
  return null
}

function Effects({ focus, mobile }) {
  const ca = useRef()
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0003), [])
  useEffect(() => {
    fx.pulse = 1
  }, [focus])
  useFrame((_, dt) => {
    fx.pulse *= Math.exp(-dt * 4.5)
    const o = 0.0006 + fx.pulse * 0.014
    ca.current?.offset.set(o, o * 0.5)
  })
  return (
    <EffectComposer multisampling={mobile ? 0 : 4}>
      <Bloom mipmapBlur luminanceThreshold={1} intensity={1.05} radius={0.75} />
      <ChromaticAberration ref={ca} offset={offset} radialModulation={false} modulationOffset={0} />
      <Noise premultiply opacity={0.6} />
      <Vignette offset={0.25} darkness={0.8} />
    </EffectComposer>
  )
}

export default function Experience({ focus, onSelect, ready, onLoaded, onIntroDone }) {
  const roomRef = useRef()
  const keyLight = useRef()
  const mobile = window.innerWidth < 760

  return (
    <Canvas
      className="canvas"
      dpr={[1, mobile ? 1.5 : 2]}
      shadows
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 40, position: [0, 1.7, 9.6], near: 0.1, far: 80 }}
    >
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 14, 30]} />

      <ambientLight intensity={0.15} />
      <hemisphereLight args={['#8fb8ff', '#1a0f1f', 0.25]} />
      <directionalLight
        ref={keyLight}
        position={[6, 9, 5]}
        intensity={0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      {/* procedural studio lighting for reflections, no HDR download */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.6} color="#7df9ff" position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[8, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ff4fd8" position={[6, 2, -3]} rotation-y={-Math.PI / 2} scale={[8, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#ffffff" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>

      <group ref={roomRef}>
        <Room focus={focus} onSelect={onSelect} ready={ready} mobile={mobile} />
      </group>
      <Particles roomRef={roomRef} count={mobile ? 12000 : 24000} />
      {ready && <Dust count={mobile ? 60 : 120} />}

      <CameraRig focus={focus} />
      <Director keyLight={keyLight} onLoaded={onLoaded} onIntroDone={onIntroDone} />
      <CamReadout />
      <Effects focus={focus} mobile={mobile} />
    </Canvas>
  )
}
