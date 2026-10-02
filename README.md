# Bruno Luque — Portfólio

Landing page pessoal de Bruno Luque, desenvolvedor web e designer em Criciúma, SC — Brasil.
Next.js (App Router) com exportação estática, três idiomas (pt-BR, en, es), sequências de
rolagem fixadas (GSAP + ScrollTrigger) e cenas 3D (Three.js) com materiais e iluminação autorais.

## Requisitos

- Node.js 20.9 ou superior (testado com 22.20)
- npm 10+
- Opcional, só para regenerar imagens: Python 3.10+ com Pillow 11+ (suporte a AVIF)

## Instalação e execução

```bash
npm install
npm run dev          # http://localhost:3000 (redireciona para /pt-br/)
```

Verificações e build:

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint (config do Next.js)
npm run build        # exportação estática em out/ (+ 404.html e .nojekyll)
npm run verify       # confere rotas, idiomas, âncoras, imagens e links em out/
npm run preview      # serve out/ em http://localhost:4321
npm run check        # tudo acima, em sequência
```

## Estrutura

```
src/
  app/
    (root)/            entrada raiz: redireciona para o idioma salvo (ou pt-br)
    [locale]/          layout e página por idioma (/pt-br/, /en/, /es/)
    icon.svg, apple-icon.png, robots.ts, sitemap.ts
  components/
    layout/            Header (menu móvel, seletor de idioma), Footer
    sections/          Hero, Showcase (apresentação de projetos), About, Stack (instalação),
                       Journey, Process, Contact, Work
    cases/             cases detalhados, esfera de partículas (WebGPU/Canvas)
    three/             motor 3D compartilhado (um contexto WebGL), materiais, geometria e cenas
    motion/            ScrollScenes (GSAP), MotionController (revelações), PageRail
    ui/                Icon, Picture (AVIF/WebP responsivo), TechList, SectionLabel
  content/
    site.ts            DADOS PESSOAIS E LINKS — fonte única (e-mail, telefone, GitHub, projetos)
    tech.ts            catálogo de tecnologias, ícones, grupos e evidências por projeto
    images.generated.ts dimensões das imagens (gerado)
  i18n/
    config.ts          idiomas, IDs de seção
    dictionaries/      pt-br.ts (referência e tipos), en.ts, es.ts
  lib/                 env (basePath/URL), SEO, fontes, estado compartilhado das cenas
  styles/              tokens.css (cores, tipo, espaço, raios, movimento), globals.css
scripts/
  prepare-images.py    gera AVIF/WebP, imagens de compartilhamento e apple-icon
  postbuild.mjs        404.html e .nojekyll para GitHub Pages
  verify-build.mjs     verificação da exportação
  preview.mjs          servidor estático local
assets-src/            imagens originais (retratos, artes, capturas reais, fontes para OG)
public/                imagens otimizadas, ícones da stack (SVG), og/
docs/CREDITOS-ICONES.md fontes e referências de marca dos ícones (Simple Icons)
```

## Editar conteúdo

- **Contatos e links:** `src/content/site.ts`. O e-mail, o telefone e o WhatsApp aparecem só a partir dele.
- **Textos:** `src/i18n/dictionaries/pt-br.ts` é a referência. `en.ts` e `es.ts` precisam ter
  exatamente as mesmas chaves (o TypeScript acusa qualquer diferença).
- **Mensagens de WhatsApp:** `contact.whatsappMessage` em cada dicionário (codificadas automaticamente).
- **Tecnologias da Stack:** `src/content/tech.ts` (grupos e evidências) + descrições em `stack.tech` nos dicionários.
- **Currículo:** quando existir um PDF público (apenas cidade e estado como localização), coloque-o em
  `public/` e defina `resume` em `src/content/site.ts`. O botão aparece sozinho.
- **Imagens:** substitua os arquivos em `assets-src/` e rode `npm run images`.

## Movimento, 3D e níveis de qualidade

- Sequências fixadas (abertura, projetos, processo) em todas as larguras, com layouts próprios para celular.
- Cenas 3D (Three.js) carregadas só quando se aproximam da tela, num único contexto WebGL compartilhado.
  Elas pausam fora da tela e com a aba oculta, limitam a resolução por dispositivo (1×–1,75×) e liberam recursos ao desmontar.
  - Desktop: placas de projetos, escultura do Sobre e fita do Contato.
  - Celular/tablet: apenas as placas de projetos, em 1×.
- Esfera do Bruno Assistente: adaptação visual do componente original (WebGPU/WGSL → Canvas 2D → imagem).
  Estados ilustrativos; nenhum microfone ou serviço é acionado.
- `prefers-reduced-motion`: sem fixações nem animações, todo o conteúdo em sequência estática.
- Sem WebGL: ilustrações e capturas estáticas em alta resolução.

## Publicação no GitHub Pages

1. Crie um repositório (ex.: `portfolio`) e envie o projeto.
2. Em **Settings → Pages**, selecione **GitHub Actions** como fonte.
3. O workflow `.github/workflows/deploy.yml` instala, gera e publica `out/`.
   - O subdiretório (`/portfolio`) e o endereço (`https://<usuario>.github.io/portfolio`) são calculados
     automaticamente a partir do repositório. Para um repositório `<usuario>.github.io`, a publicação fica na raiz.
   - Indexação: o workflow publica com `SITE_ALLOW_INDEXING=true`. Localmente, o padrão é `noindex`.
4. Domínio próprio: defina `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_BASE_PATH=` (vazio) no workflow e adicione o arquivo `CNAME` em `public/`.

Variáveis (veja `.env.example`): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_PATH`, `SITE_ALLOW_INDEXING`.
Canonical, `hreflang`, sitemap e Open Graph absolutos só são gerados quando o endereço público está definido.

## Créditos

- Ícones de marca: [Simple Icons](https://github.com/simple-icons/simple-icons). Fontes e diretrizes em `docs/CREDITOS-ICONES.md`.
  SQL e WGSL são identificações textuais neutras.
- Fontes: Bricolage Grotesque, Manrope e JetBrains Mono (Google Fonts, auto-hospedadas no build).
- Capturas reais: Maréga e Vargas (site público), Bruno Assistente (base isolada com dados fictícios) e
  Central de Compras — UNESC (frontend local com dados fictícios; créditos da equipe preservados).
