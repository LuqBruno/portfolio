'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { locales, shortLabel, htmlLang, LOCALE_STORAGE_KEY, type Locale, type SectionId } from '@/i18n/config';
import type { Dictionary } from '@/i18n/types';
import { asset } from '@/lib/env';
import { Icon } from '@/components/ui/Icon';
import { LogoMark } from '@/components/ui/Logo';
import styles from './Header.module.css';

type Props = {
  locale: Locale;
  nav: Dictionary['nav'];
  a11y: Dictionary['a11y'];
};

const navItems: Array<{ id: SectionId; key: keyof Omit<Dictionary['nav'], 'cta'> }> = [
  { id: 'inicio', key: 'home' },
  { id: 'projetos', key: 'work' },
  { id: 'sobre', key: 'about' },
  { id: 'stack', key: 'stack' },
  { id: 'trajetoria', key: 'journey' },
  { id: 'contato', key: 'contact' },
];

/**
 * Seção atual — destaque do menu e âncora preservada ao trocar de idioma.
 * Vale a última seção cujo topo já passou de 40% da tela; no fim da página, a última seção
 * (o Contato é curto e nunca chega ao meio da tela).
 */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('inicio');
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
      if (atEnd) current = sections[sections.length - 1];
      if (current) setActive(current.dataset.section as SectionId);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);
  return active;
}

function LanguageSwitcher({ locale, a11y, section, onNavigate }: { locale: Locale; a11y: Dictionary['a11y']; section: SectionId; onNavigate?: () => void }) {
  const go = (event: React.MouseEvent<HTMLAnchorElement>, target: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, target);
    } catch {
      /* armazenamento indisponível: a navegação segue normalmente */
    }
    if (target === locale) {
      event.preventDefault();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    onNavigate?.();
    const href = event.currentTarget.href;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    document.documentElement.classList.add('is-leaving');
    window.setTimeout(() => window.location.assign(href), 180);
  };
  return (
    <nav className={styles.lang} aria-label={a11y.language}>
      <ul>
        {locales.map((l) => {
          const current = l === locale;
          const hash = section === 'inicio' ? '' : `#${section}`;
          return (
            <li key={l}>
              <a
                href={`${asset(`/${l}/`)}${hash}`}
                hrefLang={htmlLang[l]}
                lang={htmlLang[l]}
                aria-current={current ? 'true' : undefined}
                className={current ? styles.langActive : undefined}
                onClick={(e) => go(e, l)}
              >
                <span aria-hidden="true">{shortLabel[l]}</span>
                <span className="sr-only">
                  {a11y.languageNames[l]}
                  {current ? ` — ${a11y.currentLanguage}` : ''}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Header({ locale, nav, a11y }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Menu móvel: Escape fecha, foco preso no painel, rolagem do fundo bloqueada.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter((el) => el.offsetParent !== null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [toggleRef.current!, ...focusables()];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) close(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    document.body.style.overflow = 'hidden';
    focusables()[0]?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <div className={`container ${styles.bar}`}>
        <a href="#inicio" className={styles.brand} aria-label={a11y.homeLink} onClick={() => open && close(false)}>
          <LogoMark className={styles.logo} />
          <span className={styles.brandName} aria-hidden="true">
            Bruno Luque
          </span>
        </a>

        <nav className={styles.nav} aria-label={a11y.mainNav}>
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined}>
                  {nav[item.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher locale={locale} a11y={a11y} section={active} />
          <a href="#contato" className={`btn btn--primary ${styles.cta}`}>
            {nav.cta}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="menu-movel"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? a11y.closeMenu : a11y.openMenu}</span>
            <span className={styles.toggleLines} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div id="menu-movel" ref={panelRef} className={styles.panel} hidden={!open}>
        <div className={`container ${styles.panelInner}`}>
          <nav aria-label={a11y.mainNav}>
            <ol className={styles.panelNav}>
              {navItems.map((item, i) => (
                <li key={item.id} style={{ '--i': i } as React.CSSProperties}>
                  <a href={`#${item.id}`} onClick={() => close(false)} aria-current={active === item.id ? 'location' : undefined}>
                    <span className="mono" aria-hidden="true">
                      {String(i).padStart(2, '0')}
                    </span>
                    {nav[item.key]}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className={styles.panelFoot}>
            <LanguageSwitcher locale={locale} a11y={a11y} section={active} onNavigate={() => close(false)} />
            <a href="#contato" className="btn btn--primary" onClick={() => close(false)}>
              {nav.cta}
              <Icon name="arrowDown" data-arrow="down" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
