import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

// Point clouds the intro particles morph between
export const CENTER = new THREE.Vector3(0, 1.7, 0)

function randomDir() {
  const z = Math.random() * 2 - 1
  const a = Math.random() * Math.PI * 2
  const r = Math.sqrt(1 - z * z)
  return [r * Math.cos(a), r * Math.sin(a), z]
}

export function cloudPoints(n) {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const [x, y, z] = randomDir()
    const r = 3 + Math.random() * 5
    out[i * 3] = x * r
    out[i * 3 + 1] = CENTER.y + y * r * 0.5
    out[i * 3 + 2] = z * r - 1
  }
  return out
}

// Sample filled pixels of text drawn on a canvas
export function textPoints(n, lines, worldWidth = 8.4) {
  const w = 1400
  const h = 460
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const fam = '"Syne", "Arial Black", sans-serif'
  ctx.font = `800 200px ${fam}`
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
  const size = Math.min(220, (200 * w * 0.94) / widest)
  ctx.font = `800 ${size}px ${fam}`
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lh = size * 1.02
  const y0 = h / 2 - ((lines.length - 1) * lh) / 2
  lines.forEach((l, i) => ctx.fillText(l, w / 2, y0 + i * lh))

  const data = ctx.getImageData(0, 0, w, h).data
  const pix = []
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (data[(y * w + x) * 4 + 3] > 128) pix.push(x, y)
    }
  }
  if (!pix.length) return cloudPoints(n)

  const out = new Float32Array(n * 3)
  const s = worldWidth / w
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * (pix.length / 2)) * 2
    out[i * 3] = (pix[k] - w / 2 + Math.random() * 2) * s
    out[i * 3 + 1] = -(pix[k + 1] - h / 2 + Math.random() * 2) * s + CENTER.y
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.3
  }
  return out
}

// Procedural brain: two folded hemispheres, cerebellum and brain stem
export function brainPoints(n, scale = 1.15, center = CENTER) {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const u = Math.random()
    const [dx, dy, dz] = randomDir()
    let x, y, z
    if (u < 0.86) {
      x = dx * 1.0
      y = dy * 0.82
      z = dz * 1.25
      if (y < 0) y *= 0.7
      const folds =
        Math.sin(dx * 9 + Math.sin(dz * 6) * 1.5) * Math.sin(dy * 10 + dz * 7) + 0.5 * Math.sin(dz * 17 + dy * 5)
      // mostly on the folded surface, some filling the volume
      const depth = Math.random() < 0.8 ? 0.94 + Math.random() * 0.06 : Math.cbrt(Math.random()) * 0.9
      const k = (1 + 0.045 * folds) * depth
      x *= k
      y *= k
      z *= k
      const side = dx >= 0 ? 1 : -1
      x += side * (Math.abs(dx) < 0.08 ? 0.12 : 0.07) // longitudinal fissure
    } else if (u < 0.95) {
      x = dx * 0.55
      y = dy * 0.28 - 0.55 + 0.02 * Math.sin(dy * 30)
      z = dz * 0.38 - 0.85
    } else {
      const t = Math.random()
      const a = Math.random() * Math.PI * 2
      x = Math.cos(a) * 0.13
      y = -0.45 - t * 0.6
      z = Math.sin(a) * 0.13 - 0.45
    }
    out[i * 3] = center.x + x * scale
    out[i * 3 + 1] = center.y + y * scale
    out[i * 3 + 2] = center.z + z * scale
  }
  return out
}

// Area-weighted points on the surfaces of every mesh under `root`.
// userData.w scales a mesh's share (walls/floor get less, props more);
// userData.noSample excludes it.
export function sampleSurfaces(root, n) {
  root.updateMatrixWorld(true)
  const items = []
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry?.attributes?.position || o.userData.noSample) return
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(g)).build()
    const sc = o.matrixWorld.getMaxScaleOnAxis()
    const area = sampler.distribution[sampler.distribution.length - 1] * sc * sc
    items.push({ sampler, matrix: o.matrixWorld, weight: area * (o.userData.w ?? 2.5) })
  })

  const out = new Float32Array(n * 3)
  const total = items.reduce((s, it) => s + it.weight, 0)
  if (!total) return out
  const v = new THREE.Vector3()
  let idx = 0
  items.forEach((it, j) => {
    let count = j === items.length - 1 ? n - idx : Math.round((n * it.weight) / total)
    count = Math.min(count, n - idx)
    for (let k = 0; k < count; k++, idx++) {
      it.sampler.sample(v)
      v.applyMatrix4(it.matrix)
      out[idx * 3] = v.x
      out[idx * 3 + 1] = v.y
      out[idx * 3 + 2] = v.z
    }
  })
  return out
}
