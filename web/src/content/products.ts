import type { Product } from "@/types/content";

export const products: Product[] = [
  {
    id: "bduem-libro-fisico",
    name: "Brillo de una Estrella Muerta",
    format: "Libro impreso",
    description: "La novela en libro impreso: el ciclo de vida de una estrella, en cuatro partes.",
    image: {
      src: "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1763189290/supernoba/IMG_20251113_152021_xzy1ze.png",
      width: 1184,
      height: 864,
      alt: "Fotografía en blanco y negro de Brillo de una Estrella Muerta",
    },
    buy: { url: "https://a.co/d/00hx9lsU", store: "Amazon" },
    workId: "bduem",
  },
];
