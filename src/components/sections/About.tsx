import type { Dictionary } from '@/i18n/types';
import { Picture } from '@/components/ui/Picture';
import { SectionLabel } from '@/components/ui/SectionLabel';
import styles from './About.module.css';

export function About({ dict }: { dict: Dictionary }) {
  const t = dict.about;
  return (
    <section id="sobre" data-section="sobre" className={`section ${styles.about}`} aria-labelledby="sobre-title">
      <div className={styles.light} aria-hidden="true" />
      <div className={`container ${styles.grid}`}>
        <div className={styles.media} data-reveal>
          <figure className={styles.frame} data-3d="about">
            <div className={`${styles.still} fill-picture`} aria-hidden="true">
              <Picture name="art/layers" alt="" sizes="(min-width: 1024px) 36vw, 90vw" />
            </div>
            <span className={styles.frameEdge} aria-hidden="true" />
            <figcaption className={`mono ${styles.layers}`}>{t.layers}</figcaption>
          </figure>
        </div>

        <div className={styles.copy}>
          <SectionLabel index={t.index} label={t.label} />
          <div className={styles.me} data-reveal>
            <div className={styles.meImg}>
              <Picture name="portrait/studio" alt={t.portraitAlt} sizes="112px" />
            </div>
            <p>
              <strong>Bruno Luque</strong>
              <span>{dict.hero.location}</span>
            </p>
          </div>
          <h2 id="sobre-title" className={`section-title ${styles.title}`} data-reveal>
            {t.title}
          </h2>
          <div className={styles.paragraphs} data-reveal style={{ '--reveal-delay': 1 } as React.CSSProperties}>
            {t.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? styles.lead : undefined}>
                {p}
              </p>
            ))}
          </div>

          <ol className={styles.highlights}>
            {t.highlights.map((h, i) => (
              <li key={h.title} data-reveal style={{ '--reveal-delay': i } as React.CSSProperties}>
                <span className={`mono ${styles.hIndex}`} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.hTitle}>{h.title}</h3>
                <p className={styles.hText}>{h.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
