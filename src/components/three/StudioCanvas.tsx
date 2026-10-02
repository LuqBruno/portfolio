'use client';

import { useEffect, useRef } from 'react';
import type { Tier } from './materials';
import styles from './StudioCanvas.module.css';

type ViewName = 'projects' | 'about' | 'contact';

/** Nível de qualidade conforme o dispositivo. */
function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (window.innerWidth < 768 || coarse || memory <= 4 || cores <= 4) return 'low';
  if (memory >= 8 && cores >= 8) return 'high';
  return 'mid';
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Canvas fixo e compartilhado pelas cenas 3D (Three.js carregado sob demanda).
 * - Desktop capaz: todas as cenas, resolução até 1,75×.
 * - Intermediário: todas as cenas, resolução reduzida e menos geometria.
 * - Celular/tablet: apenas as placas dos projetos, em resolução 1×.
 * - Movimento reduzido ou sem WebGL: nenhuma cena — ficam os quadros estáticos e as capturas.
 */
export function StudioCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 860px)');
    let disposed = false;
    let engine: { dispose: () => void } | null = null;
    let cleanupWait = () => {};
    const active: ViewName[] = [];

    const teardown = () => {
      cleanupWait();
      engine?.dispose();
      engine = null;
      active.forEach((name) => root.classList.remove(`studio-${name}`));
      active.length = 0;
      root.classList.remove('studio-on');
    };

    const boot = async () => {
      teardown();
      if (reduce.matches || !webglAvailable()) return;
      const tier = detectTier();
      // Celular/tablet: só a apresentação de projetos (placas 3D), em resolução 1×
      const wanted: ViewName[] = desktop.matches ? ['projects', 'about', 'contact'] : ['projects'];
      const hosts = wanted
        .map((name) => [name, document.querySelector<HTMLElement>(`[data-3d="${name}"]`)] as const)
        .filter((entry): entry is readonly [ViewName, HTMLElement] => !!entry[1]);
      if (!hosts.length) return;

      // Carregamento adiado: só quando uma cena se aproxima da tela, no tempo ocioso do navegador
      await new Promise<void>((resolve) => {
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              io.disconnect();
              const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
              if (idle) idle(() => resolve(), { timeout: 1200 });
              else setTimeout(resolve, 200);
            }
          },
          { rootMargin: '120% 0px' },
        );
        hosts.forEach(([, host]) => io.observe(host));
        cleanupWait = () => io.disconnect();
      });
      if (disposed) return;

      const [{ createEngine }, views] = await Promise.all([import('./engine'), import('./views')]);
      if (disposed) return;
      const e = createEngine(canvas, tier);
      engine = e;
      hosts.forEach(([name, host]) => {
        e.addView(host, views[name]);
        active.push(name);
      });
      e.onFirstFrame(() => {
        root.classList.add('studio-on');
        active.forEach((name) => root.classList.add(`studio-${name}`));
      });
    };

    void boot();
    const onChange = () => void boot();
    reduce.addEventListener('change', onChange);
    desktop.addEventListener('change', onChange);
    return () => {
      disposed = true;
      reduce.removeEventListener('change', onChange);
      desktop.removeEventListener('change', onChange);
      teardown();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
