'use client';

import { useEffect, useRef } from 'react';
import styles from './PageRail.module.css';

/**
 * Trilho de progresso da página: uma linha fina à esquerda que acompanha toda a rolagem
 * e marca a seção atual — reforça a continuidade entre as cenas. Decorativo (a navegação
 * acessível está no cabeçalho).
 */
export function PageRail() {
  const fillRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    const list = listRef.current;
    if (!list) return;
    list.innerHTML = '';
    const dots = sections.map(() => {
      const li = document.createElement('li');
      list.appendChild(li);
      return li;
    });
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      const mid = window.innerHeight * 0.5;
      let active = 0;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= mid) active = i;
      });
      dots.forEach((d, i) => {
        d.toggleAttribute('data-active', i === active);
        d.toggleAttribute('data-past', i < active);
        d.style.top = `${(i / Math.max(1, dots.length - 1)) * 100}%`;
      });
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);

  return (
    <div className={styles.rail} aria-hidden="true">
      <span className={styles.track}>
        <span ref={fillRef} className={styles.fill} />
      </span>
      <ol ref={listRef} className={styles.dots} />
    </div>
  );
}
