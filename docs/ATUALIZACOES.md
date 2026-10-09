# Atualizações locais do portfólio

## 09/10/2026 — Maréga e Vargas publicado

Pedido de Bruno nesta conversa: atualizar primeiro localmente o case para o domínio oficial `https://www.amvadvocacia.com.br`, substituindo o acesso ao repositório.

- Fonte única em `src/content/site.ts`: domínio novo, removida a entrada de código do case.
- Botão do repositório removido de Showcase e MaregaCase; botão de visitar o site preservado.
- Status em PT/EN/ES atualizado para publicado em domínio próprio.
- Verificação existente do build atualizada para o domínio novo.
- `npm run check` passou: TypeScript, lint, build estático e verificação de rotas/idiomas/links/assets.
- Destino oficial respondeu HTTPS 200. Playwright conferiu link oficial e ausência do repo no case local em 1440 e 390px. Capturas em `output/playwright/marega-domain-*.png`; visual mobile inspecionado. Console sem erros.
- Não realizado commit, push ou deploy. Versão online do portfólio ainda permanece anterior; alteração preparada localmente.
