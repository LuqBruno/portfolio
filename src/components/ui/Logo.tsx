import styles from './Logo.module.css';

/**
 * Marca de Bruno Luque (símbolo angular B+L). Vetor inline, decorativo: o nome fica em HTML ao lado.
 * Geometria fiel ao arquivo original (public/brand/logo-bruno-luque.svg) — não deformar nem redesenhar.
 */
export function LogoMark({ className, tone = 'violet' }: { className?: string; tone?: 'violet' | 'light' }) {
  return (
    <svg
      className={`${styles.mark} ${tone === 'light' ? styles.light : ''} ${className ?? ''}`}
      viewBox="60 10 220 300"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.base} d="M94.25 30 132.75 50.5V252h109L211 288.25H94.25Z" />
      <path className={styles.cut} d="m138 53.75 81.75 45.5V141l-34.25 20.75 34.25 20.75v45.25L185.5 247.5H138v-16.25l47.5-25.5L138 177.25V152.5l48.25-27L138 95.5Z" />
    </svg>
  );
}
