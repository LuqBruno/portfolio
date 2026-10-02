import styles from './Marquee.module.css';

/** Faixa de disciplinas. Lista real para leitores de tela; cópia duplicada apenas visual. */
export function Marquee({ items }: { items: string[] }) {
  return (
    <div className={styles.marquee} data-offscreen-pause>
      <ul className={styles.track}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <ul className={styles.track} aria-hidden="true">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
