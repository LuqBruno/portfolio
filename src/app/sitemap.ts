import type { MetadataRoute } from 'next';
import { htmlLang, locales } from '@/i18n/config';
import { allowIndexing, siteUrl } from '@/lib/env';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing) return [];
  const languages = Object.fromEntries(locales.map((l) => [htmlLang[l], `${siteUrl}/${l}/`]));
  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}/`,
    changeFrequency: 'monthly',
    priority: locale === 'pt-br' ? 1 : 0.8,
    alternates: { languages },
  }));
}
