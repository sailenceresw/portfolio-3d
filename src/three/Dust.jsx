import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Slow drifting motes. Own shader instead of drei <Sparkles>: its falloff
// divides by the distance to the point centre, which can produce Infinity
// and blow out the whole frame through the bloom pass.
const vertexShader = /* glsl */ `
attribute vec4 aRand;
uniform float uTime, uPR;
varying float vAlpha;
varying float vPink;
void main() {
  vec3 p = position;
  p.y += mod(uTime * 0.05 * (0.4 + aRand.x) + aRand.y * 4.0, 4.0) - 2.0;
  p.x += sin(uTime * 0.3 + aRand.z * 6.28) * 0.15;
  p.z += cos(uTime * 0.25 + aRand.w * 6.28) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (6.0 + aRand.x * 10.0) * uPR / -mv.z;
  vAlpha = 0.35 + 0.35 * sin(uTime * 1.5 + aRand.w * 20.0);
  vPink = step(0.75, aRand.z);
}
`
const fragmentShader = /* glsl */ `
varying float vAlpha;
varying float vPink;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  if (a < 0.01) discard;
  vec3 c = mix(vec3(0.49, 0.98, 1.0), vec3(1.0, 0.31, 0.85), vPink);
  gl_FragColor = vec4(c * 1.6, a);
}
`

export default function Dust({ count = 120 }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9
      pos[i * 3 + 1] = 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7.5
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(count * 4).map(() => Math.random()), 4))
    return g
  }, [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPR: { value: 1 } }), [])
  useFrame(({ gl }, dt) => {
    uniforms.uTime.value += dt
    uniforms.uPR.value = gl.getPixelRatio()
  })
  return (
    <points geometry={geometry} frustumCulled={false}>
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
