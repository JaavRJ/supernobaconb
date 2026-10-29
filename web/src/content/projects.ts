import type { ProjectDetail } from "@/types/content";

/** Fichas de los proyectos de Jabi (hoy solo la web) */
export const projectDetails: ProjectDetail[] = [
  {
    workId: "supernobaconb-web",
    tagline: "El lector de Brillo de una Estrella Muerta y el cielo donde viven todas las obras.",
    role: "Diseño, desarrollo y contenido",
    paragraphs: [
      "Empezó como el lugar para publicar Brillo de una Estrella Muerta por partes, con un lector hecho a la medida del libro. Hoy es la casa de todo lo que hago: el libro, la música y el proceso, acomodados como estrellas en tres constelaciones.",
      "El lector tiene dos modos, páginas y continuo, y guarda resaltados, citas, marcadores y el punto de lectura en la cuenta de Google de cada lector. Las notas del autor aparecen sobre el texto y cada parte abre con su antesala de fragmentos y fotos.",
      "El reproductor propio sigue sonando al cambiar de página, y entre las estrellas hay secretos que no aparecen en ningún menú.",
    ],
    highlights: [
      "Lector con modo páginas y modo continuo",
      "Resaltados, citas y marcadores sincronizados con la cuenta",
      "Publicación escalonada de las cuatro partes",
      "Reproductor que no se corta al navegar",
      "Puzzles ocultos",
    ],
    stack: ["Next.js", "React", "TypeScript", "Firebase", "Firestore", "CSS Modules"],
    screenshots: [
      {
        src: "/proceso/supernobaconb-web/portada.webp",
        width: 1600,
        height: 933,
        alt: "Portada del sitio: el nombre SUPERNOBA con la estrella-brújula sobre un cielo nocturno y el aviso de lo último publicado",
        caption: "La portada",
      },
      {
        src: "/proceso/supernobaconb-web/libro.webp",
        width: 1600,
        height: 933,
        alt: "Página del libro con el título Brillo de una Estrella Muerta en letra uncial sobre negro",
        caption: "El libro",
      },
      {
        src: "/proceso/supernobaconb-web/lector.webp",
        width: 1600,
        height: 933,
        alt: "Lector abierto en la Parte 3, con su índice de capítulos y la barra de lectura",
        caption: "El lector",
      },
      {
        src: "/proceso/supernobaconb-web/sencillo.webp",
        width: 1600,
        height: 933,
        alt: "Página del sencillo nohablobien / part3 con su portada y el botón Escuchar",
        caption: "Un sencillo",
      },
    ],
    repo: { url: "https://github.com/JaavRJ/supernobaconb" },
    demo: { url: "https://supernobaconb.web.app", label: "Versión en línea" },
  },
];
