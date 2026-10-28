/**
 * Biografía del artista.
 * `about` es el texto del artista para la página Sobre mí, en primera persona y tal cual lo escribió.
 * `bio` es la versión en tercera persona (español e inglés) para el kit de prensa y los metadatos.
 */
export interface Bio {
  /** Una línea */
  short: string;
  /** Un párrafo */
  medium: string;
  /** Varios párrafos */
  long: string[];
}

export interface About {
  intro: string;
  /** Las tres partes en las que el artista se divide */
  parts: { label: string; text: string }[];
  closing: string;
}

export const about: About = {
  intro:
    "Supernoba no es solo un seudónimo; es el lugar donde convergen mis experiencias, recuerdos y sueños. Soy Javier (Jabi), un artista multidisciplinario del Estado de México que trabaja en la intersección de la literatura, la música y el desarrollo de software. Me gusta decir que me divido en tres partes.",
  parts: [
    {
      label: "Literatura",
      text: "Todo comenzó con mi primera novela, Brillo de una Estrella Muerta, la cual relata el ciclo de vida de una estrella (Nebulosa, Gigante Roja, Supernoba y Enana Blanca). La publiqué en diciembre de 2025 a través de una plataforma web propia y actualmente está disponible en formato impreso.",
    },
    {
      label: "Música",
      text: "Es la voz de mi universo en tiempo real. En 2026 presenté mis primeros sencillos, “Rulos” y “nohablobien / part3”. Esta última pieza se desprende directamente de la tercera parte de mi libro; cada canción es una nueva estrella en el mismo firmamento.",
    },
    {
      label: "Desarrollo",
      text: "Ser ingeniero de software me permite tener control absoluto sobre la experiencia de mi obra. Yo mismo programé este sitio, construyendo el ecosistema digital donde viven mis proyectos.",
    },
  ],
  closing: "Al final, Supernoba es la explosión de todo lo que puedo hacer y pensar.",
};

export const bio: Record<"es" | "en", Bio> = {
  es: {
    short: "Jabi el que piensa, noba el que escribe y Supernoba el que canta.",
    medium:
      "Supernoba es el proyecto de Javier (Jabi), artista multidisciplinario del Estado de México que trabaja en la intersección de la literatura, la música y el desarrollo de software. Publicó su primera novela, Brillo de una Estrella Muerta, en diciembre de 2025, y en 2026 presentó sus primeros sencillos, Rulos y nohablobien / part3. Él mismo programó el sitio donde viven sus obras.",
    long: [
      "Supernoba no es solo un seudónimo: es el lugar donde convergen las experiencias, los recuerdos y los sueños de Javier (Jabi), artista multidisciplinario del Estado de México que trabaja en la intersección de la literatura, la música y el desarrollo de software.",
      "Literatura. Todo comenzó con su primera novela, Brillo de una Estrella Muerta, que relata el ciclo de vida de una estrella: Nebulosa, Gigante Roja, Supernoba y Enana Blanca. La publicó en diciembre de 2025 en una plataforma web propia y hoy está disponible en formato impreso.",
      "Música. Es la voz de su universo en tiempo real. En 2026 presentó sus primeros sencillos, Rulos y nohablobien / part3; esta última se desprende directamente de la tercera parte del libro. Cada canción es una nueva estrella en el mismo firmamento.",
      "Desarrollo. Como ingeniero de software, tiene control absoluto sobre la experiencia de su obra: él mismo programó el sitio de Supernoba, el ecosistema digital donde viven sus proyectos.",
      "Al final, Supernoba es la explosión de todo lo que puede hacer y pensar.",
    ],
  },
  en: {
    short: "Jabi the one who thinks, noba the one who writes, and Supernoba the one who sings.",
    medium:
      "Supernoba is the project of Javier (Jabi), a multidisciplinary artist from the State of Mexico working at the intersection of literature, music and software development. He published his debut novel, Brillo de una Estrella Muerta, in December 2025, and released his first singles, Rulos and nohablobien / part3, in 2026. He built the site where his work lives himself.",
    long: [
      "Supernoba isn't just a pseudonym: it is where the experiences, memories and dreams of Javier (Jabi) converge, a multidisciplinary artist from the State of Mexico working at the intersection of literature, music and software development.",
      "Literature. It all began with his debut novel, Brillo de una Estrella Muerta (Shine of a Dead Star), which follows the life cycle of a star: Nebula, Red Giant, Supernoba and White Dwarf. He published it in December 2025 on his own web platform, and it is now available in print.",
      "Music. It is the voice of his universe in real time. In 2026 he released his first singles, Rulos and nohablobien / part3; the latter is born straight from the third part of the book. Every song is a new star in the same sky.",
      "Development. As a software engineer, he has complete control over the experience of his work: he programmed the Supernoba site himself, the digital ecosystem where his projects live.",
      "In the end, Supernoba is the explosion of everything he can do and think.",
    ],
  },
};
