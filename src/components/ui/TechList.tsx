import { resolveTech } from '@/content/tech';
import { asset } from '@/lib/env';
import styles from './TechList.module.css';

/**
 * Etiquetas de tecnologia com ícone claro (decorativo: o nome fica sempre visível ao lado).
 * Aceita slugs do catálogo ou nomes; nomes sem ícone aparecem como texto.
 */
export function TechList({ slugs, size = 'sm', className }: { slugs: readonly string[]; size?: 'sm' | 'md'; className?: string }) {
  return (
    <ul className={`${styles.list} ${size === 'md' ? styles.md : ''} ${className ?? ''}`}>
      {slugs.map((value) => {
        const t = resolveTech(value);
        return (
          <li key={value} className={styles.item}>
            {t.slug ? (
              // eslint-disable-next-line @next/next/no-img-element -- SVG local decorativo
              <img src={asset(`/images/stack/${t.slug}-claro.svg`)} alt="" width={20} height={20} loading="lazy" decoding="async" className={styles.icon} />
            ) : null}
            <span>{t.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
