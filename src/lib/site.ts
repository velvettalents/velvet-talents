export const site = {
  name: "Velvet Talents",
  legalName: "Velvet Talents Unipessoal, Lda",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://velvet-talents.com",
  email: "velvet.talents@gmail.com",
  phones: [
    { display: "+351 917 732 414", href: "tel:+351917732414" },
    { display: "+351 912 333 331", href: "tel:+351912333331" },
  ],
  whatsapp: "https://wa.me/351917732414",
  address: {
    street: "Rua André Brun n.º 150",
    postalCode: "3885-548",
    city: "Esmoriz",
    country: "Portugal",
  },
  mapEmbed:
    "https://www.google.com/maps?q=Rua%20Andr%C3%A9%20Brun%20150%2C%203885-548%20Esmoriz&output=embed",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=100091421958289",
    instagram: "https://www.instagram.com/velvettalents/",
  },
  foundedYear: 2010,
} as const;

// Catalogue PDFs stay on the current WordPress host for now (about 180 MB in total).
const pdfBase = "https://velvet-talents.com/wp-content/uploads";

export const catalogues = [
  { id: "tejadilhos", cover: "/images/catalogs/Post-Velvet-84.jpg", pdf: `${pdfBase}/2023/12/Catalogo-Velvet-Tejadilhos.pdf`, title: { pt: "Tecidos para Tejadilho", en: "Headliner Fabrics" } },
  { id: "bielastico", cover: "/images/catalogs/208.jpg", pdf: `${pdfBase}/2023/12/Catalogo-Tecido-Tejadilho-Bielastico.pdf`, title: { pt: "Tejadilho Bielástico", en: "Two-Way Stretch Headliner" } },
  { id: "alcantara", cover: "/images/catalogs/206.jpg", pdf: `${pdfBase}/2023/12/Catalogo-Velvet-Alcantara.pdf`, title: { pt: "Alcantara", en: "Alcantara" } },
  { id: "napas", cover: "/images/catalogs/207.jpg", pdf: `${pdfBase}/2023/12/Catalogo-Velvet-Napas.pdf`, title: { pt: "Napas", en: "Automotive Vinyl" } },
  { id: "pele-sintetica", cover: "/images/catalogs/210.jpg", pdf: `${pdfBase}/2023/12/Catalogo-Pele-Sintetica.pdf`, title: { pt: "Pele Sintética", en: "Synthetic Leather" } },
  { id: "bancos", cover: "/images/catalogs/209.jpg", pdf: `${pdfBase}/2023/12/Catalogo-Tecidos-Bancos.pdf`, title: { pt: "Tecidos para Bancos", en: "Seat Fabrics" } },
  { id: "portas", cover: "/images/catalogs/205.jpg", pdf: `${pdfBase}/2023/12/Catalogo-Velvet-Portas.pdf`, title: { pt: "Tecidos para Portas", en: "Door Fabrics" } },
  { id: "audi", cover: "/images/catalogs/211.jpg", pdf: `${pdfBase}/2023/02/VELVET-TALENTS-AUDI.pdf`, title: { pt: "Audi", en: "Audi" } },
  { id: "bmw", cover: "/images/catalogs/212.jpg", pdf: `${pdfBase}/2023/02/VELVET-TALENTS-BMW.pdf`, title: { pt: "BMW", en: "BMW" } },
  { id: "porsche", cover: "/images/catalogs/213.jpg", pdf: `${pdfBase}/2023/02/VELVET-TALENTS-PORSCHE.pdf`, title: { pt: "Porsche", en: "Porsche" } },
] as const;
