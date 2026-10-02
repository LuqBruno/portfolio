import { imageManifest, type ImageKey } from '@/content/images.generated';
import { asset } from '@/lib/env';

type Props = {
  name: ImageKey;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Recorte opcional (object-position) controlado pelo CSS do componente. */
  style?: React.CSSProperties;
};

/**
 * <picture> com AVIF + WebP em várias larguras (gerados por scripts/prepare-images.py).
 * Largura e altura reais evitam deslocamento de layout; imagens fora da primeira dobra são adiadas.
 */
export function Picture({ name, alt, sizes, className, priority = false, style }: Props) {
  const meta = imageManifest[name];
  const srcSet = (format: 'avif' | 'webp') =>
    meta.widths.map((w) => `${asset(`/images/${name}-${w}.${format}`)} ${w}w`).join(', ');
  const fallbackWidth = meta.widths[Math.min(1, meta.widths.length - 1)];
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={asset(`/images/${name}-${fallbackWidth}.webp`)}
        width={meta.width}
        height={meta.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={style}
      />
    </picture>
  );
}
