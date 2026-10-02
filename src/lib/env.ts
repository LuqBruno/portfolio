export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
export const allowIndexing = process.env.SITE_ALLOW_INDEXING === 'true' && siteUrl !== '';

/** Prefixa caminhos públicos com o subdiretório de publicação (GitHub Pages). */
export function asset(path: string): string {
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
}

/** URL absoluta quando o endereço final está definido; caso contrário, caminho relativo à raiz. */
export function absolute(path: string): string {
  return siteUrl ? `${siteUrl}${path}` : asset(path);
}
