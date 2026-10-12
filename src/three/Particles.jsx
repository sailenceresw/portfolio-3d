import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { intro, ramp } from '../intro.js'
import { CENTER, cloudPoints, textPoints, brainPoints, sampleSurfaces } from './shapes.js'

const vertexShader = /* glsl */ `
attribute vec3 aName;
attribute vec3 aBrain;
attribute vec3 aRoom;
attribute vec4 aRand;

uniform float uTime, uM1, uM2, uM3, uFade, uSize, uPR, uScale, uBrainRot, uMouseAmt;
uniform vec3 uMouse, uCenter;

varying float vAlpha;
varying vec3 vColor;

float ease(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
float stag(float m, float r) { return ease(clamp(m * 1.4 - r * 0.4, 0.0, 1.0)); }
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

void main() {
  float r = aRand.x;

  vec3 cloud = position - uCenter;
  cloud.xz = rot(cloud.xz, uTime * 0.12 * (0.5 + aRand.y));
  cloud += uCenter;

  vec3 nm = uCenter + (aName - uCenter) * uScale;

  vec3 br = (aBrain - uCenter) * uScale;
  br.xz = rot(br.xz, uBrainRot);
  br += uCenter;

  // lower room surfaces land first, matching the floor-up dissolve
  float r3 = clamp(aRoom.y / 3.8, 0.0, 1.0) * 0.7 + aRand.w * 0.3;

  float s1 = stag(uM1, r);
  float s2 = stag(uM2, aRand.y);
  float s3 = stag(uM3, r3);

  vec3 p = mix(cloud, nm, s1);
  p = mix(p, br, s2);
  p = mix(p, aRoom, s3);

  // turbulence while in flight
  float turb = sin(3.14159 * s1) + sin(3.14159 * s2) + sin(3.14159 * s3) * 1.5;
  vec3 n = vec3(
    sin(p.y * 2.1 + uTime * 1.3 + r * 6.28),
    cos(p.z * 1.9 + uTime * 1.1 + aRand.y * 6.28),
    sin(p.x * 2.3 + uTime * 1.7 + aRand.z * 6.28));
  p += n * (0.035 + turb * 0.45);

  // mouse repels particles
  vec2 d = p.xy - uMouse.xy;
  float dl = length(d) + 1e-4;
  p.xy += (d / dl) * uMouseAmt * smoothstep(0.6, 0.0, dl) * 0.3;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.35 + aRand.y * 0.9) * uPR / -mv.z * mix(1.0, 0.7, s3);

  vec3 cyan = vec3(0.49, 0.98, 1.0);
  vec3 pink = vec3(1.0, 0.31, 0.85);
  vec3 violet = vec3(0.55, 0.36, 1.0);
  vColor = aRand.z < 0.6 ? cyan : (aRand.z < 0.85 ? violet : pink);
  vAlpha = uFade * (0.55 + 0.45 * sin(uTime * 2.0 + r * 30.0));
}
`

const fragmentShader = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * 2.2, a);
}
`

export default function Particles({ roomRef, count }) {
  const points = useRef()

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const cloud = cloudPoints(count)
    const rand = new Float32Array(count * 4).map(() => Math.random())
    g.setAttribute('position', new THREE.BufferAttribute(cloud, 3))
    g.setAttribute('aName', new THREE.BufferAttribute(cloud.slice(), 3))
    g.setAttribute('aBrain', new THREE.BufferAttribute(brainPoints(count), 3))
    g.setAttribute('aRoom', new THREE.BufferAttribute(cloud.slice(), 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uM1: { value: 0 },
      uM2: { value: 0 },
      uM3: { value: 0 },
      uFade: { value: 1 },
      uSize: { value: 30 },
      uPR: { value: 1 },
      uScale: { value: 1 },
      uBrainRot: { value: 0 },
      uMouseAmt: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uCenter: { value: CENTER.clone() },
    }),
    [],
  )

  // Name needs the display font; the room needs its meshes mounted
  useEffect(() => {
    let alive = true
    const setName = () => {
      if (!alive) return
      geometry.attributes.aName.array.set(textPoints(count, ['MANISH', 'BISHWOKARMA']))
      geometry.attributes.aName.needsUpdate = true
    }
    document.fonts.load('800 160px "Syne"').then(setName, setName)
    if (roomRef.current) {
      geometry.attributes.aRoom.array.set(sampleSurfaces(roomRef.current, count))
      geometry.attributes.aRoom.needsUpdate = true
    }
    return () => {
      alive = false
    }
  }, [geometry, count, roomRef])

  const helpers = useMemo(() => ({ ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) }), [])

  // Track the mouse on the window: the canvas misses events while overlays
  // (boot screen) cover it, which left the pointer stuck at screen centre.
  // Only repel once the visitor has actually moved it.
  const mouse = useRef({ moved: false, ndc: new THREE.Vector2() })
  useEffect(() => {
    const on = (e) => {
      mouse.current.moved = true
      mouse.current.ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
    }
    window.addEventListener('pointermove', on)
    return () => window.removeEventListener('pointermove', on)
  }, [])

  useFrame(({ camera, size, gl }, dt) => {
    const t = intro.t
    const u = uniforms
    u.uTime.value += dt
    u.uM1.value = ramp(t, 0.4, 2.6)
    u.uM2.value = ramp(t, 4.0, 5.6)
    u.uM3.value = ramp(t, 6.6, 8.8)
    u.uFade.value = 1 - ramp(t, 8.8, 10.2)
    // start in side profile (the recognisable brain silhouette), then turn
    u.uBrainRot.value = Math.PI / 2 + Math.max(0, t - 4.0) * 0.32
    u.uScale.value = Math.min(1, size.width / size.height / 1.25)
    u.uPR.value = gl.getPixelRatio()
    u.uMouseAmt.value = mouse.current.moved && t < 6.6 ? 1 : 0
    helpers.ray.setFromCamera(mouse.current.ndc, camera)
    helpers.ray.ray.intersectPlane(helpers.plane, u.uMouse.value)
    points.current.visible = !intro.done
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
