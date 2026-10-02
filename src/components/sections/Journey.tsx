import type { Dictionary } from '@/i18n/types';
import { resume } from '@/content/site';
import { asset } from '@/lib/env';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Icon } from '@/components/ui/Icon';
import styles from './Journey.module.css';

export function Journey({ dict }: { dict: Dictionary }) {
  const t = dict.journey;
  return (
    <section id="trajetoria" data-section="trajetoria" className="section" aria-labelledby="trajetoria-title">
      <div className="container">
        <div className={styles.head}>
          <SectionLabel index={t.index} label={t.label} />
          <h2 id="trajetoria-title" className="section-title" data-reveal>
            {t.title}
          </h2>
          {resume ? (
            <a className="btn btn--ghost" href={asset(resume.href)} download hrefLang={resume.language}>
              {t.resume}
              <Icon name="arrowDown" data-arrow="down" />
            </a>
          ) : null}
        </div>

        <div className={styles.columns}>
          <div>
            <h3 className={`mono ${styles.colTitle}`}>{t.experienceTitle}</h3>
            <div className={styles.timeline} data-draw>
              <span className={styles.rail} aria-hidden="true" />
              <ol className={styles.entries}>
              {t.experience.map((job) => (
                <li key={job.org} className={styles.entry} data-reveal>
                  <span className={styles.node} aria-hidden="true" />
                  <p className={`mono ${styles.period}`}>{job.period}</p>
                  <h4 className={styles.role}>{job.role}</h4>
                  <p className={styles.org}>{job.org}</p>
                  <ul className={styles.points}>
                    {job.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </li>
              ))}
              </ol>
            </div>
          </div>

          <div>
            <h3 className={`mono ${styles.colTitle}`}>{t.educationTitle}</h3>
            <ul className={styles.education}>
              {t.education.map((e, i) => (
                <li key={e.title} data-reveal style={{ '--reveal-delay': i } as React.CSSProperties}>
                  <p className={`mono ${styles.period}`}>{e.period}</p>
                  <h4 className={styles.eduTitle}>{e.title}</h4>
                  <p className={styles.org}>
                    {e.org}
                    {e.note ? <span className={styles.eduNote}> · {e.note}</span> : null}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
