import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from 'next/font/google';

// Fontes auto-hospedadas no build: nenhuma requisição ao Google durante a visita.
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['500'],
  preload: false,
});

export const fontVariables = `${bricolage.variable} ${manrope.variable} ${jetbrains.variable}`;
