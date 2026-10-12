import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { Std, Glow, glowColor } from './reveal.jsx'
import * as T from './textures.js'
import { brainPoints } from './shapes.js'
import { sections } from '../data.js'
import { sound } from '../sound.js'

// Layout (metres): floor spans x -4.8..4.8, z -4..4.
// Back wall inner face z = -4, left wall inner face x = -4.8.

const C = {
  wall: '#14131f',
  walnut: '#3b2a22',
  walnutLight: '#5a3d2c',
  metal: '#24252f',
  dark: '#111118',
  cyan: '#7df9ff',
  pink: '#ff4fd8',
  violet: '#8a5bff',
}

// Redraw canvas textures once web fonts have arrived
function useTex(factory) {
  const tex = useMemo(factory, [])
  useEffect(() => {
    document.fonts.ready.then(() => tex.userData.redraw?.())
  }, [tex])
  return tex
}

function B({ args, color = C.dark, rough = 0.7, metal = 0, w, noSample, children, ...props }) {
  return (
    <mesh castShadow receiveShadow userData={{ w, noSample }} {...props}>
      <boxGeometry args={args} />
      {children ?? <Std color={color} roughness={rough} metalness={metal} />}
    </mesh>
  )
}

function GlowBar({ args, color, k = 3, ...props }) {
  return (
    <mesh {...props}>
      <boxGeometry args={args} />
      <Glow color={color} intensity={k} />
    </mesh>
  )
}

// ------------------------------------------------------------- hotspot
function Hotspot({ id, label, position, labelAt, focus, onSelect, ready, children }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef()
  const target = useMemo(() => new THREE.Vector3(), [])
  const idx = sections.findIndex((s) => s.id === id) + 1
  const active = ready && !focus

  useFrame((_, dt) => {
    const s = hovered && active ? 1.04 : 1
    ref.current.scale.lerp(target.set(s, s, s), 1 - Math.exp(-dt * 12))
  })

  const over = (e) => {
    e.stopPropagation()
    if (!active) return
    setHovered(true)
    sound.blip()
    document.body.dataset.hover = label || 'open'
  }
  const out = () => {
    setHovered(false)
    delete document.body.dataset.hover
  }

  return (
    <group
      ref={ref}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        if (!active) return
        out()
        onSelect(id)
      }}
      onPointerOver={over}
      onPointerOut={out}
    >
      {children}
      {active && label && (
        <Html position={labelAt} center zIndexRange={[20, 0]}>
          <button className={`tag3d ${hovered ? 'on' : ''}`} onClick={() => onSelect(id)}>
            <span>0{idx}</span>
            {label}
          </button>
        </Html>
      )}
    </group>
  )
}

// --------------------------------------------------------------- shell
function Shell({ mobile }) {
  const rug = useTex(T.rugTexture)
  return (
    <group>
      <B args={[9.6, 0.3, 8]} position={[0, -0.152, 0]} color="#0b0a12" noSample />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} receiveShadow userData={{ w: 0.35 }}>
        <planeGeometry args={[9.6, 8]} />
        <MeshReflectorMaterial
          resolution={mobile ? 512 : 1024}
          blur={[300, 80]}
          mixBlur={1}
          mixStrength={2.4}
          mirror={0.6}
          roughness={0.75}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#08070d"
          metalness={0.6}
        />
      </mesh>

      <B args={[9.9, 3.6, 0.3]} position={[0.15, 1.8, -4.15]} color={C.wall} rough={0.95} w={0.5} />
      <B args={[0.3, 3.6, 8.3]} position={[-4.95, 1.8, 0]} color={C.wall} rough={0.95} w={0.5} />

      {/* neon strips along the wall tops and the floor edges */}
      <GlowBar args={[9.6, 0.035, 0.035]} position={[0.15, 3.48, -3.98]} color={C.cyan} />
      <GlowBar args={[0.035, 0.035, 8]} position={[-4.78, 3.48, 0]} color={C.pink} />
      <GlowBar args={[9.6, 0.02, 0.025]} position={[0, 0.01, 4]} color={C.cyan} k={2} />
      <GlowBar args={[0.025, 0.02, 8]} position={[4.8, 0.01, 0]} color={C.pink} k={2} />

      <mesh rotation-x={-Math.PI / 2} position={[0.2, 0.012, -1.7]} receiveShadow>
        <circleGeometry args={[1.7, 64]} />
        <Std map={rug} roughness={1} />
      </mesh>
    </group>
  )
}

// Wood-slat acoustic wall behind the neon sign
function SlatWall() {
  const xs = []
  for (let x = 1.95; x <= 4.65; x += 0.17) xs.push(x)
  return (
    <group>
      {xs.map((x) => (
        <B key={x} args={[0.09, 2.9, 0.05]} position={[x, 1.75, -3.975]} color={C.walnutLight} rough={0.6} w={1} />
      ))}
    </group>
  )
}

// Honeycomb LED panels above the desk, cycling colour
function HexPanels() {
  const mats = useRef([])
  const cells = [
    [-0.372, 0], [0, 0], [0.372, 0],
    [-0.186, 0.3225], [0.186, 0.3225], [0.558, 0.3225],
    [-0.558, -0.3225], [0.186, -0.3225],
  ]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    mats.current.forEach((m, i) => {
      if (!m) return
      const hue = 0.5 + 0.38 * (0.5 + 0.5 * Math.sin(t * 0.4 + i * 0.7))
      m.color.setHSL(hue % 1, 0.9, 0.55).multiplyScalar(1.8)
    })
  })
  return (
    <group position={[0.15, 2.72, -3.97]}>
      {cells.map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.205, 0.205, 0.03, 6]} />
            <Std color="#0c0c14" />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position={[0, 0, 0.012]}>
            <cylinderGeometry args={[0.18, 0.18, 0.012, 6]} />
            <Glow ref={(m) => (mats.current[i] = m)} color={C.cyan} intensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- desk
function Desk({ ready }) {
  return (
    <group position={[0, 0, -3.35]}>
      <RoundedBox args={[3.2, 0.07, 1.15]} radius={0.02} position={[0, 0.87, 0]} castShadow receiveShadow>
        <Std color={C.walnut} roughness={0.45} />
      </RoundedBox>
      <B args={[0.06, 0.84, 1.0]} position={[-1.48, 0.42, 0]} color={C.metal} metal={0.6} rough={0.35} />
      <B args={[0.06, 0.84, 1.0]} position={[1.48, 0.42, 0]} color={C.metal} metal={0.6} rough={0.35} />
      <GlowBar args={[3.0, 0.012, 0.012]} position={[0, 0.83, 0.57]} color={C.pink} k={3} />

      <RoundedBox args={[1.75, 0.006, 0.62]} radius={0.003} position={[0.15, 0.908, 0.3]}>
        <Std color="#0e0d16" roughness={0.9} />
      </RoundedBox>
      <Keyboard />
      <RoundedBox args={[0.075, 0.03, 0.12]} radius={0.014} position={[0.66, 0.925, 0.36]} castShadow>
        <Std color="#1b1c25" roughness={0.4} />
      </RoundedBox>
      <Mug position={[-0.75, 0.905, 0.25]} />
      <Headphones position={[-1.2, 0.905, -0.18]} />
      <Hologram position={[1.18, 0.905, -0.22]} ready={ready} />
    </group>
  )
}

function Keyboard() {
  const ref = useRef()
  const cols = 15
  const rows = 5
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    const c = new THREE.Color()
    let i = 0
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        m.position.set((k - (cols - 1) / 2) * 0.058, 0.026, (r - (rows - 1) / 2) * 0.056)
        m.updateMatrix()
        ref.current.setMatrixAt(i, m.matrix)
        ref.current.setColorAt(i, c.setHSL(0.5 + (k / cols) * 0.38, 0.95, 0.6))
        i++
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  }, [])
  return (
    <group position={[0, 0.91, 0.33]}>
      <RoundedBox args={[0.92, 0.03, 0.31]} radius={0.01} position={[0, 0.015, 0]} castShadow>
        <Std color="#15161d" roughness={0.5} />
      </RoundedBox>
      <instancedMesh ref={ref} args={[null, null, cols * rows]}>
        <boxGeometry args={[0.048, 0.016, 0.046]} />
        <Glow color="#ffffff" intensity={1.25} />
      </instancedMesh>
    </group>
  )
}

function Mug(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.065, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.13, 28]} />
        <Std color="#ece7de" roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.07, 0]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.03, 0.009, 8, 20]} />
        <Std color="#ece7de" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.048, 20]} />
        <Std color="#2b1a10" roughness={0.2} />
      </mesh>
    </group>
  )
}

function Headphones(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.02, 24]} />
        <Std color={C.metal} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.38, 10]} />
        <Std color={C.metal} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.105, 0.016, 10, 32, Math.PI]} />
        <Std color="#1a1a22" roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.105, 0.29, 0]}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.055, 0.055, 0.045, 24]} />
            <Std color="#1a1a22" roughness={0.5} />
          </mesh>
          <mesh rotation-y={Math.PI / 2} position={[s * 0.024, 0, 0]}>
            <torusGeometry args={[0.04, 0.004, 6, 24]} />
            <Glow color={C.pink} intensity={2.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Projector with a small particle brain floating above it
function Hologram({ ready, ...props }) {
  const brain = useRef()
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(brainPoints(1800, 0.12, new THREE.Vector3()), 3))
    return g
  }, [])
  const color = useMemo(() => glowColor(C.cyan, 2.4), [])
  useFrame(({ clock }, dt) => {
    brain.current.rotation.y += dt * 0.5
    brain.current.position.y = 0.46 + Math.sin(clock.elapsedTime * 1.5) * 0.015
  })
  return (
    <group {...props}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.06, 32]} />
        <Std color={C.metal} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.061, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.07, 0.09, 32]} />
        <Glow color={C.cyan} intensity={3} />
      </mesh>
      <mesh position={[0, 0.26, 0]} userData={{ noSample: true }}>
        <coneGeometry args={[0.2, 0.4, 32, 1, true]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={ready ? 0.06 : 0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <points ref={brain} geometry={geo} visible={ready}>
        <pointsMaterial size={0.012} color={color} toneMapped={false} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}

// Curved ultrawide monitor running a live terminal
function Monitor() {
  const term = useMemo(T.createTerminal, [])
  useEffect(() => {
    document.fonts.ready.then(() => term.texture.userData.redraw())
  }, [term])
  useFrame(({ clock }) => term.update(clock.elapsedTime))

  const R = 2.4
  const H = 0.72
  const L = 1.9 / R
  return (
    <group>
      <mesh position={[0, 0, R]}>
        <cylinderGeometry args={[R, R, H, 64, 1, true, Math.PI - L / 2, L]} />
        <Glow map={term.texture} color="#ffffff" intensity={1.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, R]} castShadow>
        <cylinderGeometry args={[R + 0.025, R + 0.025, H + 0.05, 64, 1, true, Math.PI - (L + 0.03) / 2, L + 0.03]} />
        <Std color="#0b0b10" roughness={0.35} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <B args={[0.06, 0.42, 0.05]} position={[0, -0.3, -0.12]} color={C.metal} metal={0.7} rough={0.3} />
      <RoundedBox args={[0.5, 0.02, 0.24]} radius={0.008} position={[0, -0.505, -0.06]}>
        <Std color={C.metal} metalness={0.7} roughness={0.3} />
      </RoundedBox>
      <pointLight position={[0, 0, 0.8]} color={C.cyan} intensity={2.2} distance={3} />
      <pointLight position={[0, 0.1, -0.35]} color={C.violet} intensity={3} distance={2.5} />
    </group>
  )
}

function Phone() {
  const tex = useTex(T.phoneTexture)
  return (
    <group rotation-y={-0.3}>
      <RoundedBox args={[0.14, 0.015, 0.28]} radius={0.006} castShadow>
        <Std color="#0e0f14" roughness={0.3} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0085, 0]}>
        <planeGeometry args={[0.125, 0.25]} />
        <Glow map={tex} color="#ffffff" intensity={1.3} />
      </mesh>
    </group>
  )
}

// Glass-sided PC under the desk with spinning RGB fans
function PcTower() {
  const fans = useRef([])
  useFrame((_, dt) => fans.current.forEach((f) => f && (f.rotation.z += dt * 4)))
  return (
    <group position={[0.95, 0.31, -3.45]}>
      <RoundedBox args={[0.24, 0.6, 0.52]} radius={0.015} castShadow>
        <Std color="#101016" roughness={0.3} metalness={0.5} />
      </RoundedBox>
      <mesh position={[0.121, 0, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.46, 0.54]} />
        <Glow color={C.violet} intensity={0.55} />
      </mesh>
      {[-0.17, 0, 0.17].map((y, i) => (
        <group key={y} position={[0, y, 0.262]}>
          <mesh>
            <torusGeometry args={[0.068, 0.008, 8, 32]} />
            <Glow color={i === 1 ? C.pink : C.cyan} intensity={3} />
          </mesh>
          <group ref={(g) => (fans.current[i] = g)}>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} rotation-z={(k * Math.PI) / 2} position={[0, 0, -0.004]}>
                <boxGeometry args={[0.11, 0.022, 0.004]} />
                <Std color="#1d1d26" />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  )
}

function Chair() {
  const legs = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2)
  return (
    <group position={[-0.5, 0, -1.95]} rotation-y={0.55}>
      {legs.map((a) => (
        <group key={a} rotation-y={a}>
          <B args={[0.035, 0.03, 0.3]} position={[0, 0.07, 0.15]} color={C.metal} metal={0.6} rough={0.3} />
          <mesh position={[0, 0.028, 0.29]}>
            <sphereGeometry args={[0.028, 12, 12]} />
            <Std color="#0d0d12" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.4, 12]} />
        <Std color={C.metal} metalness={0.8} roughness={0.25} />
      </mesh>
      <RoundedBox args={[0.56, 0.1, 0.54]} radius={0.04} position={[0, 0.52, 0]} castShadow>
        <Std color="#1d1b2b" roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.54, 0.8, 0.1]} radius={0.045} position={[0, 0.99, 0.27]} rotation-x={-0.1} castShadow>
        <Std color="#1d1b2b" roughness={0.8} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <group key={s}>
          <B args={[0.06, 0.72, 0.11]} position={[s * 0.25, 0.99, 0.275]} rotation-x={-0.1} color="#5b2bd6" rough={0.6} />
          <B args={[0.03, 0.2, 0.03]} position={[s * 0.3, 0.64, 0.02]} color={C.metal} />
          <RoundedBox args={[0.07, 0.03, 0.26]} radius={0.012} position={[s * 0.3, 0.75, 0.02]}>
            <Std color="#15141f" />
          </RoundedBox>
        </group>
      ))}
      <RoundedBox args={[0.32, 0.14, 0.08]} radius={0.035} position={[0, 1.44, 0.32]} rotation-x={-0.1}>
        <Std color="#1d1b2b" roughness={0.8} />
      </RoundedBox>
    </group>
  )
}

// Deterministic pseudo-random so the books look the same on every load
function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

function Bookshelf() {
  const books = useMemo(() => {
    const rnd = seeded(7)
    const palette = ['#b83a3a', '#2e6fde', '#e0a030', '#2f9e5f', '#7e44ad', '#e8e4dc', '#169e8a', '#d35400', '#20202a']
    const out = []
    ;[0.12, 0.66, 1.2, 1.74].forEach((y, shelf) => {
      let z = -0.62
      while (z < 0.55) {
        const t = 0.04 + rnd() * 0.06
        const h = 0.26 + rnd() * 0.16
        if (rnd() > 0.88 && shelf !== 0) {
          z += 0.14
          continue
        }
        out.push({ pos: [0, y + h / 2, z + t / 2], args: [0.3, h, t], color: palette[Math.floor(rnd() * palette.length)], tilt: rnd() > 0.93 ? 0.16 : 0 })
        z += t + 0.006
      }
    })
    return out
  }, [])

  return (
    <group>
      <B args={[0.42, 2.25, 0.04]} position={[0, 1.12, -0.7]} color={C.walnut} />
      <B args={[0.42, 2.25, 0.04]} position={[0, 1.12, 0.7]} color={C.walnut} />
      <B args={[0.02, 2.25, 1.44]} position={[-0.2, 1.12, 0]} color="#1a1520" />
      {[0.1, 0.64, 1.18, 1.72, 2.24].map((y) => (
        <group key={y}>
          <B args={[0.42, 0.04, 1.4]} position={[0, y, 0]} color={C.walnutLight} rough={0.5} />
          {y > 0.2 && <GlowBar args={[0.01, 0.006, 1.3]} position={[0.17, y - 0.024, 0]} color="#ffc27a" k={2.2} />}
        </group>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={b.pos} rotation-x={b.tilt} castShadow>
          <boxGeometry args={b.args} />
          <Std color={b.color} roughness={0.65} />
        </mesh>
      ))}
      <GradCap position={[0, 2.26, 0.25]} />
      <group position={[0, 2.26, -0.35]}>
        <B args={[0.1, 0.06, 0.1]} position={[0, 0.03, 0]} color="#1a1a1a" />
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.07, 0.03, 0.17, 24]} />
          <Std color="#e6b422" metalness={1} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

function GradCap(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.11, 0.12, 0.12, 24]} />
        <Std color="#14141c" />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation-y={Math.PI / 4}>
        <boxGeometry args={[0.34, 0.015, 0.34]} />
        <Std color="#14141c" />
      </mesh>
      <GlowBar args={[0.01, 0.12, 0.01]} position={[0.12, 0.07, 0.02]} color="#ffd36b" k={2.2} />
    </group>
  )
}

function Certificate() {
  const tex = useTex(T.certificateTexture)
  return (
    <group position={[-4.77, 1.95, -2.65]} rotation-y={Math.PI / 2}>
      <B args={[0.8, 0.6, 0.03]} color="#1c1712" rough={0.4} />
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[0.7, 0.5]} />
        <Std map={tex} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Window() {
  const tex = useTex(T.skylineTexture)
  return (
    <group position={[-4.77, 1.9, 2.2]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[2.4, 1.52]} />
        <Glow map={tex} color="#ffffff" intensity={1.2} />
      </mesh>
      <B args={[2.56, 0.08, 0.1]} position={[0, 0.8, 0.05]} color="#0e0d14" />
      <B args={[2.56, 0.08, 0.1]} position={[0, -0.8, 0.05]} color="#0e0d14" />
      <B args={[0.08, 1.68, 0.1]} position={[-1.24, 0, 0.05]} color="#0e0d14" />
      <B args={[0.08, 1.68, 0.1]} position={[1.24, 0, 0.05]} color="#0e0d14" />
      <B args={[0.035, 1.52, 0.06]} position={[0, 0, 0.04]} color="#0e0d14" />
      <B args={[2.4, 0.035, 0.06]} position={[0, 0.25, 0.04]} color="#0e0d14" />
      <B args={[2.7, 0.05, 0.26]} position={[0, -0.86, 0.12]} color={C.walnutLight} />
      <pointLight position={[0, 0, 1]} color="#7a6bff" intensity={2.5} distance={4.5} />
    </group>
  )
}

function SkillsBoard() {
  const tex = useTex(T.skillsTexture)
  return (
    <group>
      <RoundedBox args={[2.3, 1.36, 0.03]} radius={0.02}>
        <Std color="#0a0f1c" roughness={0.15} metalness={0.3} transparent opacity={0.92} />
      </RoundedBox>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[2.2, 1.3]} />
        <Glow map={tex} color="#ffffff" intensity={1.35} transparent />
      </mesh>
      <GlowBar args={[2.3, 0.01, 0.01]} position={[0, 0.685, 0.02]} color={C.cyan} k={3} />
      <GlowBar args={[2.3, 0.01, 0.01]} position={[0, -0.685, 0.02]} color={C.cyan} k={3} />
      <GlowBar args={[0.01, 1.37, 0.01]} position={[-1.155, 0, 0.02]} color={C.cyan} k={3} />
      <GlowBar args={[0.01, 1.37, 0.01]} position={[1.155, 0, 0.02]} color={C.cyan} k={3} />
    </group>
  )
}

function NeonSign() {
  const tex = useTex(T.neonTexture)
  const mat = useRef()
  const base = useMemo(() => glowColor(C.pink, 2.6), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const flicker = Math.sin(t * 40) > 0.97 || t % 7 > 6.85 ? 0.5 : 1
    mat.current.color.copy(base).multiplyScalar(flicker)
  })
  return (
    <group>
      <RoundedBox args={[1.9, 0.82, 0.04]} radius={0.03} position={[0, 0, -0.03]}>
        <Std color="#0d0d16" transparent opacity={0.85} roughness={0.75} />
      </RoundedBox>
      <mesh>
        <planeGeometry args={[1.8, 0.675]} />
        <Glow ref={mat} map={tex} color={C.pink} intensity={2.6} transparent depthWrite={false} />
      </mesh>
      <pointLight position={[0, -0.2, 1.0]} color={C.pink} intensity={3} distance={4.5} />
    </group>
  )
}

function LightTube(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.1, 0.11, 0.03, 24]} />
        <Std color={C.metal} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.6, 16]} />
        <Glow color={C.cyan} intensity={2.6} />
      </mesh>
      <pointLight position={[0, 1, 0.3]} color={C.cyan} intensity={4} distance={5} />
    </group>
  )
}

function Plant(props) {
  const leaves = useMemo(() => {
    const rnd = seeded(3)
    return [...Array(11)].map((_, i) => {
      const a = (i / 11) * Math.PI * 2 + rnd() * 0.4
      const h = 0.55 + rnd() * 0.55
      const lean = 0.35 + rnd() * 0.45
      return { a, h, lean, s: 0.16 + rnd() * 0.08 }
    })
  }, [])
  return (
    <group {...props}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.48, 32]} />
        <Std color="#e4ddd0" roughness={0.6} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} rotation-y={l.a}>
          <mesh position={[0, 0.48 + l.h / 2, l.lean * 0.25]} rotation-x={l.lean * 0.7}>
            <cylinderGeometry args={[0.006, 0.008, l.h, 6]} />
            <Std color="#2f6b3a" />
          </mesh>
          <mesh position={[0, 0.48 + l.h, l.lean * 0.5]} rotation-x={l.lean + 0.4} scale={[l.s, 0.012, l.s * 0.7]} castShadow>
            <sphereGeometry args={[1, 16, 10]} />
            <Std color={i % 2 ? '#2f8f4e' : '#3fae62'} roughness={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Beanbag(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.27, 0]} scale={[1, 0.55, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 24]} />
        <Std color="#35295a" roughness={1} />
      </mesh>
      <mesh position={[0.05, 0.42, -0.18]} scale={[1, 0.6, 0.55]} castShadow>
        <sphereGeometry args={[0.3, 24, 16]} />
        <Std color="#35295a" roughness={1} />
      </mesh>
    </group>
  )
}

// ------------------------------------------------------------------ room
export default function Room({ focus, onSelect, ready, mobile }) {
  const hs = { focus, onSelect, ready }
  return (
    <group>
      <Shell mobile={mobile} />
      <SlatWall />
      <HexPanels />
      <Desk ready={ready} />
      <PcTower />
      <Chair />
      <Certificate />
      <Window />
      <Plant position={[4.0, 0, -2.75]} />
      <LightTube position={[4.5, 0, -3.72]} />
      <Beanbag position={[-3.4, 0, 1.6]} />

      <Hotspot id="projects" label="Projects" position={[0, 1.42, -3.66]} labelAt={[0, 0.58, 0.1]} {...hs}>
        <Monitor />
      </Hotspot>
      <Hotspot id="about" label="About" position={[-4.57, 0, -0.6]} labelAt={[0.1, 2.75, 0]} {...hs}>
        <Bookshelf />
      </Hotspot>
      <Hotspot id="skills" label="Skills" position={[-2.65, 1.95, -3.95]} labelAt={[0, 0.88, 0]} {...hs}>
        <SkillsBoard />
      </Hotspot>
      <Hotspot id="contact" label="Contact" position={[3.25, 2.25, -3.9]} labelAt={[0, 0.6, 0]} {...hs}>
        <NeonSign />
      </Hotspot>
      <Hotspot id="contact" position={[1.05, 0.913, -3.05]} {...hs}>
        <Phone />
      </Hotspot>
    </group>
  )
}
