import type { Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/globals.css';
import { htmlLang, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { buildMetadata } from '@/lib/seo';
import { fontVariables } from '@/lib/fonts';
import { MotionController } from '@/components/motion/MotionController';
import { ScrollScenes } from '@/components/motion/ScrollScenes';
import { PageRail } from '@/components/motion/PageRail';
import { StudioCanvas } from '@/components/three/StudioCanvas';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata(locale, getDictionary(locale));
}

export const viewport: Viewport = {
  themeColor: '#08080b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

// Marca a presença de JS antes da pintura. Se o bundle falhar, todo o conteúdo é revelado após 2,5 s.
const bootScript =
  "(function(d){var e=d.documentElement;e.classList.add('js');window.__blReveal=setTimeout(function(){e.classList.add('reveal-all')},2500)})(document)";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <html lang={htmlLang[locale]} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <StudioCanvas />
        <a className="skip-link" href="#conteudo">
          {dict.a11y.skip}
        </a>
        {children}
        <div className="grain" aria-hidden="true" />
        <MotionController />
        <ScrollScenes />
        <PageRail />
      </body>
    </html>
  );
}
