'use client';

import { useEffect } from 'react';
import { studio, PROJECT_BEATS, CHAPTER_START, chapterOf } from '@/lib/studio-store';

/**
 * Sequências fixadas, sincronizadas com a rolagem (GSAP + ScrollTrigger, carregados sob demanda).
 * Ativas somente no desktop com movimento permitido; nos demais casos o conteúdo segue em
 * sequência vertical, completo. Funcionam ao avançar e ao voltar, após redimensionar e após
 * trocar de idioma (a página é reconstruída e a âncora da seção é restaurada).
 */
export function ScrollScenes() {
  useEffect(() => {
    let cancelled = false;
    let revert: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const root = document.documentElement;
      const mm = gsap.matchMedia();

      // Progresso do Sobre e do Contato (cenas 3D) — em qualquer largura com movimento permitido
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const about = document.getElementById('sobre');
        const contact = document.getElementById('contato');
        const triggers = [
          about &&
            ScrollTrigger.create({
              trigger: about,
              start: 'top 85%',
              end: 'bottom 30%',
              onUpdate: (self) => (studio.about = self.progress),
            }),
          contact &&
            ScrollTrigger.create({
              trigger: contact,
              start: 'top 90%',
              end: 'top 20%',
              onUpdate: (self) => (studio.contact = self.progress),
            }),
        ];
        return () => triggers.forEach((t) => t && t.kill());
      });

      mm.add('(min-width: 860px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)', () => {
        root.classList.add('scenes-desktop');
        const cleanups: Array<() => void> = [];

        // ---------------- Abertura ----------------
        const opening = document.querySelector<HTMLElement>('[data-scene="opening"]');
        if (opening) {
          const q = (k: string) => opening.querySelector<HTMLElement>(`[data-o="${k}"]`);
          const pin = q('pin');
          const copy = q('copy');
          const visual = q('visual');
          const phrase = q('phrase');
          const portrait = q('portrait');
          const glass = q('glass');
          const paneBack = q('paneBack');
          const paneMid = q('paneMid');
          const paneFront = q('paneFront');
          const bar = q('progress');
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: opening,
              pin,
              start: 'top top',
              end: '+=210%',
              scrub: 0.7,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                studio.hero = self.progress;
                if (bar) bar.style.transform = `scaleX(${self.progress})`;
              },
            },
          });
          // 1) retrato e nome em destaque; 2) o retrato recua e os planos de vidro ganham o palco
          tl.to({}, { duration: 0.6 })
            .fromTo(portrait, { autoAlpha: 1, y: 0, scale: 1 }, { autoAlpha: 0, y: 80, scale: 0.94, duration: 0.6, ease: 'power1.in', immediateRender: false }, 0.35)
            .fromTo(copy, { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: -70, duration: 0.7, ease: 'power1.in', immediateRender: false }, 0.45)
            .to(visual, { left: '0%', duration: 0.8, ease: 'power2.inOut' }, 0.45)
            // os planos de vidro se afastam e a composição se aproxima
            .fromTo(paneBack, { '--px': '0px', '--py': '0px' }, { '--px': '110px', '--py': '-30px', duration: 1.1, ease: 'power2.inOut', immediateRender: false }, 0.35)
            .fromTo(paneMid, { '--px': '0px', '--py': '0px' }, { '--px': '-90px', '--py': '10px', duration: 1.1, ease: 'power2.inOut', immediateRender: false }, 0.35)
            .fromTo(paneFront, { '--px': '0px', '--py': '0px' }, { '--px': '-40px', '--py': '70px', duration: 1.1, ease: 'power2.inOut', immediateRender: false }, 0.35)
            .fromTo(glass, { '--zoom': 1 }, { '--zoom': 1.12, duration: 1.4, ease: 'power1.inOut', immediateRender: false }, 0.4)
            // 3) a frase surge; a cena cede espaço à esquerda
            .to(visual, { left: '38%', duration: 0.7, ease: 'power2.inOut' }, 1.3)
            .fromTo(phrase, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.45)
            // 4) a composição se abre para os projetos
            .to(glass, { '--zoom': 1.2, duration: 0.8, ease: 'power1.inOut' }, 1.4)
            .to(phrase, { autoAlpha: 0, y: -50, duration: 0.5, ease: 'power1.in' }, 2.15)
            .to(glass, { autoAlpha: 0.45, yPercent: -10, duration: 0.6, ease: 'power1.in' }, 2.2);
          cleanups.push(() => tl.scrollTrigger?.kill(), () => tl.kill());
        }

        return () => {
          cleanups.forEach((fn) => fn());
          root.classList.remove('scenes-desktop');
        };
      });

      // ---------------- Abertura (celular): o palco da arte e do retrato fica fixado ----------------
      mm.add('(prefers-reduced-motion: no-preference) and ((max-width: 859px) or (max-height: 559px))', () => {
        root.classList.add('scenes-mobile');
        const opening = document.querySelector<HTMLElement>('[data-scene="opening"]');
        const q = (k: string) => opening?.querySelector<HTMLElement>(`[data-o="${k}"]`) ?? null;
        const stage = q('stage');
        if (!stage) return () => root.classList.remove('scenes-mobile');
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: stage, pin: stage, pinSpacing: true, start: 'top top', end: '+=150%', scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
        });
        tl.fromTo(q('portrait'), { autoAlpha: 1, y: 0, scale: 1 }, { autoAlpha: 0, y: 60, scale: 0.92, duration: 0.6, ease: 'power1.in', immediateRender: false }, 0.15)
          .fromTo(q('paneBack'), { '--px': '0px' }, { '--px': '60px', duration: 1, ease: 'power2.inOut', immediateRender: false }, 0.1)
          .fromTo(q('paneMid'), { '--px': '0px' }, { '--px': '-50px', duration: 1, ease: 'power2.inOut', immediateRender: false }, 0.1)
          .fromTo(q('glass'), { '--zoom': 1 }, { '--zoom': 1.15, duration: 1.2, ease: 'power1.inOut', immediateRender: false }, 0.1)
          .fromTo(q('phrase'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, 0.7)
          .to(q('phrase'), { autoAlpha: 0, y: -30, duration: 0.4, ease: 'power1.in' }, 1.5)
          .to(q('glass'), { autoAlpha: 0.2, duration: 0.4 }, 1.55);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          root.classList.remove('scenes-mobile');
        };
      });

      // ---------------- Projetos: apresentação fixada em qualquer largura ----------------
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        root.classList.add('scenes-on');
        const cleanups: Array<() => void> = [];

        // ---------------- Projetos ----------------
        const show = document.querySelector<HTMLElement>('[data-scene="showcase"]');
        if (show) {
          const pin = show.querySelector<HTMLElement>('[data-s="pin"]');
          const chapters = Array.from(show.querySelectorAll<HTMLElement>('[data-chapter]'));
          const subs = Array.from(show.querySelectorAll<HTMLElement>('[data-beat]'));
          const shots = Array.from(show.querySelectorAll<HTMLElement>('[data-beats]'));
          const counter = show.querySelector<HTMLElement>('[data-s="current"]');
          const bar = show.querySelector<HTMLElement>('[data-s="bar"]');
          const live = show.querySelector<HTMLElement>('[data-s="live"]');
          const tabs = Array.from(show.querySelectorAll<HTMLButtonElement>('[data-goto]'));
          const intro = show.querySelector<HTMLElement>('[data-s="intro"]');
          const chaptersWrap = show.querySelector<HTMLElement>('[data-s="chapters"]');
          const nav = show.querySelector<HTMLElement>('[data-s="nav"]');
          // A apresentação começa pelo título (unidade de abertura) e segue pelas batidas
          const INTRO = 1.4;
          const UNITS = INTRO + PROJECT_BEATS - 1;
          let current = -1;
          let currentBeat = -1;

          gsap.set(chapters.slice(1), { autoAlpha: 0, y: 30 });
          chapters[0]?.setAttribute('data-active', '');

          const setChapter = (index: number) => {
            if (index === current) return;
            const prev = chapters[current];
            const next = chapters[index];
            current = index;
            if (prev) {
              prev.removeAttribute('data-active');
              gsap.to(prev, { autoAlpha: 0, y: -24, duration: 0.25, ease: 'power2.in', overwrite: true });
            }
            if (next) {
              next.setAttribute('data-active', '');
              gsap.fromTo(next, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.28, ease: 'power2.out', overwrite: true });
            }
            tabs.forEach((t, i) => t.setAttribute('aria-pressed', String(i === index)));
            if (counter) counter.textContent = String(index + 1).padStart(2, '0');
            if (live?.dataset.template)
              live.textContent = live.dataset.template.replace('{current}', String(index + 1)).replace('{total}', String(chapters.length));
          };

          const setBeat = (beat: number) => {
            if (beat === currentBeat) return;
            currentBeat = beat;
            subs.forEach((el) => el.toggleAttribute('data-current', Number(el.dataset.beat) === beat));
            shots.forEach((el) => el.toggleAttribute('data-current', (el.dataset.beats ?? '').split(' ').includes(String(beat))));
            // Estados ilustrativos da esfera (capítulo do assistente)
            if (beat >= CHAPTER_START[1] && beat < CHAPTER_START[2]) {
              const state = (['ready', 'listening', 'thinking', 'speaking'] as const)[beat - CHAPTER_START[1]];
              window.dispatchEvent(new CustomEvent('bl:orb-state', { detail: state }));
            }
          };

          const apply = (progress: number) => {
            const u = progress * UNITS;
            const introP = Math.min(1, u / INTRO);
            const beat = Math.max(0, u - INTRO);
            studio.beat = beat;
            studio.enter = Math.min(1, Math.max(0, (u - 0.25) / 0.95));
            if (intro) {
              const k = Math.min(1, Math.max(0, (introP - 0.1) / 0.5));
              intro.style.opacity = String(1 - k);
              intro.style.transform = `translate3d(${-60 * k}px, ${-40 * k}px, 0) scale(${1 - 0.06 * k})`;
              intro.style.visibility = k >= 1 ? 'hidden' : 'visible';
            }
            const show01 = Math.min(1, Math.max(0, (introP - 0.6) / 0.4));
            if (chaptersWrap) chaptersWrap.style.opacity = String(show01);
            if (nav) nav.style.opacity = String(show01);
            if (bar) bar.style.transform = `scaleX(${progress})`;
            setChapter(chapterOf(beat));
            setBeat(Math.round(beat));
          };

          const st = ScrollTrigger.create({
            trigger: show,
            pin,
            start: 'top top',
            end: () => `+=${window.innerHeight * 0.55 * UNITS}`,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => apply(self.progress),
          });
          apply(0);
          setChapter(0);
          setBeat(0);

          const scrollToBeat = (beat: number) => {
            const y = st.start + ((st.end - st.start) * (INTRO + beat)) / UNITS;
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: y + 1, behavior: reduce ? 'auto' : 'smooth' });
          };
          const onTab = (e: Event) => {
            const i = Number((e.currentTarget as HTMLElement).dataset.goto);
            scrollToBeat(CHAPTER_START[i] ?? 0);
          };
          tabs.forEach((t) => t.addEventListener('click', onTab));
          // Foco por teclado em um capítulo inativo posiciona a rolagem nele
          const onFocus = (e: FocusEvent) => {
            const chapter = (e.target as HTMLElement).closest<HTMLElement>('[data-chapter]');
            if (!chapter || chapter.hasAttribute('data-active')) return;
            scrollToBeat(CHAPTER_START[Number(chapter.dataset.chapter)] ?? 0);
          };
          show.addEventListener('focusin', onFocus);
          cleanups.push(() => {
            tabs.forEach((t) => t.removeEventListener('click', onTab));
            show.removeEventListener('focusin', onFocus);
            st.kill();
            gsap.set(chapters, { clearProps: 'all' });
            [intro, chaptersWrap, nav].forEach((el) => el?.removeAttribute('style'));
            chapters.forEach((c) => c.removeAttribute('data-active'));
          });
        }

        // Recalcula após fontes e imagens; restaura a âncora (ex.: após trocar de idioma)
        const refresh = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(refresh).catch(() => {});
        window.addEventListener('load', refresh, { once: true });
        if (location.hash) {
          const target = document.getElementById(location.hash.slice(1));
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            target?.scrollIntoView({ behavior: 'auto' });
          });
        }

        // ---------------- Como trabalho: etapas acendem em sequência ----------------
        const process = document.getElementById('processo');
        if (process) {
          const steps = Array.from(process.querySelectorAll<HTMLElement>('[data-step]'));
          const line = process.querySelector<HTMLElement>('[data-s="steps"]');
          const pst = ScrollTrigger.create({
            trigger: process,
            pin: true,
            pinSpacing: true,
            start: 'top top',
            end: '+=120%',
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              line?.style.setProperty('--draw', String(Math.min(1, p * 1.1)));
              steps.forEach((el, i) => el.toggleAttribute('data-lit', p >= i / steps.length - 0.02));
            },
          });
          steps.forEach((el) => el.toggleAttribute('data-lit', false));
          steps[0]?.toggleAttribute('data-lit', true);
          cleanups.push(() => {
            pst.kill();
            steps.forEach((el) => el.removeAttribute('data-lit'));
          });
        }

        return () => {
          cleanups.forEach((fn) => fn());
          root.classList.remove('scenes-on');
        };
      });

      // Ordem de cálculo pela posição na página (fixações acima afetam as de baixo)
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      revert = () => mm.revert();
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return null;
}
