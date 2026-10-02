'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Dictionary } from '@/i18n/types';
import { featuredTech, stackGroups, tech, techProjects, type ProjectRef, type TechSlug } from '@/content/tech';
import { asset } from '@/lib/env';
import styles from './StackInstallation.module.css';

type Props = {
  t: Dictionary['stack'];
  projectNames: Record<ProjectRef, string>;
};

const PROJECTS: ProjectRef[] = ['marega', 'assistant', 'unesc', 'portfolio'];

/**
 * Instalação da stack: módulos de grafite e vidro organizados por função.
 * - Na chegada, os módulos saem de posições soltas e se agrupam.
 * - Ponteiro, foco ou toque aproximam o módulo e atualizam o painel estável.
 * - Linhas roxas ligam a tecnologia aos projetos em que foi usada.
 * Todos os módulos são botões: mesma informação por teclado, toque e ponteiro.
 */
export function StackInstallation({ t, projectNames }: Props) {
  const [active, setActive] = useState<TechSlug>('react');
  const [arranged, setArranged] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<string[]>([]);

  const groups = stackGroups
    .map((g) => ({ id: g.id, items: (g.items as readonly TechSlug[]).filter((s) => !featuredTech.includes(s)) }))
    .filter((g) => g.items.length > 0);

  const groupOf = (slug: TechSlug) => stackGroups.find((g) => (g.items as readonly TechSlug[]).includes(slug))?.id ?? 'tools';

  // Organização na chegada
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArranged(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Linhas: do módulo ativo até cada projeto relacionado
  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia('(min-width: 1024px)').matches) {
      setPaths([]);
      return;
    }
    const box = root.getBoundingClientRect();
    const from = root.querySelector<HTMLElement>(`[data-tech="${active}"]`);
    if (!from) return;
    const a = from.getBoundingClientRect();
    const x1 = a.right - box.left;
    const y1 = a.top + a.height / 2 - box.top;
    const next = techProjects[active].map((ref) => {
      const node = root.querySelector<HTMLElement>(`[data-project="${ref}"]`);
      if (!node) return '';
      const b = node.getBoundingClientRect();
      const x2 = b.left - box.left;
      const y2 = b.top + b.height / 2 - box.top;
      const mid = (x2 - x1) * 0.55;
      return `M${x1},${y1} C${x1 + mid},${y1} ${x2 - mid},${y2} ${x2},${y2}`;
    });
    setPaths(next.filter(Boolean));
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure, arranged]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    // Re-mede quando a organização termina (transições)
    const timer = window.setTimeout(measure, 1200);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timer);
    };
  }, [measure]);

  const renderModule = (slug: TechSlug, size: 'lg' | 'sm', index: number) => {
    const entry = tech[slug];
    const isActive = active === slug;
    return (
      <li key={slug} style={{ '--i': index } as React.CSSProperties}>
        <button
          type="button"
          data-tech={slug}
          className={`${styles.module} ${size === 'lg' ? styles.lg : styles.sm}`}
          aria-pressed={isActive}
          onMouseEnter={() => setActive(slug)}
          onFocus={() => setActive(slug)}
          onClick={() => setActive(slug)}
        >
          <span className={styles.plinth} aria-hidden="true" />
          {entry.icon ? (
            // eslint-disable-next-line @next/next/no-img-element -- SVG local decorativo; nome visível ao lado
            <img src={asset(`/images/stack/${slug}-claro.svg`)} alt="" width={48} height={48} className={styles.icon} loading="lazy" decoding="async" />
          ) : (
            <span className={styles.glyph} aria-hidden="true">
              {entry.name.replace('Adobe ', '').slice(0, 2)}
            </span>
          )}
          <span className={styles.label}>{entry.name}</span>
        </button>
      </li>
    );
  };

  let counter = 0;
  const used = techProjects[active];

  return (
    <div ref={rootRef} className={styles.installation} data-arranged={arranged || undefined}>
      <div className={styles.field}>
        <div className={styles.featured}>
          <p className={`mono ${styles.trayLabel}`}>
            <span>{t.featuredTitle}</span> · {t.featuredNote}
          </p>
          <ul className={styles.featuredGrid} aria-label={t.featuredTitle}>
            {featuredTech.map((slug) => renderModule(slug, 'lg', counter++))}
          </ul>
        </div>

        <div className={styles.trays}>
          {groups.map((g) => (
            <div key={g.id} className={styles.tray}>
              <p className={`mono ${styles.trayLabel}`}>{t.groups[g.id].kind}</p>
              <ul className={styles.trayGrid} aria-label={t.groups[g.id].kind}>
                {g.items.map((slug) => renderModule(slug, 'sm', counter++))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <aside className={styles.panel} aria-live="polite">
        <p className={`mono ${styles.panelKind}`}>{t.groups[groupOf(active)].kind}</p>
        <p className={styles.panelName}>
          {tech[active].icon ? (
            // eslint-disable-next-line @next/next/no-img-element -- ícone decorativo junto ao nome
            <img src={asset(`/images/stack/${active}-claro.svg`)} alt="" width={40} height={40} />
          ) : null}
          {tech[active].name}
        </p>
        <p className={styles.panelText}>{t.tech[active]}</p>
        <p className={styles.panelNote}>{t.groups[groupOf(active)].note}</p>
        <p className={`mono ${styles.usedLabel}`}>{t.usedLabel}</p>
        <ul className={styles.projects}>
          {PROJECTS.map((ref) => (
            <li key={ref} data-project={ref} data-on={used.includes(ref) || undefined}>
              <span className={styles.dot} aria-hidden="true" />
              {ref === 'portfolio' ? t.portfolio : projectNames[ref]}
              <span className="sr-only">{used.includes(ref) ? ' ✓' : ''}</span>
            </li>
          ))}
        </ul>
        {used.length === 0 ? <p className={styles.panelNote}>{t.noProject}</p> : null}
        <p className={styles.hint}>{t.hint}</p>
      </aside>

      <svg ref={svgRef} className={styles.lines} aria-hidden="true">
        {paths.map((d, i) => (
          <path key={`${active}-${i}`} d={d} pathLength={1} style={{ '--k': i } as React.CSSProperties} />
        ))}
      </svg>
    </div>
  );
}
