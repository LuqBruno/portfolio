/**
 * Catálogo de tecnologias e ícones (public/images/stack — Simple Icons + 2 badges textuais).
 * Créditos e fontes: docs/CREDITOS-ICONES.md. Nomes de tecnologias não são traduzidos.
 * `icon: false` = sem ícone (apenas texto).
 */
export const tech = {
  html5: { name: 'HTML', icon: true },
  css: { name: 'CSS', icon: true },
  javascript: { name: 'JavaScript', icon: true },
  typescript: { name: 'TypeScript', icon: true },
  python: { name: 'Python', icon: true },
  rust: { name: 'Rust', icon: true },
  sql: { name: 'SQL', icon: true },
  wgsl: { name: 'WGSL', icon: true },
  react: { name: 'React', icon: true },
  nextdotjs: { name: 'Next.js', icon: true },
  tailwindcss: { name: 'Tailwind CSS', icon: true },
  nodedotjs: { name: 'Node.js', icon: true },
  express: { name: 'Express', icon: true },
  fastapi: { name: 'FastAPI', icon: true },
  sqlite: { name: 'SQLite', icon: true },
  postgresql: { name: 'PostgreSQL', icon: true },
  prisma: { name: 'Prisma', icon: true },
  sqlalchemy: { name: 'SQLAlchemy', icon: true },
  jsonwebtokens: { name: 'JWT', icon: true },
  tauri: { name: 'Tauri', icon: true },
  ollama: { name: 'Ollama', icon: true },
  gsap: { name: 'GSAP', icon: true },
  threedotjs: { name: 'Three.js', icon: true },
  vite: { name: 'Vite', icon: true },
  git: { name: 'Git', icon: true },
  github: { name: 'GitHub', icon: true },
  photoshop: { name: 'Adobe Photoshop', icon: false },
  premiere: { name: 'Adobe Premiere', icon: false },
} as const;

export type TechSlug = keyof typeof tech;

/** Projetos onde cada tecnologia aparece (evidências). */
export type ProjectRef = 'marega' | 'assistant' | 'unesc' | 'portfolio';
export const techProjects: Record<TechSlug, ProjectRef[]> = {
  html5: ['marega', 'unesc', 'portfolio'],
  css: ['marega', 'assistant', 'portfolio'],
  javascript: ['assistant', 'unesc'],
  typescript: ['marega', 'assistant', 'portfolio'],
  python: ['assistant'],
  rust: ['assistant'],
  sql: ['assistant', 'unesc'],
  wgsl: ['assistant'],
  react: ['marega', 'assistant', 'unesc', 'portfolio'],
  nextdotjs: ['marega', 'portfolio'],
  tailwindcss: ['unesc'],
  nodedotjs: ['assistant', 'unesc'],
  express: ['unesc'],
  fastapi: ['assistant'],
  sqlite: ['assistant'],
  postgresql: ['unesc'],
  prisma: ['unesc'],
  sqlalchemy: ['assistant'],
  jsonwebtokens: ['unesc'],
  tauri: ['assistant'],
  ollama: ['assistant'],
  gsap: ['portfolio'],
  threedotjs: ['portfolio'],
  vite: ['assistant', 'unesc'],
  git: ['marega', 'assistant', 'portfolio'],
  github: ['marega', 'unesc', 'portfolio'],
  photoshop: [],
  premiere: [],
};

/** Base principal, em destaque na seção Stack. */
export const featuredTech: TechSlug[] = ['html5', 'css', 'javascript', 'typescript', 'react', 'nextdotjs'];

/** Grupos secundários por função — rótulos e evidências ficam nos dicionários (stack.groups[id]). */
export const stackGroups = [
  { id: 'structure', items: ['html5', 'css'] },
  { id: 'languages', items: ['javascript', 'typescript', 'python', 'rust'] },
  { id: 'query', items: ['sql'] },
  { id: 'shaders', items: ['wgsl'] },
  { id: 'interfaces', items: ['react', 'nextdotjs', 'tailwindcss'] },
  { id: 'services', items: ['nodedotjs', 'express', 'fastapi'] },
  { id: 'data', items: ['sqlite', 'postgresql', 'prisma', 'sqlalchemy', 'jsonwebtokens'] },
  { id: 'desktop', items: ['tauri', 'ollama'] },
  { id: 'motion', items: ['gsap', 'threedotjs'] },
  { id: 'tools', items: ['vite', 'git', 'github'] },
  { id: 'design', items: ['photoshop', 'premiere'] },
] as const satisfies ReadonlyArray<{ id: string; items: readonly TechSlug[] }>;

export type StackGroupId = (typeof stackGroups)[number]['id'];

/** Resolve um nome ou slug para a entrada do catálogo (nomes sem ícone viram texto). */
export function resolveTech(value: string): { name: string; slug?: TechSlug } {
  if (value in tech) return { name: tech[value as TechSlug].name, slug: tech[value as TechSlug].icon ? (value as TechSlug) : undefined };
  const found = (Object.keys(tech) as TechSlug[]).find((slug) => tech[slug].name.toLowerCase() === value.toLowerCase());
  return found ? { name: tech[found].name, slug: tech[found].icon ? found : undefined } : { name: value };
}
