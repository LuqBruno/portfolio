// Ajustes da exportação estática para GitHub Pages.
// - .nojekyll: impede o Jekyll de ignorar a pasta _next/
// - 404.html: página própria com links para os três idiomas (respeita o subdiretório)
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.cwd(), 'out');
if (!existsSync(out)) {
  console.error('Pasta out/ não encontrada. Rode "next build" antes.');
  process.exit(1);
}

const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? inferBase()).replace(/\/$/, '');

function inferBase() {
  const [owner = '', repo = ''] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
  if (process.env.GITHUB_ACTIONS !== 'true' || !repo || repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) return '';
  return `/${repo}`;
}

writeFileSync(join(out, '.nojekyll'), '');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Página não encontrada — Bruno Luque</title>
<link rel="icon" href="${base}/icon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box;
    background: radial-gradient(50% 40% at 70% 30%, rgba(124,58,237,.18), transparent 70%), #08080b;
    color: #f4f3f7; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 34rem; }
  p.code { margin: 0; font: 500 12px/1 ui-monospace, monospace; letter-spacing: .14em; color: #c4b5fd; }
  h1 { margin: 16px 0 8px; font-size: clamp(2rem, 6vw, 3.25rem); line-height: 1.05; letter-spacing: -.03em; }
  p { color: #b4b4c0; }
  nav { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
  a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border: 1px solid #292633; border-radius: 999px; color: #fafafa; text-decoration: none; font-weight: 600; }
  a:first-child { background: #7c3aed; border-color: #7c3aed; }
  a:hover { border-color: #8b5cf6; }
  a:focus-visible { outline: 2px solid #c4b5fd; outline-offset: 3px; }
</style>
</head>
<body>
<main>
  <p class="code">404</p>
  <h1>Página não encontrada</h1>
  <p>O endereço pode ter mudado. · The address may have changed. · Es posible que la dirección haya cambiado.</p>
  <nav aria-label="Idiomas">
    <a href="${base}/pt-br/" hreflang="pt-BR">Voltar ao início</a>
    <a href="${base}/en/" hreflang="en" lang="en">Back to home</a>
    <a href="${base}/es/" hreflang="es" lang="es">Volver al inicio</a>
  </nav>
</main>
</body>
</html>
`;
writeFileSync(join(out, '404.html'), html);
console.log(`postbuild: .nojekyll e 404.html gerados (base "${base || '/'}").`);
