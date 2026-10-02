import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ViewFactory } from '../engine';
import { studioLights } from '../materials';
import { damp, disposeObject, rectLine, smooth } from '../geometry';
import { studio, PROJECT_BEATS } from '@/lib/studio-store';
import { asset } from '@/lib/env';

/**
 * Projetos: capturas reais sobre placas finas de grafite.
 * Cada placa tem uma pose por “batida” da rolagem (studio.beat):
 *   0–3  Maréga e Vargas — placas se separam; a página principal fica frontal, depois a institucional e o celular
 *   4–7  Bruno Assistente — placas saem; a esfera (HTML/WebGPU) assume o centro sobre um pedestal de cerâmica
 *   8–11 Central de Compras — três perfis empilhados se abrem e se destacam um de cada vez
 */
type Pose = [x: number, y: number, z: number, ry: number, rx: number, opacity: number];

const OUT_L: Pose = [-3.4, 0.3, -2.2, 0.7, 0, 0];
const OUT_R: Pose = [3.4, -0.2, -2.2, -0.7, 0, 0];

/** Poses por batida (índice 0–11). */
const poses: Record<string, Pose[]> = {
  mMain: [
    [-0.25, 0.1, 0, 0.42, 0.06, 1],
    [0, 0.08, 0.7, 0, 0, 1],
    [1.25, 0.5, -1.3, -0.32, 0.05, 0.5],
    [1.35, 0.55, -1.5, -0.34, 0.05, 0.4],
    OUT_L, OUT_L, OUT_L, OUT_L, OUT_L, OUT_L, OUT_L, OUT_L,
  ],
  mTeam: [
    [0.95, 0.55, -1.05, 0.34, 0.06, 0.75],
    [1.25, 0.5, -1.35, 0.3, 0.05, 0.5],
    [0.1, 0.02, 0.65, 0, 0, 1],
    [1.0, -0.15, -0.9, -0.28, 0.04, 0.55],
    OUT_L, OUT_L, OUT_L, OUT_L, OUT_L, OUT_L, OUT_L, OUT_L,
  ],
  mMobile: [
    [1.3, -0.4, 0.6, -0.36, 0.04, 1],
    [1.6, -0.45, 0.15, -0.42, 0, 0.65],
    [1.55, -0.4, 0.05, -0.42, 0, 0.55],
    [0.85, -0.05, 0.95, -0.08, 0, 1],
    OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R,
  ],
  uAdmin: [
    OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R,
    [0.15, 0.25, 0.3, -0.3, 0.06, 1],
    [0, 0.05, 0.7, 0, 0, 1],
    [1.3, 0.5, -1.2, -0.34, 0.04, 0.45],
    [1.0, -0.45, -1.6, -0.34, 0.04, 0.4],
  ],
  uSupplier: [
    OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R,
    [0.32, 0.05, -0.25, -0.3, 0.06, 0.85],
    [1.3, 0.5, -1.2, -0.34, 0.04, 0.45],
    [0, 0.05, 0.7, 0, 0, 1],
    [1.0, -0.45, -1.6, -0.34, 0.04, 0.4],
  ],
  uStore: [
    OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R, OUT_R,
    [0.5, -0.15, -0.8, -0.3, 0.06, 0.7],
    [1.0, -0.45, -1.6, -0.34, 0.04, 0.4],
    [1.3, 0.5, -1.2, -0.34, 0.04, 0.45],
    [0, 0.05, 0.7, 0, 0, 1],
  ],
};

export const projectsView: ViewFactory = ({ shared, tier, loadTexture }) => {
  const scene = new THREE.Scene();
  scene.environment = shared.env;
  scene.environmentIntensity = 0.35;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  studioLights(scene);
  const world = new THREE.Group();
  scene.add(world);

  const big = tier === 'high';
  const src = {
    mMain: { url: `/images/work/marega-alice-desktop-${big ? 1800 : 1200}.webp`, w: 2.5, aspect: 2880 / 1800 },
    mTeam: { url: `/images/work/marega-home-team-${big ? 1800 : 1200}.webp`, w: 2.5, aspect: 2880 / 1660 },
    mMobile: { url: `/images/work/marega-alice-mobile-${big ? 600 : 450}.webp`, w: 0.78, aspect: 1170 / 2532 },
    uAdmin: { url: `/images/work/unesc-admin-${big ? 1440 : 960}.webp`, w: 2.5, aspect: 2880 / 1640 },
    uSupplier: { url: `/images/work/unesc-fornecedor-${big ? 1440 : 960}.webp`, w: 2.5, aspect: 2880 / 1640 },
    uStore: { url: `/images/work/unesc-loja-${big ? 1440 : 960}.webp`, w: 2.5, aspect: 2880 / 1640 },
  } as const;

  type Plate = { group: THREE.Group; mats: THREE.Material[]; key: keyof typeof src; cur: Pose };
  const plates: Plate[] = (Object.keys(src) as Array<keyof typeof src>).map((key) => {
    const { url, w, aspect } = src[key];
    const h = w / aspect;
    const group = new THREE.Group();
    const slabMat = shared.graphite.clone();
    slabMat.transparent = true;
    const slab = new THREE.Mesh(new RoundedBoxGeometry(w + 0.08, h + 0.08, 0.05, 3, 0.025), slabMat);
    const screenMat = new THREE.MeshBasicMaterial({ map: loadTexture(asset(url)), toneMapped: false, transparent: true });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat);
    screen.position.z = 0.028;
    const edgeMat = shared.lineFaint.clone();
    const edge = rectLine(w + 0.08, h + 0.08, edgeMat);
    edge.line.position.z = 0.03;
    group.add(slab, screen, edge.line);
    world.add(group);
    return { group, mats: [slabMat, screenMat, edgeMat], key, cur: [...poses[key][0]] as Pose };
  });

  // Pedestal de cerâmica sob a esfera do assistente (batidas 4–7)
  const pedestal = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.1, 64), shared.ceramic);
  const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.02, 12, 128), shared.satin);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.07;
  pedestal.add(disc, ringMesh);
  pedestal.position.set(0, -1.35, 0);
  world.add(pedestal);

  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5.5, 48, 1, true), shared.beam);
  beam.position.set(0, 1.3, -0.4);
  world.add(beam);

  const s = { beat: 0, px: 0, py: 0, ped: 0, enter: 0 };
  const orbAnchor = document.querySelector<HTMLElement>('[data-orb-anchor]');
  const tmp = new THREE.Vector3();

  return {
    scene,
    camera,
    update(time, dt, aspect, rect) {
      s.beat = damp(s.beat, studio.beat, 7, dt);
      s.enter = damp(s.enter, studio.enter, 6, dt);
      s.px = damp(s.px, studio.pointer.x, 2.5, dt);
      s.py = damp(s.py, studio.pointer.y, 2.5, dt);
      const b = Math.max(0, Math.min(PROJECT_BEATS - 1, s.beat));
      const i0 = Math.floor(b);
      const i1 = Math.min(PROJECT_BEATS - 1, i0 + 1);
      const k = smooth(b - i0);

      plates.forEach((plate) => {
        const a = poses[plate.key][i0];
        const c = poses[plate.key][i1];
        const target = a.map((v, idx) => v + (c[idx] - v) * k) as Pose;
        plate.cur = plate.cur.map((v, idx) => damp(v, target[idx], 9, dt)) as Pose;
        const [x, y, z, ry, rx, op] = plate.cur;
        const e = s.enter;
        plate.group.position.set(x + (1 - e) * 1.6, y + Math.sin(time * 0.5 + x) * 0.015 - (1 - e) * 0.6, z - (1 - e) * 2.4);
        plate.group.rotation.set(rx, ry - (1 - e) * 0.5, 0);
        plate.group.visible = op * e > 0.01;
        plate.mats.forEach((m) => (m.opacity = op * e));
      });

      // Pedestal visível no capítulo do assistente
      const inAssistant = b > 3.4 && b < 7.6 ? 1 : 0;
      s.ped = damp(s.ped, inAssistant, 5, dt);
      pedestal.visible = s.ped > 0.01;
      pedestal.position.y = -1.05 - (1 - s.ped) * 0.8;
      pedestal.scale.setScalar(0.85 + 0.15 * s.ped);
      ringMesh.rotation.z = time * 0.2;
      (shared.beam.uniforms.uOpacity as { value: number }).value = 0.06 + 0.05 * s.ped;

      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      // Desktop: composição à direita (coluna de texto livre). Área estreita: centralizada.
      const side = rect.width >= 760;
      const dist = Math.max(3.7 / 2 / tan, (side ? 6.4 : 3.6) / aspect / 2 / tan);
      const visibleW = 2 * dist * tan * aspect;
      world.position.x = side ? visibleW * 0.2 : 0;
      camera.position.set(s.px * 0.3, -s.py * 0.18, dist);
      camera.lookAt(0, 0, 0);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      // Pedestal ancorado sob a esfera real (elemento HTML), onde quer que ela esteja
      if (orbAnchor && s.ped > 0.01) {
        const o = orbAnchor.getBoundingClientRect();
        if (o.width > 0) {
          const ndcX = ((o.left + o.width / 2 - rect.left) / rect.width) * 2 - 1;
          const ndcY = -(((o.bottom - o.height * 0.08 - rect.top) / rect.height) * 2 - 1);
          tmp.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
          const t = -camera.position.z / tmp.z;
          const px = camera.position.x + tmp.x * t;
          const py = camera.position.y + tmp.y * t;
          pedestal.position.x = px - world.position.x;
          pedestal.position.y = py - (1 - s.ped) * 0.8;
          const sc = (o.width / rect.width) * visibleW * 0.62;
          pedestal.scale.setScalar(sc * (0.85 + 0.15 * s.ped));
        }
      }
    },
    dispose() {
      plates.forEach((p) => p.mats.forEach((m) => m.dispose()));
      disposeObject(scene);
    },
  };
};
