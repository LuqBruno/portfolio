import styles from './Case.module.css';

type Meta = { label: string; value: string };

/** Cabeçalho editorial comum aos cases: número, natureza do projeto, nome, linha de apoio e metadados. */
export function CaseHeader({
  id,
  number,
  kind,
  name,
  tagline,
  meta,
  summary,
}: {
  id: string;
  number: string;
  kind: string;
  name: string;
  tagline: string;
  meta: Meta[];
  summary: string;
}) {
  return (
    <header className={styles.head}>
      <div className={styles.headTop} data-reveal>
        <span className={`mono ${styles.number}`} aria-hidden="true">
          {number}
        </span>
        <span className={`mono badge`}>{kind}</span>
      </div>
      <h3 id={id} className={styles.name} data-reveal>
        {name}
      </h3>
      <p className={styles.tagline} data-reveal>
        {tagline}
      </p>
      <div className={styles.headBody}>
        <p className={styles.summary} data-reveal>
          {summary}
        </p>
        <dl className={styles.meta} data-reveal>
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="mono">{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
