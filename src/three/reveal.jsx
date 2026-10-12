import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'

// Every room material is patched with a "dissolve" shader: fragments above
// the uReveal height (plus noise) are discarded, and a glowing cyan band
// marks the edge. Animating uReveal upwards prints the room from the floor.
export const reveal = {
  uReveal: { value: -1 },
}

const NOISE = /* glsl */ `
float rvHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float rvNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(rvHash(i), rvHash(i + vec3(1, 0, 0)), f.x), mix(rvHash(i + vec3(0, 1, 0)), rvHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(rvHash(i + vec3(0, 0, 1)), rvHash(i + vec3(1, 0, 1)), f.x), mix(rvHash(i + vec3(0, 1, 1)), rvHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
`

export function patchReveal(shader) {
  shader.uniforms.uReveal = reveal.uReveal
  shader.vertexShader =
    'varying vec3 vRvPos;\n' +
    shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      #ifdef USE_INSTANCING
        vRvPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
      #else
        vRvPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      #endif`,
    )
  shader.fragmentShader =
    'uniform float uReveal;\nvarying vec3 vRvPos;\n' +
    NOISE +
    shader.fragmentShader
      .replace(
        'void main() {',
        `void main() {
        float rvN = rvNoise(vRvPos * 4.0) * 0.35 + rvNoise(vRvPos * 11.0) * 0.12;
        float rvD = uReveal - (vRvPos.y + rvN);
        if (rvD < 0.0) discard;`,
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        float rvEdge = 1.0 - smoothstep(0.0, 0.06, rvD);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.4, 2.2, 2.6), rvEdge);`,
      )
}

export const glowColor = (hex, k) => new THREE.Color(hex).multiplyScalar(k)

// Lit material with the dissolve patch
export function Std(props) {
  return <meshStandardMaterial roughness={0.7} envMapIntensity={0.7} {...props} onBeforeCompile={patchReveal} />
}

// Unlit, bloom-bright material with the dissolve patch
export const Glow = forwardRef(function Glow({ color = '#ffffff', intensity = 2.5, ...props }, ref) {
  const c = useMemo(() => glowColor(color, intensity), [color, intensity])
  return <meshBasicMaterial ref={ref} color={c} toneMapped={false} {...props} onBeforeCompile={patchReveal} />
})
