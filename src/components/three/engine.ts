import * as THREE from 'three';
import { createShared, type Shared, type Tier } from './materials';
import { studio } from '@/lib/studio-store';

export type ViewContext = {
  shared: Shared;
  tier: Tier;
  renderer: THREE.WebGLRenderer;
  loadTexture: (url: string) => THREE.Texture;
};

export type View = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** time em segundos desde o início; dt em segundos; aspect e retângulo da área hospedeira. */
  update: (time: number, dt: number, aspect: number, rect: DOMRect) => void;
  dispose: () => void;
};

export type ViewFactory = (ctx: ViewContext) => View;

/**
 * Um único contexto WebGL para todo o site. Cada “vista” é desenhada no retângulo
 * do seu elemento hospedeiro ([data-3d]) via viewport/scissor sobre um canvas fixo.
 * - só renderiza vistas visíveis; pausa com a aba oculta ou nada visível;
 * - resolução limitada por nível de qualidade;
 * - libera geometrias, materiais e texturas no descarte.
 */
export function createEngine(canvas: HTMLCanvasElement, tier: Tier) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: tier !== 'low',
    powerPreference: tier === 'high' ? 'high-performance' : 'default',
  });
  const maxDpr = tier === 'high' ? 1.75 : tier === 'mid' ? 1.25 : 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  const shared = createShared(renderer, tier);
  const textures = new Set<THREE.Texture>();
  const loader = new THREE.TextureLoader();
  const loadTexture = (url: string) => {
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.add(tex);
    return tex;
  };
  const ctx: ViewContext = { shared, tier, renderer, loadTexture };

  const views = new Map<HTMLElement, View>();
  const visible = new Set<HTMLElement>();
  let frame = 0;
  let last = 0;
  let start = 0;
  let firstFrame: (() => void) | null = null;
  let lost = false;
  let onLost: (() => void) | null = null;
  let onRestored: (() => void) | null = null;
  let shown = false;

  /** O canvas só aparece enquanto alguma cena está na tela; fora delas fica limpo e oculto. */
  const setShown = (value: boolean) => {
    if (value === shown) return;
    shown = value;
    canvas.style.visibility = value ? 'visible' : 'hidden';
    if (!value && !lost) {
      renderer.setScissorTest(false);
      renderer.clear(true, true, true);
    }
  };
  canvas.style.visibility = 'hidden';

  // Perda do contexto (GPU sob pressão, painéis embutidos): esconde o canvas e cede às versões estáticas
  const handleLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.style.visibility = 'hidden';
    shown = false;
    onLost?.();
  };
  const handleRestored = () => {
    lost = false;
    onRestored?.();
  };
  canvas.addEventListener('webglcontextlost', handleLost);
  canvas.addEventListener('webglcontextrestored', handleRestored);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) visible.add(el);
        else visible.delete(el);
      }
      wake();
    },
    { rootMargin: '10% 0px' },
  );

  function render(now: number) {
    frame = 0;
    if (lost) return;
    if (document.hidden || visible.size === 0) {
      setShown(false);
      return;
    }
    if (!start) start = now;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    const time = (now - start) / 1000;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    renderer.setScissorTest(false);
    renderer.clear(true, true, true);
    renderer.setScissorTest(true);

    let drawn = 0;
    visible.forEach((host) => {
      const view = views.get(host);
      if (!view) return;
      const r = host.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
      drawn++;
      const x = r.left;
      const y = vh - r.bottom;
      renderer.setViewport(x, y, r.width, r.height);
      const sx = Math.max(0, x);
      const sy = Math.max(0, y);
      renderer.setScissor(sx, sy, Math.min(vw, x + r.width) - sx, Math.min(vh, y + r.height) - sy);
      view.update(time, dt, r.width / r.height, r);
      renderer.clearDepth();
      renderer.render(view.scene, view.camera);
    });
    setShown(drawn > 0);

    if (firstFrame) {
      firstFrame();
      firstFrame = null;
    }
    frame = requestAnimationFrame(render);
  }

  function wake() {
    if (lost) return;
    if (!visible.size) setShown(false);
    if (!frame && !document.hidden && visible.size) {
      last = 0;
      frame = requestAnimationFrame(render);
    }
  }

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    wake();
  };
  const onPointer = (e: PointerEvent) => {
    studio.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    studio.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', wake);

  return {
    tier,
    addView(host: HTMLElement, factory: ViewFactory) {
      views.set(host, factory(ctx));
      io.observe(host);
    },
    onContextLost(cb: () => void) {
      onLost = cb;
    },
    onContextRestored(cb: () => void) {
      onRestored = cb;
    },
    onFirstFrame(cb: () => void) {
      firstFrame = cb;
      wake();
    },
    dispose() {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('webglcontextlost', handleLost);
      canvas.removeEventListener('webglcontextrestored', handleRestored);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', wake);
      views.forEach((v) => v.dispose());
      views.clear();
      textures.forEach((t) => t.dispose());
      shared.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

export type Engine = ReturnType<typeof createEngine>;
