import type { Dictionary } from '@/i18n/types';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StackInstallation } from './StackInstallation';
import styles from './Stack.module.css';

export function Stack({ dict }: { dict: Dictionary }) {
  const t = dict.stack;
  return (
    <section id="stack" data-section="stack" className={`section ${styles.stack}`} aria-labelledby="stack-title">
      <div className={styles.light} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <SectionLabel index={t.index} label={t.label} />
          <h2 id="stack-title" className="section-title" data-reveal>
            {t.title}
          </h2>
          <p className={styles.intro} data-reveal>
            {t.intro}
          </p>
        </div>

        <StackInstallation
          t={t}
          projectNames={{ marega: dict.work.marega.name, assistant: dict.work.assistant.name, unesc: dict.work.unesc.name, portfolio: t.portfolio }}
        />
      </div>
    </section>
  );
}
