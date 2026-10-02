import * as THREE from 'three';

/**
 * Fita larga ao longo de uma curva suave, com leve torção.
 * Retorna a geometria e o número de segmentos (para revelar por drawRange).
 */
export function ribbonGeometry(points: THREE.Vector3[], { width = 0.3, segments = 220, twist = 0.8 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
  // Referencial estável (sem as inversões dos quadros de Frenet em trechos quase retos)
  const up = new THREE.Vector3(0, 0, 1);
  const tangent = new THREE.Vector3();
  const side0 = new THREE.Vector3();
  const normal0 = new THREE.Vector3();
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const uvs = new Float32Array((segments + 1) * 2 * 2);
  const normals = new Float32Array((segments + 1) * 2 * 3);
  const n = new THREE.Vector3();
  const indices: number[] = [];
  const p = new THREE.Vector3();
  const side = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, p);
    const angle = twist * Math.PI * 2 * t;
    curve.getTangentAt(t, tangent);
    side0.crossVectors(tangent, up);
    if (side0.lengthSq() < 1e-6) side0.set(1, 0, 0);
    side0.normalize();
    normal0.crossVectors(side0, tangent).normalize();
    side.copy(side0).multiplyScalar(Math.cos(angle)).addScaledVector(normal0, Math.sin(angle));
    // afinamento suave nas pontas
    const taper = Math.min(1, t / 0.06, (1 - t) / 0.06);
    const w = (width / 2) * (0.35 + 0.65 * Math.max(0, taper));
    positions.set([p.x + side.x * w, p.y + side.y * w, p.z + side.z * w], i * 6);
    positions.set([p.x - side.x * w, p.y - side.y * w, p.z - side.z * w], i * 6 + 3);
    uvs.set([t, 0, t, 1], i * 4);
    n.crossVectors(tangent, side).normalize();
    normals.set([n.x, n.y, n.z, n.x, n.y, n.z], i * 6);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return { geometry, segments, curve };
}

/** Revela a fita de 0 a 1 ao longo do comprimento. */
export function revealRibbon(geometry: THREE.BufferGeometry, segments: number, amount: number) {
  geometry.setDrawRange(0, Math.round(Math.max(0, Math.min(1, amount)) * segments) * 6);
}

/** Contorno retangular como linha contínua (para “desenhar” com drawRange). */
export function rectLine(w: number, h: number, material: THREE.LineBasicMaterial) {
  const pts = [
    new THREE.Vector3(-w / 2, h / 2, 0),
    new THREE.Vector3(w / 2, h / 2, 0),
    new THREE.Vector3(w / 2, -h / 2, 0),
    new THREE.Vector3(-w / 2, -h / 2, 0),
    new THREE.Vector3(-w / 2, h / 2, 0),
  ];
  // densifica para que o desenho progressivo seja contínuo
  const dense: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    for (let k = 0; k < 24; k++) dense.push(pts[i].clone().lerp(pts[i + 1], k / 24));
  }
  dense.push(pts[pts.length - 1]);
  const geometry = new THREE.BufferGeometry().setFromPoints(dense);
  const line = new THREE.Line(geometry, material);
  return { line, count: dense.length };
}

/** Círculo como linha (desenho técnico). */
export function circleLine(r: number, material: THREE.LineBasicMaterial, segments = 96) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  return { line: new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material), count: pts.length };
}

/** Segmentos soltos (grades, cotas e marcações). */
export function segments(pairs: Array<[number, number, number, number, number, number]>, material: THREE.LineBasicMaterial) {
  const arr = new Float32Array(pairs.flat());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  return new THREE.LineSegments(geometry, material);
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}

/** Interpolação com aceleração e desaceleração suaves. */
export const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Trecho normalizado de um progresso: 0 antes de a, 1 depois de b. */
export const seg = (p: number, a: number, b: number) => smooth(clamp01((p - a) / (b - a)));
/** Amortecimento independente da taxa de quadros. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
