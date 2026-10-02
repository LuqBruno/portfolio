import type { Dictionary } from '@/i18n/types';
import { mailtoHref, person, telHref, whatsappHref } from '@/content/site';
import { Picture } from '@/components/ui/Picture';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Icon } from '@/components/ui/Icon';
import { CopyEmail } from './CopyEmail';
import styles from './Contact.module.css';

export function Contact({ dict }: { dict: Dictionary }) {
  const t = dict.contact;
  return (
    <section id="contato" data-section="contato" className={`section ${styles.contact}`} aria-labelledby="contato-title">
      <div className={styles.art} data-3d="contact" aria-hidden="true">
        <div className={styles.still}>
          <Picture name="art/ribbon" alt="" sizes="100vw" />
        </div>
      </div>
      <div className={`container ${styles.inner}`}>
        <SectionLabel index={t.index} label={t.label} />
        <h2 id="contato-title" className={styles.title} data-reveal>
          {t.title}
        </h2>
        <p className={styles.text} data-reveal>
          {t.text}
        </p>

        <div className={styles.actions} data-reveal>
          <a className="btn btn--primary" href={whatsappHref(t.whatsappMessage)} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" />
            {t.whatsapp}
            <span className="sr-only">{dict.a11y.newTab}</span>
          </a>
          <CopyEmail email={person.email} labels={{ copy: t.copy, copied: t.copied, failed: t.copyFailed }} />
        </div>

        <ul className={styles.channels} data-reveal>
          <li>
            <a href={mailtoHref} className={styles.channel}>
              <span className={`mono ${styles.channelLabel}`}>{t.email}</span>
              <span className={styles.channelValue}>{person.email}</span>
              <Icon name="arrowUpRight" className={styles.channelArrow} />
            </a>
          </li>
          <li>
            <a href={telHref} className={styles.channel}>
              <span className={`mono ${styles.channelLabel}`}>{t.phone}</span>
              <span className={styles.channelValue}>{person.phoneDisplay}</span>
              <Icon name="arrowUpRight" className={styles.channelArrow} />
            </a>
          </li>
          <li>
            <a href={person.github} target="_blank" rel="noopener noreferrer" className={styles.channel}>
              <span className={`mono ${styles.channelLabel}`}>{t.github}</span>
              <span className={styles.channelValue}>github.com/{person.githubHandle}</span>
              <span className="sr-only">{dict.a11y.newTab}</span>
              <Icon name="arrowUpRight" className={styles.channelArrow} />
            </a>
          </li>
          <li>
            <div className={styles.channel}>
              <span className={`mono ${styles.channelLabel}`}>{t.location}</span>
              <span className={styles.channelValue}>{dict.hero.location}</span>
              <Icon name="pin" className={styles.channelArrow} />
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
