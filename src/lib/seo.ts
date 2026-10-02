import type { Metadata } from 'next';
import { htmlLang, locales, ogLocale, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/types';
import { person } from '@/content/site';
import { allowIndexing, siteUrl } from './env';

export function localePath(locale: Locale): string {
  return `/${locale}/`;
}

export function buildMetadata(locale: Locale, dict: Dictionary): Metadata {
  const languages = Object.fromEntries(locales.map((l) => [htmlLang[l], localePath(l)]));
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    applicationName: person.name,
    authors: [{ name: person.name, url: person.github }],
    creator: person.name,
    metadataBase: siteUrl ? new URL(`${siteUrl}/`) : undefined,
    // Canonical e hreflang somente quando o endereço público está definido.
    alternates: siteUrl
      ? { canonical: localePath(locale), languages: { ...languages, 'x-default': localePath('pt-br') } }
      : undefined,
    robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'profile',
      firstName: person.givenName,
      lastName: person.familyName,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      siteName: person.name,
      url: siteUrl ? localePath(locale) : undefined,
      images: siteUrl ? [{ url: `og/og-${locale}.jpg`, width: 1200, height: 630, alt: dict.meta.ogAlt }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
      images: siteUrl ? [`og/og-${locale}.jpg`] : undefined,
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/** Dados estruturados (schema.org/Person) apenas com informações confirmadas. */
export function personJsonLd(locale: Locale, dict: Dictionary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    givenName: person.givenName,
    familyName: person.familyName,
    jobTitle: dict.footer.role,
    description: dict.meta.description,
    email: `mailto:${person.email}`,
    telephone: person.phoneE164,
    url: siteUrl ? `${siteUrl}${localePath(locale)}` : undefined,
    image: siteUrl ? `${siteUrl}/og/og-${locale}.jpg` : undefined,
    sameAs: [person.github],
    address: {
      '@type': 'PostalAddress',
      addressLocality: person.city,
      addressRegion: person.region,
      addressCountry: person.country,
    },
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'UNESC — Universidade do Extremo Sul Catarinense',
      url: person.universityUrl,
    },
    knowsAbout: ['Web development', 'Web design', 'Landing pages', 'React', 'Next.js', 'TypeScript', 'Visual identity'],
  };
}
