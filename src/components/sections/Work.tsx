import type { Dictionary } from '@/i18n/types';
import { person } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { Showcase } from './Showcase';
import { MaregaCase } from '@/components/cases/MaregaCase';
import { AssistantCase } from '@/components/cases/AssistantCase';
import { UnescCase } from '@/components/cases/UnescCase';
import styles from './Work.module.css';

export function Work({ dict }: { dict: Dictionary }) {
  const t = dict.work;
  return (
    <section id="projetos" data-section="projetos" className={styles.work} aria-labelledby="projetos-title">
      <Showcase dict={dict} />

      <MaregaCase dict={dict} />
      <AssistantCase dict={dict} />
      <UnescCase dict={dict} />

      <div className="container">
        <a href={person.github} target="_blank" rel="noopener noreferrer" className={styles.github} data-reveal>
          <span className={styles.githubIcon} aria-hidden="true">
            <Icon name="github" />
          </span>
          <span className={styles.githubText}>
            <strong>{t.github.title}</strong>
            <span>{t.github.text}</span>
          </span>
          <span className={`mono ${styles.githubCta}`}>
            {t.github.cta} <Icon name="arrowUpRight" />
          </span>
          <span className="sr-only">{dict.a11y.newTab}</span>
        </a>
      </div>
    </section>
  );
}
