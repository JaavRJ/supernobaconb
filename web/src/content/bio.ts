/**
 * Biografía del artista en español e inglés.
 * Borrador escrito a partir de su kit de prensa; el artista la aprueba antes de publicar (Fase 6).
 */
export interface Bio {
  /** Una línea */
  short: string;
  /** Un párrafo */
  medium: string;
  /** Varios párrafos */
  long: string[];
}

export const bio: Record<"es" | "en", Bio> = {
  es: {
    short: "Jabi el que piensa, noba el que escribe y Supernoba el que canta.",
    medium:
      "Supernoba es el proyecto de Javier, Jabi, artista multidisciplinario del Estado de México. Escribió la novela Brillo de una Estrella Muerta, publicada por entregas en línea y como libro impreso, y en 2026 dio el salto a la música con los sencillos Rulos y nohablobien / part3. Como desarrollador, construye él mismo el universo digital donde viven sus obras.",
    long: [
      "Supernoba no es solo un nombre artístico: es la voz de una vida, el lugar donde caben cada experiencia, recuerdo, cicatriz y sueño de quien lo creó. Detrás está Javier —Jabi—, artista multidisciplinario del Estado de México que trabaja entre la literatura, la música y el software. Él mismo lo resume en tres facetas: Jabi el que piensa, noba el que escribe y Supernoba el que canta.",
      "Todo empezó en las páginas. Brillo de una Estrella Muerta, su primera novela, sigue el ciclo de vida de una estrella en cuatro partes —Nebulosa, Gigante Roja, Supernoba y Enana Blanca— y se publicó por entregas en diciembre de 2025, en un lector en línea hecho por él mismo. Hoy también existe como libro impreso.",
      "Si la novela cuenta cómo nació esa entidad, la música es su voz en tiempo real. En 2026 llegaron sus primeros sencillos: Rulos, en marzo, y nohablobien / part3, en junio. part3 nace directamente de la tercera parte del libro: cada canción es una estrella más del mismo cielo.",
      "Su formación como desarrollador le da algo poco común: control total sobre la narrativa visual y técnica de su obra. Construyó el sitio donde viven sus libros y canciones, y fuera del arte crea proyectos de inteligencia artificial y accesibilidad; con RailSense, como Tech Lead, ganó el track Open Source del Hackathon Mobility & AI 2025.",
      "Supernoba crece como un cielo nocturno: cada obra es una estrella nueva, y todas están conectadas.",
    ],
  },
  en: {
    short: "Jabi the one who thinks, noba the one who writes, and Supernoba the one who sings.",
    medium:
      "Supernoba is the project of Javier, known as Jabi, a multidisciplinary artist from the State of Mexico. He wrote the novel Brillo de una Estrella Muerta, released in installments online and in print, and in 2026 made the leap to music with the singles Rulos and nohablobien / part3. As a software developer, he builds the digital universe where his work lives.",
    long: [
      "Supernoba isn't just a stage name: it is the voice of a life, a vessel for every experience, memory, scar and dream of its creator. Behind it is Javier —Jabi—, a multidisciplinary artist from the State of Mexico working across literature, music and software. He sums it up in three facets: Jabi the one who thinks, noba the one who writes, and Supernoba the one who sings.",
      "It all began on the page. Brillo de una Estrella Muerta (Shine of a Dead Star), his debut novel, follows the life cycle of a star in four parts —Nebula, Red Giant, Supernoba and White Dwarf— and was released in installments in December 2025, in an online reader he built himself. Today it is also available in print.",
      "If the novel tells how this entity came to be, the music is its voice in real time. His first singles arrived in 2026: Rulos in March and nohablobien / part3 in June. part3 is born straight from the third part of the book: every song is one more star in the same sky.",
      "His background as a developer gives him something rare: complete control over both the visual and the technical narrative of his art. He built the site where his books and songs live, and beyond art he creates artificial intelligence and accessibility projects; as Tech Lead of RailSense, he won the Open Source track at the Mobility & AI Hackathon 2025.",
      "Supernoba grows like a night sky: every work is a new star, and they are all connected.",
    ],
  },
};
