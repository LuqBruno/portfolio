import type { Dictionary } from '@/i18n/types';
import { person } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import styles from './Hero.module.css';

/**
 * Abertura — estúdio digital à noite.
 * Nome, apresentação e botões em HTML; retrato à frente da arte de vidro fumê
 * (ilustração renderizada, em alta resolução). No desktop, ScrollScenes fixa a seção:
 * o retrato recua, os planos de vidro ganham o palco e a frase conduz aos projetos.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const t = dict.hero;
  return (
    <section id="inicio" data-section="inicio" data-scene="opening" className={styles.hero} aria-labelledby="hero-title" data-tilt-zone data-offscreen-pause>
      <div className={styles.pin} data-o="pin">
        <div className={styles.room} aria-hidden="true">
          <div className={styles.beam} />
          <div className={styles.gridLines} />
          <div className={styles.ambient} />
        </div>

        <div className={`container ${styles.layout}`}>
          <div className={styles.content} data-o="copy">
            <p className={`mono ${styles.eyebrow}`} data-intro="3">
              <span className={styles.eyebrowRule} aria-hidden="true" />
              {t.eyebrow}
            </p>

            <h1 id="hero-title" className={styles.name}>
              <span className={styles.nameLine}>
                Bruno
              </span>{' '}
              <span className={`${styles.nameLine} ${styles.nameLast}`}>
                Luque<span className={styles.nameDot} aria-hidden="true" />
              </span>
            </h1>

            <p className={styles.headline}>
              {t.headline}
            </p>
            <p className={styles.intro}>
              {t.intro}
            </p>

            <div className={styles.ctas} data-intro="6">
              <a href="#projetos" className="btn btn--primary">
                {t.primary}
                <Icon name="arrowDown" data-arrow="down" />
              </a>
              <a href="#contato" className="btn btn--ghost">
                {t.secondary}
              </a>
            </div>

            <ul className={styles.meta} data-intro="6">
              <li>
                <a href={person.github} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                  <Icon name="github" />
                  <span>
                    {t.github} <span className={styles.handle}>/{person.githubHandle}</span>
                  </span>
                  <span className="sr-only">{dict.a11y.newTab}</span>
                  <Icon name="arrowUpRight" className={styles.metaArrow} />
                </a>
              </li>
              <li className={styles.metaPlace}>
                <Icon name="pin" />
                <span>{t.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Palco: composição de vidro fumê + retrato + frase (fixado no desktop e no celular) */}
        <div className={styles.stage} data-o="stage">
          <div className={styles.visual} data-o="visual">
            <div className={styles.glassStage} data-tilt="4" data-o="glass">
              <div className={styles.lightSource} aria-hidden="true" />
              <div className={styles.lightBar} aria-hidden="true" />
              <div className={`${styles.pane} ${styles.paneBack}`} data-o="paneBack" aria-hidden="true">
                <span className={styles.sheen} />
              </div>
              <div className={`${styles.pane} ${styles.paneMid}`} data-o="paneMid" aria-hidden="true">
                <span className={styles.sheen} />
                <svg className={styles.wire} viewBox="0 0 300 400" preserveAspectRatio="none">
                  <rect x="22" y="22" width="256" height="200" rx="6" />
                  <path d="M22 122h256M150 22v200" />
                  <circle cx="150" cy="122" r="74" />
                  <path d="M44 262h150M44 286h104M44 310h128" />
                  <circle cx="22" cy="22" r="2.5" className={styles.wireDot} />
                  <circle cx="278" cy="222" r="2.5" className={styles.wireDot} />
                </svg>
              </div>
              <svg className={`${styles.orbit} ${styles.orbitBack}`} viewBox="0 0 600 600" aria-hidden="true">
                <path className={styles.orbitPath} pathLength={1} d="M70 380C40 270 170 150 330 128c140-20 228 40 202 140" />
              </svg>
              <div className={styles.portrait} data-o="portrait">
                <div className={styles.portraitInner} data-intro="2">
                  <div className={styles.portraitGlow} aria-hidden="true" />
                  <Picture name="portrait/studio" alt={dict.about.portraitAlt} sizes="(min-width: 1024px) 40vw, 80vw" priority />
                </div>
              </div>
              <svg className={`${styles.orbit} ${styles.orbitFront}`} viewBox="0 0 600 600" aria-hidden="true">
                <path className={styles.orbitPath} pathLength={1} d="M532 268c-24 92-150 168-300 182-92 9-150-22-162-70" />
                <circle className={styles.orbitHead} cx="70" cy="380" r="4" />
              </svg>
              <div className={`${styles.pane} ${styles.paneFront}`} data-o="paneFront" aria-hidden="true">
                <span className={styles.sheen} />
                <span className={`mono ${styles.paneLabel}`}>{t.annotations.join(' · ')}</span>
              </div>
              <div className={styles.orb} aria-hidden="true">
                <span className={styles.orbCore} />
              </div>
            </div>
          </div>

          <div className={styles.phraseWrap} data-o="phrase">
            <p className={styles.phrase}>{t.phrase}</p>
            <a href="#projetos" className={`mono ${styles.cue}`}>
              {t.phraseCue}
              <Icon name="arrowDown" />
            </a>
          </div>
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span data-o="progress" />
        </div>
      </div>
    </section>
  );
}
