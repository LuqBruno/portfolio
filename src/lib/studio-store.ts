/**
 * Estado compartilhado entre as sequências de rolagem (GSAP) e as cenas 3D (Three.js).
 * Valores normalizados; escritos por ScrollScenes e lidos a cada quadro pelo motor 3D.
 */
export const studio = {
  /** Progresso da abertura fixada (0 → 1). */
  hero: 0,
  /** Batida da apresentação de projetos (0 → BEATS - 1, contínuo). */
  beat: 0,
  /** Entrada das placas na abertura da apresentação (0 → 1). */
  enter: 0,
  /** Progresso da seção Sobre atravessando a tela (0 → 1). */
  about: 0,
  /** Progresso do contato entrando na tela (0 → 1). */
  contact: 0,
  /** Ponteiro normalizado (-1 → 1). */
  pointer: { x: 0, y: 0 },
};

/** Batidas da apresentação: Maréga 0–3 · Assistente 4–7 · UNESC 8–11. */
export const PROJECT_BEATS = 12;
export const CHAPTER_START = [0, 4, 8] as const;

export function chapterOf(beat: number): 0 | 1 | 2 {
  return beat < 3.5 ? 0 : beat < 7.5 ? 1 : 2;
}
