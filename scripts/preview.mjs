// Servidor estático mínimo para conferir a pasta out/ como no GitHub Pages.
// Uso: npm run preview  (PORT=4321 e NEXT_PUBLIC_BASE_PATH opcionais)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'out');
const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
const port = Number(process.env.PORT ?? 4321);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
};

async function resolve(pathname) {
  let file = normalize(join(root, decodeURIComponent(pathname)));
  if (!file.startsWith(root)) return null;
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = url.pathname;
  if (base) {
    if (!pathname.startsWith(base)) {
      res.writeHead(302, { Location: `${base}/` });
      return res.end();
    }
    pathname = pathname.slice(base.length) || '/';
  }
  const file = await resolve(pathname);
  if (!file) {
    const notFound = await readFile(join(root, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { 'Content-Type': types['.html'] });
    return res.end(notFound);
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(await readFile(file));
}).listen(port, () => console.log(`Prévia em http://localhost:${port}${base}/`));
