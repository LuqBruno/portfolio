// Verificação da exportação estática (out/): rotas, idiomas, âncoras, recursos e links.
// Uso: npm run verify (depois de npm run build)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.cwd(), 'out');
const inferBase = () => {
  const [owner = '', repo = ''] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
  if (process.env.GITHUB_ACTIONS !== 'true' || !repo || repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) return '';
  return `/${repo}`;
};
const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? inferBase()).replace(/\/$/, '');
let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  failures++;
  console.log(`  ✗ ${msg}`);
};
const check = (cond, msg) => (cond ? ok(msg) : fail(msg));

const locales = {
  'pt-br': { lang: 'pt-BR', title: 'Desenvolvedor Web & Designer', wa: 'Olá, Bruno! Vi seu portfólio e gostaria de conversar sobre um projeto.', foreign: ['Selected work', 'Trabajo seleccionado'] },
  en: { lang: 'en', title: 'Web Developer & Designer', wa: 'Hi Bruno! I saw your portfolio and would like to discuss a project.', foreign: ['Vamos conversar', 'Hablemos'] },
  es: { lang: 'es', title: 'Desarrollador Web y Diseñador', wa: '¡Hola, Bruno! Vi tu portafolio y me gustaría conversar sobre un proyecto.', foreign: ['Vamos conversar', "Let's talk"] },
};

console.log('\nArquivos de publicação');
check(existsSync(join(out, 'index.html')), 'entrada raiz index.html');
check(existsSync(join(out, '404.html')), '404.html');
check(existsSync(join(out, '.nojekyll')), '.nojekyll (GitHub Pages)');
check(existsSync(join(out, 'robots.txt')), 'robots.txt');

const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');

for (const [locale, exp] of Object.entries(locales)) {
  console.log(`\nIdioma ${locale}`);
  const file = join(out, locale, 'index.html');
  if (!existsSync(file)) {
    fail(`${locale}/index.html existe`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const visible = strip(html);
  check(html.includes(`<html lang="${exp.lang}"`), `atributo lang="${exp.lang}"`);
  check(new RegExp(`<title>[^<]*${exp.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('&', '&amp;')}`).test(html), 'título traduzido');
  check(/<meta name="description" content="[^"]{80,}"/.test(html), 'meta description');
  check(html.includes(`https://wa.me/5548996601950?text=${encodeURIComponent(exp.wa)}`), 'mensagem de WhatsApp codificada no idioma');
  check(html.includes('mailto:brunoluquers@gmail.com'), 'link de e-mail');
  check(html.includes('https://github.com/LuqBruno'), 'GitHub');
  check(html.includes('https://www.amvadvocacia.com.br'), 'site Maréga e Vargas');
  check(html.includes('https://github.com/Centra-de-Compras-Unesc/central-compras-frontend') && html.includes('central-compras-backend'), 'repositórios da Central de Compras');
  for (const word of exp.foreign) check(!visible.includes(word), `sem texto de outro idioma: “${word}”`);
  const hreflangs = ['pt-BR', 'en', 'es'].every((l) => html.includes(`hrefLang="${l}"`) || html.includes(`hreflang="${l}"`));
  check(hreflangs, 'seletor com hreflang para PT / EN / ES');

  // Âncoras internas
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
  const missing = anchors.filter((a) => !ids.has(a));
  check(missing.length === 0, `âncoras internas (${anchors.length}) ${missing.length ? 'faltando: ' + missing.join(', ') : 'todas encontradas'}`);

  // Recursos locais referenciados
  const refs = [...new Set([...html.matchAll(/(?:src|href|srcSet|srcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((p) => p.trim().split(' ')[0])))].filter((u) => u.startsWith(`${base}/images/`) || u.startsWith(`${base}/og/`));
  const absent = refs.filter((u) => !existsSync(join(out, decodeURI(u.slice(base.length)))));
  check(absent.length === 0, `imagens locais (${refs.length}) ${absent.length ? 'ausentes: ' + absent.slice(0, 5).join(', ') : 'presentes'}`);
  check(!/[A-Za-z]:\\\\|Área de Trabalho/.test(html), 'sem caminhos locais da máquina');
}

console.log('\nÍcones da stack');
const icons = readdirSync(join(out, 'images', 'stack')).filter((f) => f.endsWith('-claro.svg'));
check(icons.length === 26, `${icons.length} ícones claros publicados`);

let total = 0;
const walk = (dir) => readdirSync(dir).forEach((f) => {
  const p = join(dir, f);
  const s = statSync(p);
  if (s.isDirectory()) walk(p);
  else total += s.size;
});
walk(out);
console.log(`\nTamanho total da exportação: ${(total / 1024 / 1024).toFixed(1)} MB`);

console.log(failures ? `\n${failures} verificação(ões) falharam.\n` : '\nTodas as verificações passaram.\n');
process.exit(failures ? 1 : 0);
