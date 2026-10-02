import type { Dictionary } from '@/i18n/types';
import type { ImageKey } from '@/content/images.generated';
import { projectLinks } from '@/content/site';
import { Picture } from '@/components/ui/Picture';
import { Icon } from '@/components/ui/Icon';
import { TechList } from '@/components/ui/TechList';
import { ParticleSphere } from '@/components/cases/ParticleSphere';
import type { TechSlug } from '@/content/tech';
import { SectionLabel } from '@/components/ui/SectionLabel';
import styles from './Showcase.module.css';

type Chapter = {
  id: string;
  number: string;
  kind: string;
  name: string;
  category: string;
  summary: string;
  tech: TechSlug[];
  links: Array<{ href: string; label: string; icon: 'arrowUpRight' | 'github' }>;
  /** Legendas das quatro batidas do capítulo. */
  beats: string[];
  note?: string;
};

/**
 * Projetos em três capítulos editoriais.
 * - Celular / movimento reduzido / sem JS: capítulos em sequência vertical, com capturas reais.
 * - Desktop: ScrollScenes fixa o palco; as batidas da rolagem conduzem as placas 3D
 *   (StudioCanvas, área [data-3d="projects"]) e os estados ilustrativos da esfera.
 *   Os botões levam direto a cada capítulo.
 */
export function Showcase({ dict }: { dict: Dictionary }) {
  const w = dict.work;
  const l = w.labels;
  const a = w.assistant;
  const chapters: Chapter[] = [
    {
      id: 'case-marega',
      number: w.marega.number,
      kind: w.marega.kind,
      name: w.marega.name,
      category: w.marega.category,
      summary: w.marega.summary,
      tech: ['nextdotjs', 'react', 'typescript', 'css'],
      links: [
        { href: projectLinks.marega.site, label: l.visit, icon: 'arrowUpRight' },
        { href: projectLinks.marega.code, label: l.code, icon: 'github' },
      ],
      beats: [`${w.marega.structureTitle}: ${w.marega.structure.join(' · ')}`, w.marega.captionDesktop, w.marega.captionTeam, w.marega.captionMobile],
    },
    {
      id: 'case-assistente',
      number: a.number,
      kind: a.kind,
      name: a.name,
      category: a.subtitle,
      summary: a.tagline,
      tech: ['react', 'typescript', 'python', 'fastapi', 'nodedotjs', 'sqlite', 'tauri', 'ollama', 'wgsl'],
      links: [],
      beats: [a.orb.captions.ready, a.orb.captions.listening, a.orb.captions.thinking, a.orb.captions.speaking],
      note: a.orb.note,
    },
    {
      id: 'case-unesc',
      number: w.unesc.number,
      kind: w.unesc.kind,
      name: w.unesc.name,
      category: w.unesc.category,
      summary: w.unesc.summary,
      tech: ['react', 'javascript', 'vite', 'tailwindcss', 'nodedotjs', 'express', 'prisma', 'postgresql', 'jsonwebtokens'],
      links: [
        { href: projectLinks.unesc.frontend, label: l.frontend, icon: 'github' },
        { href: projectLinks.unesc.backend, label: l.backend, icon: 'github' },
      ],
      beats: [w.unesc.profilesTitle, ...w.unesc.profiles.map((p) => p.name)],
      note: w.unesc.teamNote,
    },
  ];

  /** Telas reais por etapa (versão HTML: celular, sem WebGL ou movimento reduzido). */
  type Frame = { image: ImageKey; alt: string; beats: number[]; portrait?: boolean };
  const frames: Record<string, Frame[]> = {
    'case-marega': [
      { image: 'work/marega-alice-desktop', alt: w.marega.altDesktop, beats: [0, 1] },
      { image: 'work/marega-home-team', alt: w.marega.altTeam, beats: [2] },
      { image: 'work/marega-alice-mobile', alt: w.marega.altMobile, beats: [3], portrait: true },
    ],
    'case-unesc': [
      { image: 'work/unesc-admin', alt: w.unesc.altAdmin, beats: [8, 9] },
      { image: 'work/unesc-fornecedor', alt: w.unesc.altSupplier, beats: [10] },
      { image: 'work/unesc-loja', alt: w.unesc.altStore, beats: [11] },
    ],
  };

  return (
    <div className={styles.showcase} data-scene="showcase" role="region" aria-label={w.showcase.label}>
      <div className={styles.pin} data-s="pin">
        <div className={styles.stage3d} data-3d="projects" aria-hidden="true" />
        <div className={`container ${styles.stage}`}>
          {/* Abertura da apresentação: o título recua enquanto as placas entram */}
          <header className={styles.intro} data-s="intro">
            <SectionLabel index={w.index} label={w.label} />
            <h2 id="projetos-title" className={`section-title ${styles.introTitle}`}>
              {w.title}
            </h2>
            <p className={styles.introText}>{w.intro}</p>
          </header>
          <div className={styles.chapters} data-s="chapters">
            {chapters.map((ch, i) => (
              <article key={ch.id} className={styles.chapter} data-chapter={i} aria-labelledby={`show-${ch.id}`}>
                <div className={styles.info}>
                  <p className={styles.kicker}>
                    <span className="mono">{ch.number}</span>
                    <span className="mono badge">{ch.kind}</span>
                  </p>
                  <h3 id={`show-${ch.id}`} className={styles.name}>
                    {ch.name}
                  </h3>
                  <p className={styles.category}>{ch.category}</p>
                  <p className={styles.summary}>{ch.summary}</p>
                  <TechList slugs={ch.tech} />
                  <ol className={styles.beats}>
                    {ch.beats.map((text, k) => (
                      <li key={k} data-beat={i * 4 + k}>
                        <span className="mono" aria-hidden="true">
                          {String(k + 1).padStart(2, '0')}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ol>
                  {ch.note ? <p className={styles.note}>{ch.note}</p> : null}
                  <div className={styles.links}>
                    <a className="btn btn--primary" href={`#${ch.id}`}>
                      {w.showcase.details}
                      <Icon name="arrowDown" data-arrow="down" />
                    </a>
                    {ch.links.map((link) => (
                      <a key={link.href} className="btn btn--ghost" href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.icon === 'github' ? <Icon name="github" /> : null}
                        {link.label}
                        {link.icon === 'arrowUpRight' ? <Icon name="arrowUpRight" data-arrow="diag" /> : null}
                        <span className="sr-only">{dict.a11y.newTab}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className={styles.visual}>
                  {ch.id === 'case-assistente' ? (
                    <div className={styles.orb} data-orb-anchor>
                      <ParticleSphere t={a.orb} controlled compact />
                    </div>
                  ) : (
                    <ul className={styles.shots}>
                      {frames[ch.id].map((f, k) => (
                        <li
                          key={f.image}
                          className={`${styles.frame} ${f.portrait ? styles.portraitFrame : ''} fill-picture`}
                          data-beats={f.beats.join(' ')}
                          data-first={k === 0 || undefined}
                        >
                          <Picture name={f.image} alt={f.alt} sizes={f.portrait ? '(min-width: 1024px) 18vw, 40vw' : '(min-width: 1024px) 56vw, 96vw'} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className={styles.nav} data-s="nav">
            <p className={`mono ${styles.counter}`} aria-hidden="true">
              <span data-s="current">01</span> / {String(chapters.length).padStart(2, '0')}
            </p>
            <div className={styles.bar} aria-hidden="true">
              <span data-s="bar" />
            </div>
            <div className={styles.tabs} role="group" aria-label={w.showcase.choose}>
              {chapters.map((ch, i) => (
                <button key={ch.id} type="button" data-goto={i} aria-pressed={i === 0}>
                  <span className="mono" aria-hidden="true">
                    {ch.number}
                  </span>
                  {ch.name}
                </button>
              ))}
            </div>
            <p className="sr-only" aria-live="polite" data-s="live" data-template={w.showcase.progress} />
          </div>
        </div>
      </div>
      <p className={`container ${styles.captureNote}`}>
        <Icon name="lock" /> {a.captureNote} {w.unesc.captureNote}
      </p>
    </div>
  );
}
