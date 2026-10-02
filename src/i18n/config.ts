export const locales = ['pt-br', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-br';

/** Atributo lang / hreflang (BCP 47). */
export const htmlLang: Record<Locale, string> = { 'pt-br': 'pt-BR', en: 'en', es: 'es' };
export const ogLocale: Record<Locale, string> = { 'pt-br': 'pt_BR', en: 'en_US', es: 'es_ES' };
export const shortLabel: Record<Locale, string> = { 'pt-br': 'PT', en: 'EN', es: 'ES' };

export const LOCALE_STORAGE_KEY = 'bl-locale';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** IDs de seção compartilhados entre idiomas — a troca de idioma preserva a âncora. */
export const sectionIds = ['inicio', 'projetos', 'sobre', 'stack', 'trajetoria', 'processo', 'contato'] as const;
export type SectionId = (typeof sectionIds)[number];
