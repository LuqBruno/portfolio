import type { MetadataRoute } from 'next';
import { allowIndexing, siteUrl } from '@/lib/env';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
}
