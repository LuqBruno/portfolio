import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ViewFactory } from '../engine';
import { studioLights } from '../materials';
import { circleLine, damp, disposeObject, rectLine, seg, segments } from '../geometry';
import { studio } from '@/lib/studio-store';

/**
 * Sobre: “entre o design e o desenvolvimento”.
 * Três camadas — desenho (linhas), interface (grafite com tela traçada) e sistema
 * (cerâmica) — começam como desenho técnico e ganham volume conforme a seção atravessa a tela.
 * Com o progresso (studio.about) as camadas se afastam e revelam a estrutura.
 */
export const aboutView: ViewFactory = ({ shared }) => {
  const scene = new THREE.Scene();
  scene.environment = shared.env;
  scene.environmentIntensity = 0.4;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const lights = studioLights(scene);

  const root = new THREE.Group();
  root.rotation.set(0.12, -0.62, 0);
  scene.add(root);

  const W = 1.7;
  const H = 2.2;

  type Layer = { group: THREE.Group; solid?: THREE.Mesh; solidMat?: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial; lines: Array<{ line: THREE.Line; count: number }>; lineMat: THREE.LineBasicMaterial };

  const makeLayer = (solidMat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null, depth: number): Layer => {
    const group = new THREE.Group();
    const lineMat = shared.line.clone();
    const outline = rectLine(W, H, lineMat);
    group.add(outline.line);
    let solid: THREE.Mesh | undefined;
    let mat: Layer['solidMat'];
    if (solidMat) {
      mat = solidMat.clone();
      mat.transparent = true;
      solid = new THREE.Mesh(new RoundedBoxGeometry(W, H, depth, 4, 0.05), mat);
      group.add(solid);
    }
    root.add(group);
    return { group, solid, solidMat: mat, lines: [outline], lineMat };
  };

  // Camada 1 — desenho: grade, círculo e marcações
  const sketch = makeLayer(null, 0);
  const circle = circleLine(0.55, sketch.lineMat);
  circle.line.position.y = 0.25;
  sketch.group.add(circle.line);
  sketch.lines.push(circle);
  sketch.group.add(
    segments(
      [
        [-W / 2, 0.25, 0, W / 2, 0.25, 0],
        [0, H / 2, 0, 0, -0.35, 0],
        [-0.6, -0.6, 0, 0.4, -0.6, 0],
        [-0.6, -0.78, 0, 0.1, -0.78, 0],
        [-0.6, -0.96, 0, 0.25, -0.96, 0],
      ],
      shared.lineFaint,
    ),
  );

  // Camada 2 — interface: grafite fosco com tela traçada
  const ui = makeLayer(shared.graphite, 0.07);
  const uiScreen = rectLine(W - 0.3, 1.0, shared.line);
  uiScreen.line.position.set(0, 0.42, 0.04);
  ui.group.add(uiScreen.line);
  ui.lines.push(uiScreen);

  // Camada 3 — sistema: cerâmica escura, sólida
  const system = makeLayer(shared.ceramic, 0.16);

  // Postes e nós de construção
  const posts = segments(
    [
      [-W / 2 - 0.25, -H / 2 - 0.2, -0.8, -W / 2 - 0.25, H / 2 + 0.3, -0.8],
      [W / 2 + 0.25, -H / 2 - 0.2, 0.8, W / 2 + 0.25, H / 2 - 0.2, 0.8],
    ],
    shared.lineFaint,
  );
  root.add(posts);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), shared.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 0.25;
  root.add(shadow);

  const s = { p: 0, px: 0, py: 0 };

  return {
    scene,
    camera,
    update(time, dt, aspect) {
      s.p = damp(s.p, studio.about, 5, dt);
      s.px = damp(s.px, studio.pointer.x, 2, dt);
      s.py = damp(s.py, studio.pointer.y, 2, dt);
      const p = s.p;
      lights.setLevel(0.55 + 0.45 * seg(p, 0, 0.4));

      // 1) desenho técnico se traça
      const draw = seg(p, 0.02, 0.35);
      [sketch, ui, system].forEach((layer) => layer.lines.forEach(({ line, count }) => line.geometry.setDrawRange(0, Math.round(count * draw))));

      // 2) volume surge nas camadas de interface e sistema
      const volume = seg(p, 0.25, 0.6);
      if (ui.solidMat) ui.solidMat.opacity = volume;
      if (system.solidMat) system.solidMat.opacity = seg(p, 0.35, 0.7);
      ui.lineMat.opacity = 0.55 * (1 - 0.6 * volume);
      system.lineMat.opacity = 0.55 * (1 - 0.8 * seg(p, 0.35, 0.7));

      // 3) camadas se afastam e revelam a estrutura
      const spread = 0.12 + 0.62 * seg(p, 0.3, 0.85);
      sketch.group.position.set(-0.05, 0.08 * spread, spread);
      ui.group.position.set(0, 0, 0);
      system.group.position.set(0.05, -0.08 * spread, -spread);

      root.rotation.y = -0.62 + 0.18 * seg(p, 0.3, 0.9) + s.px * 0.1 + Math.sin(time * 0.3) * 0.02;
      root.rotation.x = 0.12 + s.py * 0.05;
      root.position.y = Math.sin(time * 0.45) * 0.03;

      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.max(3.3 / 2 / tan, 2.9 / aspect / 2 / tan);
      camera.position.set(0, 0.1, dist);
      camera.lookAt(0, 0, 0);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },
    dispose() {
      [sketch, ui, system].forEach((l) => {
        l.lineMat.dispose();
        l.solidMat?.dispose();
      });
      disposeObject(scene);
    },
  };
};
