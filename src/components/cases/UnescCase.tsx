import type { Dictionary } from '@/i18n/types';
import { projectLinks } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { CaseHeader } from './CaseHeader';
import { TechList } from '@/components/ui/TechList';
import c from './Case.module.css';
import styles from './UnescCase.module.css';

export function UnescCase({ dict }: { dict: Dictionary }) {
  const t = dict.work.unesc;
  const l = dict.work.labels;
  return (
    <article id="case-unesc" className={c.case} aria-labelledby="unesc-title">
      <div className="container">
        <CaseHeader
          id="unesc-title"
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

        <div className={styles.body}>
          <div className={c.block} data-reveal>
            <h4 className={c.blockTitle}>{t.contextTitle}</h4>
            <p>{t.contextText}</p>
          </div>

          <div className={c.block} data-reveal>
            <h4 className={c.blockTitle}>{t.profilesTitle}</h4>
            <dl className={styles.profiles}>
              {t.profiles.map((p) => (
                <div key={p.name}>
                  <dt>{p.name}</dt>
                  <dd>{p.text}</dd>
                </div>
              ))}
            </dl>
            <p className={c.note}>{t.profilesNote}</p>
          </div>
        </div>

        <div className={styles.archWrap} data-reveal>
          <h4 className={c.blockTitle}>{t.architectureTitle}</h4>
          <ol className={styles.arch}>
            {t.architecture.map((node, i) => (
              <li key={node.title} className={styles.layer}>
                <span className="mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <strong>{node.title}</strong>
                <span className={styles.layerDetail}>{node.detail}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.footer}>
          <div className={`${c.glass} ${styles.role}`} data-reveal>
            <h4 className={c.blockTitle}>{t.roleTitle}</h4>
            <p className={styles.roleText}>{t.role}</p>
            <p className={`mono ${styles.teamTitle}`}>{t.teamTitle}</p>
            <ul className={styles.team}>
              {t.team.map((name) => (
                <li key={name} className={name === 'Bruno Luque' ? styles.me : undefined}>
                  {name}
                </li>
              ))}
            </ul>
            <p className={c.note}>{t.teamNote}</p>
          </div>

          <div className={c.block} data-reveal>
            <h4 className={c.blockTitle}>{t.learningsTitle}</h4>
            <p>{t.learnings}</p>
            <TechList slugs={t.stack} />
            <div className={`${c.links} ${styles.links}`}>
              <a className="btn btn--ghost" href={projectLinks.unesc.frontend} target="_blank" rel="noopener noreferrer">
                <Icon name="github" />
                {l.frontend}
                <span className="sr-only">{dict.a11y.newTab}</span>
              </a>
              <a className="btn btn--ghost" href={projectLinks.unesc.backend} target="_blank" rel="noopener noreferrer">
                <Icon name="github" />
                {l.backend}
                <span className="sr-only">{dict.a11y.newTab}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
