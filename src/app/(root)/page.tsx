import type { Metadata } from 'next';
import { defaultLocale, locales, LOCALE_STORAGE_KEY } from '@/i18n/config';
import { siteUrl } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Bruno Luque — Desenvolvedor Web & Designer',
  robots: { index: false, follow: true },
  alternates: siteUrl ? { canonical: `${siteUrl}/${defaultLocale}/` } : undefined,
};

// Entrada raiz: idioma salvo ou, sem preferência, português. Caminho relativo funciona em qualquer subdiretório.
const redirect = `(function(){var l='${defaultLocale}';try{var s=localStorage.getItem('${LOCALE_STORAGE_KEY}');if(${JSON.stringify(
  locales,
)}.indexOf(s)>-1)l=s}catch(e){}location.replace(l+'/'+location.hash)})()`;

const linkStyle = { color: '#c4b5fd' } as const;

export default function RootEntry() {
  return (
    <>
      <meta httpEquiv="refresh" content={`2; url=${defaultLocale}/`} />
      <script dangerouslySetInnerHTML={{ __html: redirect }} />
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ display: 'flex', gap: 20 }}>
          <a style={linkStyle} href={`${defaultLocale}/`} hrefLang="pt-BR">
            Português
          </a>
          <a style={linkStyle} href="en/" hrefLang="en">
            English
          </a>
          <a style={linkStyle} href="es/" hrefLang="es">
            Español
          </a>
        </p>
      </main>
    </>
  );
}
