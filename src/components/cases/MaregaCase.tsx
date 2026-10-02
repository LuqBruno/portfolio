import type { Dictionary } from '@/i18n/types';
import { projectLinks } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { CaseHeader } from './CaseHeader';
import { TechList } from '@/components/ui/TechList';
import c from './Case.module.css';
import styles from './MaregaCase.module.css';

export function MaregaCase({ dict }: { dict: Dictionary }) {
  const t = dict.work.marega;
  const l = dict.work.labels;
  return (
    <article id="case-marega" className={c.case} aria-labelledby="marega-title">
      <div className="container">
        <CaseHeader
          id="marega-title"
          number={t.number}
          kind={t.kind}
          name={t.name}
          tagline={t.tagline}
          summary={t.summary}
          meta={[
            { label: l.category, value: t.category },
            { label: l.context, value: t.context },
            { label: l.status, value: t.status },
          ]}
        />

        <div className={`${c.cols} ${styles.story}`}>
          <div className={c.block} data-reveal>
            <h4 className={c.blockTitle}>{t.challengeTitle}</h4>
            <p>{t.challenge}</p>
          </div>
          <div className={c.block} data-reveal style={{ '--reveal-delay': 1 } as React.CSSProperties}>
            <h4 className={c.blockTitle}>{t.solutionTitle}</h4>
            <p>{t.solution}</p>
          </div>
          <div className={c.block} data-reveal style={{ '--reveal-delay': 2 } as React.CSSProperties}>
            <h4 className={c.blockTitle}>{t.roleTitle}</h4>
            <p>{t.role}</p>
            <TechList slugs={['nextdotjs', 'react', 'typescript', 'css']} />
          </div>
        </div>

        <div className={styles.secondary}>
          <div className={styles.facts} data-reveal>
            <div>
              <h4 className={c.blockTitle}>{t.structureTitle}</h4>
              <ul className={c.list}>
                {t.structure.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={c.blockTitle}>{t.featuresTitle}</h4>
              <ul className="chips">
                {t.features.map((f) => (
                  <li key={f} className="chip">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className={c.links}>
              <a className="btn btn--primary" href={projectLinks.marega.site} target="_blank" rel="noopener noreferrer">
                {l.visit}
                <Icon name="arrowUpRight" data-arrow="diag" />
                <span className="sr-only">{dict.a11y.newTab}</span>
              </a>
              <a className="btn btn--ghost" href={projectLinks.marega.code} target="_blank" rel="noopener noreferrer">
                <Icon name="github" />
                {l.code}
                <span className="sr-only">{dict.a11y.newTab}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
