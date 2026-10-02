import type { Dictionary } from '@/i18n/types';
import { Icon, type IconName } from '@/components/ui/Icon';
import { CaseHeader } from './CaseHeader';
import { TechList } from '@/components/ui/TechList';
import c from './Case.module.css';
import styles from './AssistantCase.module.css';

const stateIcons: IconName[] = ['circleCheck', 'plug', 'compass'];

export function AssistantCase({ dict }: { dict: Dictionary }) {
  const t = dict.work.assistant;
  const l = dict.work.labels;
  const a = t.architecture;
  return (
    <article id="case-assistente" className={`${c.case} ${styles.assistant}`} aria-labelledby="assistant-title">
      <div className={styles.ambient} aria-hidden="true" />
      <div className="container">
        <CaseHeader
          id="assistant-title"
          number={t.number}
          kind={t.kind}
          name={t.name}
          tagline={`${t.subtitle} — ${t.tagline}`}
          summary={t.summary}
          meta={[
            { label: l.category, value: t.category },
            { label: l.context, value: t.context },
            { label: l.status, value: t.status },
          ]}
        />

        <div className={styles.intro}>
          <div className={styles.problem}>
            <div className={c.block} data-reveal>
              <h4 className={c.blockTitle}>{t.problemTitle}</h4>
              <p>{t.problem}</p>
            </div>
            <div className={c.block} data-reveal>
              <h4 className={c.blockTitle}>{t.solutionTitle}</h4>
              <p>{t.solution}</p>
            </div>
            <div className={`${c.block} ${styles.orbText}`} data-reveal>
              <h4 className={c.blockTitle}>{t.orb.title}</h4>
              <p>{t.orb.text}</p>
            </div>
          </div>
        </div>

        <details className={c.details} open>
          <summary className={c.summaryBtn}>
            <span>
              <span className={c.whenClosed}>{l.more}</span>
              <span className={c.whenOpen}>{l.less}</span>
            </span>
            <span className={c.summaryIcon} aria-hidden="true">
              <Icon name="plus" />
            </span>
          </summary>

          <div className={c.detailsBody}>
            {/* Módulos */}
            <section aria-labelledby="assistant-modules">
              <h4 id="assistant-modules" className={c.subTitle}>
                {t.modulesTitle}
              </h4>
              <p className={styles.lead}>{t.modulesIntro}</p>
              <div className={styles.modules}>
                {t.modules.map((m, i) => (
                  <div key={m.name} className={`${c.glass} ${styles.module}`}>
                    <p className={`mono ${styles.moduleIndex}`}>
                      {String(i + 1).padStart(2, '0')} · {m.tech}
                    </p>
                    <h5 className={styles.moduleName}>{m.name}</h5>
                    <ul className={c.list}>
                      {m.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Arquitetura */}
            <section aria-labelledby="assistant-arch">
              <h4 id="assistant-arch" className={c.subTitle}>
                {t.architectureTitle}
              </h4>
              <figure className={styles.arch}>
                <div className={`${styles.node} ${styles.nodeDesktop}`}>
                  <strong>{a.desktop.title}</strong>
                  <span>{a.desktop.detail}</span>
                </div>
                <ol className={styles.flow}>
                  <li className={styles.node}>
                    <strong>{a.crm.title}</strong>
                    <span>{a.crm.detail}</span>
                    <em className={styles.store}>{a.crmDb}</em>
                  </li>
                  <li className={`${styles.node} ${styles.nodeBridge}`}>
                    <strong>{a.bridge.title}</strong>
                    <span>{a.bridge.detail}</span>
                  </li>
                  <li className={styles.node}>
                    <strong>{a.service.title}</strong>
                    <span>{a.service.detail}</span>
                    <em className={styles.store}>{a.serviceDb}</em>
                    <em className={styles.voice}>
                      <b>{a.voice.title}</b> {a.voice.detail}
                    </em>
                  </li>
                  <li className={`${styles.node} ${styles.nodeModel}`}>
                    <strong>{a.model.title}</strong>
                    <span>{a.model.detail}</span>
                  </li>
                </ol>
                <figcaption className={c.note}>{a.caption}</figcaption>
              </figure>
            </section>

            {/* Decisões */}
            <section aria-labelledby="assistant-decisions">
              <h4 id="assistant-decisions" className={c.subTitle}>
                {t.decisionsTitle}
              </h4>
              <ol className={styles.decisions}>
                {t.decisions.map((d, i) => (
                  <li key={d.title}>
                    <span className="mono" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h5>{d.title}</h5>
                    <p>{d.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Tecnologias por função */}
            <section aria-labelledby="assistant-tech">
              <h4 id="assistant-tech" className={c.subTitle}>
                {t.techTitle}
              </h4>
              <dl className={styles.tech}>
                {t.techGroups.map((g) => (
                  <div key={g.label}>
                    <dt className="mono">{g.label}</dt>
                    <dd>
                      <TechList slugs={g.items} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Estado atual */}
            <section aria-labelledby="assistant-state">
              <h4 id="assistant-state" className={c.subTitle}>
                {t.stateTitle}
              </h4>
              <div className={styles.states}>
                {t.states.map((s, i) => (
                  <div key={s.label} className={`${c.glass} ${styles.state}`} data-tier={i}>
                    <p className={styles.stateLabel}>
                      <Icon name={stateIcons[i]} />
                      {s.label}
                    </p>
                    <ul className={c.list}>
                      {s.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className={styles.fine}>
                <p>{t.limits}</p>
                <p>{t.verification}</p>
                <p className={c.note}>
                  <Icon name="lock" />
                  {t.privateNote}
                </p>
              </div>
            </section>
          </div>
        </details>
      </div>
    </article>
  );
}
