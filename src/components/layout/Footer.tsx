import type { Dictionary } from '@/i18n/types';
import { person } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import styles from './Footer.module.css';

export function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();
  const links = [
    { href: '#projetos', label: dict.nav.work },
    { href: '#sobre', label: dict.nav.about },
    { href: '#stack', label: dict.nav.stack },
    { href: '#trajetoria', label: dict.nav.journey },
    { href: '#contato', label: dict.nav.contact },
  ];
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.signature}>
          <p className={styles.name}>
            Bruno Luque<span aria-hidden="true" className={styles.dot} />
          </p>
          <p className={styles.role}>{dict.footer.role}</p>
        </div>

        <nav aria-label={dict.a11y.footerNav} className={styles.nav}>
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href={person.github} target="_blank" rel="noopener noreferrer">
                GitHub<span className="sr-only"> {dict.a11y.newTab}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.bottom}>
          <p className="mono">
            © <span>{year}</span> Bruno Luque · {dict.footer.note}
          </p>
          <a href="#inicio" className={styles.top}>
            <span>{dict.a11y.backToTop}</span>
            <span className={styles.topIcon} aria-hidden="true">
              <Icon name="arrowUp" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
