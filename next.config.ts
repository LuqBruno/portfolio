import type { NextConfig } from 'next';

/**
 * Exportação estática compatível com GitHub Pages.
 * - Em GitHub Actions, o subdiretório e o endereço são derivados do repositório
 *   (<usuario>.github.io/<repositorio>), sem supor domínio próprio.
 * - Localmente, use NEXT_PUBLIC_BASE_PATH / NEXT_PUBLIC_SITE_URL quando necessário.
 */
const repository = process.env.GITHUB_REPOSITORY ?? '';
const [owner = '', repo = ''] = repository.split('/');
const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const inferredBasePath = process.env.GITHUB_ACTIONS === 'true' && repo && !isUserSite ? `/${repo}` : '';
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? inferredBasePath).replace(/\/$/, '');
const inferredSiteUrl = process.env.GITHUB_ACTIONS === 'true' && owner ? `https://${owner.toLowerCase()}.github.io${basePath}` : '';
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || inferredSiteUrl).replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    SITE_ALLOW_INDEXING: process.env.SITE_ALLOW_INDEXING ?? 'false',
  },
};

export default nextConfig;
