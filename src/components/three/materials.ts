import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Tier = 'high' | 'mid' | 'low';

/** Ruído suave em tons de cinza para quebrar a uniformidade do grafite fosco. */
function noiseTexture(size: number): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const raw = new Float32Array(size * size).map(() => rand());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // média 3×3 para um grão delicado, sem pontos duros
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) sum += raw[((y + dy + size) % size) * size + ((x + dx + size) % size)];
      const v = Math.round(150 + (sum / 9 - 0.5) * 120);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.needsUpdate = true;
  return tex;
}

/** Sombra de contato: gradiente radial escuro aplicado a um plano sob a composição. */
function shadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.75)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.25)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Feixe de luz volumétrica sutil (aditivo, sem pós-processamento). */
function beamMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0x8b5cf6) }, uOpacity: { value: 0.09 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vFacing = abs(dot(n, normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        float along = pow(vUv.y, 1.6);          // mais intenso perto da fonte
        float soft = pow(vFacing, 2.2);          // bordas do cone se dissolvem
        gl_FragColor = vec4(uColor, along * soft * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

export type Shared = ReturnType<typeof createShared>;

/** Materiais e texturas compartilhados por todas as cenas (um único contexto WebGL). */
export function createShared(renderer: THREE.WebGLRenderer, tier: Tier) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  pmrem.dispose();
  room.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  });

  const noise = noiseTexture(128);

  const graphite = new THREE.MeshStandardMaterial({
    color: 0x1e1d23,
    roughness: 0.86,
    metalness: 0.3,
    roughnessMap: noise,
    envMapIntensity: 0.6,
  });
  const graphiteSoft = new THREE.MeshStandardMaterial({
    color: 0x26242d,
    roughness: 0.78,
    metalness: 0.3,
    roughnessMap: noise,
    envMapIntensity: 0.55,
  });
  const ceramic = new THREE.MeshPhysicalMaterial({
    color: 0x0f0e14,
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.42,
    sheen: 0.25,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color(0x4a3a8a),
    envMapIntensity: 0.55,
  });
  const satin = new THREE.MeshPhysicalMaterial({
    color: 0x4521b4,
    metalness: 0.86,
    roughness: 0.3,
    clearcoat: 0.18,
    clearcoatRoughness: 0.45,
    anisotropy: tier === 'high' ? 0.65 : 0,
    side: THREE.DoubleSide,
    envMapIntensity: 1.05,
  });
  const line = new THREE.LineBasicMaterial({ color: 0xb9a6ff, transparent: true, opacity: 0.55, depthWrite: false });
  const lineFaint = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.22, depthWrite: false });
  const node = new THREE.MeshBasicMaterial({ color: 0xddd6fe });
  const beam = beamMaterial();
  const shadowTex = shadowTexture();
  const shadow = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });

  return {
    env,
    noise,
    graphite,
    graphiteSoft,
    ceramic,
    satin,
    line,
    lineFaint,
    node,
    beam,
    shadow,
    dispose() {
      [env, noise, shadowTex].forEach((t) => t.dispose());
      [graphite, graphiteSoft, ceramic, satin, line, lineFaint, node, beam, shadow].forEach((m) => m.dispose());
    },
  };
}

/** Iluminação de estúdio consistente entre as cenas: roxo indireto, toque quente e contorno. */
export function studioLights(scene: THREE.Scene) {
  const group = new THREE.Group();
  const hemi = new THREE.HemisphereLight(0x2a2440, 0x050408, 0.45);
  const key = new THREE.SpotLight(0xd2c6ff, 55, 22, 0.6, 0.9, 1.4);
  key.position.set(-3.2, 5.2, 3.4);
  const warm = new THREE.PointLight(0xffa56e, 4, 9, 1.6);
  warm.position.set(2.2, 1.6, 2.6);
  const rim = new THREE.DirectionalLight(0xc4b5fd, 2.4);
  rim.position.set(2.5, 2.5, -4);
  const fill = new THREE.PointLight(0x6d28d9, 7, 12, 1.7);
  fill.position.set(-2.8, -1.2, 2.4);
  group.add(hemi, key, key.target, warm, rim, fill);
  scene.add(group);
  const base = [hemi.intensity, key.intensity, warm.intensity, rim.intensity, fill.intensity];
  return {
    key,
    /** 0 → 1: acende a sala gradualmente (entrada da cena). */
    setLevel(level: number) {
      [hemi, key, warm, rim, fill].forEach((l, i) => (l.intensity = base[i] * level));
    },
  };
}
