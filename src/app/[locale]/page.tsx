import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { personJsonLd } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Marquee } from '@/components/sections/Marquee';
import { About } from '@/components/sections/About';
import { Work } from '@/components/sections/Work';
import { Stack } from '@/components/sections/Stack';
import { Journey } from '@/components/sections/Journey';
import { Process } from '@/components/sections/Process';
import { Contact } from '@/components/sections/Contact';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <>
      <Header locale={locale} nav={dict.nav} a11y={dict.a11y} />
      <main id="conteudo" tabIndex={-1}>
        <Hero dict={dict} />
        <Work dict={dict} />
        <Marquee items={dict.marquee} />
        <About dict={dict} />
        <Stack dict={dict} />
        <Journey dict={dict} />
        <Process dict={dict} />
        <Contact dict={dict} />
      </main>
      <Footer dict={dict} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(locale, dict)).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
