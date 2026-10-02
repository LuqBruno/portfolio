import type { ptBR } from './dictionaries/pt-br';

/** Converte literais em string e torna arrays mutáveis, mantendo a forma exata do dicionário. */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type Dictionary = Widen<typeof ptBR>;
