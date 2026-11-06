// Notion database schema shared by the site and scripts/notion-setup.mts.
// Property names are in Portuguese because the business owner edits them.
// Keep this file free of path aliases and TS-only runtime syntax: the setup
// script imports it directly with Node's type stripping.

export const AVAILABILITY = {
  available: "Disponível",
  onRequest: "Sob encomenda",
  soldOut: "Esgotado",
} as const;

export const REQUEST_STATUS = ["Novo", "Contactado", "Orçamento enviado", "Ganho", "Perdido"] as const;

export const P = {
  category: {
    name: "Nome",
    nameEn: "Nome EN",
    slug: "Slug",
    order: "Ordem",
    image: "Imagem",
    published: "Publicado",
  },
  product: {
    name: "Nome",
    nameEn: "Nome EN",
    category: "Categoria",
    description: "Descrição",
    descriptionEn: "Descrição EN",
    image: "Imagem",
    availability: "Disponibilidade",
    stock: "Stock (m)",
    featured: "Destaque",
    published: "Publicado",
    slug: "Slug",
  },
  catalogue: {
    name: "Nome",
    nameEn: "Nome EN",
    cover: "Capa",
    pdf: "PDF",
    order: "Ordem",
    published: "Publicado",
  },
  request: {
    name: "Nome",
    type: "Tipo",
    status: "Estado",
    email: "E-mail",
    phone: "Telefone",
    company: "Empresa",
    product: "Produto",
    meters: "Metros",
    subject: "Assunto",
    message: "Mensagem",
    language: "Idioma",
    received: "Recebido em",
  },
} as const;

export type MediaKind = "product" | "category" | "catalogue-cover" | "catalogue-pdf";

// Which Notion files property backs each /media/<kind>/... route.
export const MEDIA_PROPERTY: Record<MediaKind, string> = {
  product: P.product.image,
  category: P.category.image,
  "catalogue-cover": P.catalogue.cover,
  "catalogue-pdf": P.catalogue.pdf,
};
