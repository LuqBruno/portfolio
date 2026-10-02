import * as THREE from 'three';
import type { ViewFactory } from '../engine';
import { studioLights } from '../materials';
import { damp, disposeObject, revealRibbon, ribbonGeometry, seg } from '../geometry';
import { studio } from '@/lib/studio-store';

/**
 * Contato: a fita de metal acetinado da abertura retorna e forma um arco amplo à direita,
 * conduzindo o olhar à chamada. Um seixo de cerâmica repousa no centro do arco.
 */
export const contactView: ViewFactory = ({ shared, tier }) => {
  const scene = new THREE.Scene();
  scene.environment = shared.env;
  scene.environmentIntensity = 0.45;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  studioLights(scene);

  const arc = new THREE.Group();
  scene.add(arc);

  // Arco de ~300° com leve profundidade, aberto em direção ao texto
  const pts: THREE.Vector3[] = [];
  const turns = 0.86;
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const a = Math.PI * 0.95 - t * Math.PI * 2 * turns;
    const r = 0.95 + 0.1 * Math.sin(t * Math.PI);
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.92, Math.sin(t * Math.PI * 2) * 0.45));
  }
  const ribbon = ribbonGeometry(pts, { width: 0.3, segments: tier === 'high' ? 300 : 200, twist: 0.35 });
  arc.add(new THREE.Mesh(ribbon.geometry, shared.satin));

  const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.32, 64, 48), shared.ceramic);
  pebble.scale.set(1, 0.62, 0.95);
  pebble.position.set(0, -0.35, 0.2);
  scene.add(pebble);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.6), shared.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -0.58, 0.2);
  scene.add(shadow);

  const s = { p: 0, px: 0, py: 0 };

  return {
    scene,
    camera,
    update(time, dt, aspect) {
      s.p = damp(s.p, studio.contact, 4, dt);
      s.px = damp(s.px, studio.pointer.x, 2, dt);
      s.py = damp(s.py, studio.pointer.y, 2, dt);
      revealRibbon(ribbon.geometry, ribbon.segments, 0.15 + 0.85 * seg(s.p, 0, 0.8));
      arc.rotation.set(0.25 + s.py * 0.05, -0.35 + s.px * 0.12, time * 0.06);
      pebble.position.y = -0.35 + Math.sin(time * 0.55) * 0.03;

      // A composição ocupa a metade direita da área: deslocamos o alvo da câmera
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const visibleH = 6;
      const dist = visibleH / 2 / tan;
      const visibleW = visibleH * aspect;
      const offset = aspect > 1.1 ? visibleW * 0.3 : 0;
      arc.position.x = offset;
      pebble.position.x = offset;
      shadow.position.x = offset;
      camera.position.set(s.px * 0.2, -s.py * 0.12, dist);
      camera.lookAt(0, 0, 0);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },
    dispose() {
      disposeObject(scene);
    },
  };
};
