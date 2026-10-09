/**
 * Dados pessoais, contatos e links — fonte única.
 * Edite aqui para atualizar e-mail, telefone, redes ou endereços de projetos.
 */
export const person = {
  name: 'Bruno Luque',
  givenName: 'Bruno',
  familyName: 'Luque',
  email: 'brunoluquers@gmail.com',
  phoneDisplay: '+55 48 99660-1950',
  phoneE164: '+5548996601950',
  whatsappNumber: '5548996601950',
  city: 'Criciúma',
  region: 'SC',
  country: 'BR',
  github: 'https://github.com/LuqBruno',
  githubHandle: 'LuqBruno',
  university: 'UNESC',
  universityUrl: 'https://www.unesc.net/',
} as const;

export const projectLinks = {
  marega: {
    site: 'https://www.amvadvocacia.com.br',
  },
  unesc: {
    organization: 'https://github.com/Centra-de-Compras-Unesc',
    frontend: 'https://github.com/Centra-de-Compras-Unesc/central-compras-frontend',
    backend: 'https://github.com/Centra-de-Compras-Unesc/central-compras-backend',
  },
  // Bruno Assistente: sem repositório público nem demonstração confirmados — não adicionar links.
} as const;

/** Currículo público. Mantenha null até existir um PDF revisado em /public (somente cidade/estado). */
export const resume: { href: string; language: 'pt-BR' } | null = null;

export function whatsappHref(message: string): string {
  return `https://wa.me/${person.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const mailtoHref = `mailto:${person.email}`;
export const telHref = `tel:${person.phoneE164}`;
