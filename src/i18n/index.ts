import { ptBR } from './dictionaries/pt-br';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import type { Dictionary } from './types';
import type { Locale } from './config';

const dictionaries: Record<Locale, Dictionary> = { 'pt-br': ptBR as unknown as Dictionary, en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary, Locale };
