import type { Dictionary } from '@/i18n/types';
import { SectionLabel } from '@/components/ui/SectionLabel';
import styles from './Process.module.css';

export function Process({ dict }: { dict: Dictionary }) {
  const t = dict.process;
  return (
    <section id="processo" data-section="processo" className={`section ${styles.process}`} aria-labelledby="processo-title">
      <div className="container">
        <SectionLabel index={t.index} label={t.label} />
        <h2 id="processo-title" className={`section-title ${styles.title}`} data-reveal>
          {t.title}
        </h2>
        <ol className={styles.steps} data-s="steps">
          {t.steps.map((step, i) => (
            <li key={step.title} className={styles.step} data-step={i}>
              <span className={styles.marker} aria-hidden="true">
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
