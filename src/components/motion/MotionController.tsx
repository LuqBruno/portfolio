'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __blReveal?: number;
  }
}

/**
 * Um único controlador para os efeitos de página — sem biblioteca externa:
 *  - [data-reveal]          revelação discreta ao entrar na tela
 *  - [data-draw]            define --draw (0 → 1) conforme a rolagem atravessa o elemento
 *  - [data-tilt]            inclinação 3D sutil acompanhando o ponteiro (apenas ponteiro fino)
 *  - [data-offscreen-pause] adiciona .is-paused fora da tela (marquee, glows)
 * Usa transform/opacity e respeita prefers-reduced-motion.
 */
export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    window.clearTimeout(window.__blReveal);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanups: Array<() => void> = [];

    // ---- Revelação ----
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduce.matches || !('IntersectionObserver' in window)) {
      root.classList.add('reveal-all');
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      );
      revealTargets.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // ---- Pausa fora da tela ----
    const pausables = Array.from(document.querySelectorAll<HTMLElement>('[data-offscreen-pause]'));
    if (pausables.length) {
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) entry.target.classList.toggle('is-paused', !entry.isIntersecting);
      });
      pausables.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // ---- Progresso de rolagem (--draw) ----
    const drawables = Array.from(document.querySelectorAll<HTMLElement>('[data-draw]'));
    const visibleDraw = new Set<HTMLElement>();
    let frame = 0;
    const updateDraw = () => {
      frame = 0;
      const vh = window.innerHeight;
      visibleDraw.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // 0 quando o topo do elemento toca a base da tela; 1 quando seu centro atinge 40% da altura.
        const start = vh;
        const end = vh * 0.4 - rect.height * 0.5;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        el.style.setProperty('--draw', progress.toFixed(3));
      });
    };
    const requestDraw = () => {
      if (!frame) frame = requestAnimationFrame(updateDraw);
    };
    if (drawables.length && !reduce.matches) {
      drawables.forEach((el) => el.style.setProperty('--draw', '0'));
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) visibleDraw.add(el);
            else visibleDraw.delete(el);
          }
          requestDraw();
        },
        { rootMargin: '10% 0px 10% 0px' },
      );
      drawables.forEach((el) => io.observe(el));
      window.addEventListener('scroll', requestDraw, { passive: true });
      window.addEventListener('resize', requestDraw);
      cleanups.push(() => {
        io.disconnect();
        window.removeEventListener('scroll', requestDraw);
        window.removeEventListener('resize', requestDraw);
        cancelAnimationFrame(frame);
      });
    }

    // ---- Inclinação 3D por ponteiro ----
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (fine.matches && !reduce.matches) {
      document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
        const strength = Number(el.dataset.tilt) || 6;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let raf = 0;
        let inView = true;
        const step = () => {
          cx += (tx - cx) * 0.08;
          cy += (ty - cy) * 0.08;
          el.style.setProperty('--tilt-x', `${(-cy * strength).toFixed(2)}deg`);
          el.style.setProperty('--tilt-y', `${(cx * strength).toFixed(2)}deg`);
          el.style.setProperty('--shift-x', cx.toFixed(3));
          el.style.setProperty('--shift-y', cy.toFixed(3));
          raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 && inView ? requestAnimationFrame(step) : 0;
        };
        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          tx = Math.max(-1, Math.min(1, tx));
          ty = Math.max(-1, Math.min(1, ty));
          if (!raf) raf = requestAnimationFrame(step);
        };
        const onLeave = () => {
          tx = 0;
          ty = 0;
          if (!raf) raf = requestAnimationFrame(step);
        };
        const io = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
        });
        io.observe(el);
        const zone = (el.closest('[data-tilt-zone]') as HTMLElement | null) ?? el;
        zone.addEventListener('pointermove', onMove);
        zone.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          io.disconnect();
          zone.removeEventListener('pointermove', onMove);
          zone.removeEventListener('pointerleave', onLeave);
          cancelAnimationFrame(raf);
        });
      });
    }

    root.classList.add('motion-ready');
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
