// Tipos del texto del libro (BDUEM) leído de Firestore.

/** Capítulo ya limpio: `html` solo trae h2, p, br, em, strong y las marcas de nota del autor */
export interface BookChapter {
  index: number;
  title: string;
  html: string;
  /** Minutos de lectura estimados (palabras / 200, mínimo 1) */
  minutes: number;
}

/** Nota del autor tal como está en `authorNotes` */
export interface AuthorNote {
  id: string;
  partNumber: number;
  /** Texto del libro al que se ancla la nota */
  triggerText: string;
  title: string;
  content: string;
  type: "tooltip" | "modal";
}

/**
 * Una parte del libro. `title`, `subtitle` y `releaseDate` salen de `works.ts`;
 * `notes` trae solo las notas que quedaron marcadas en el HTML (`<span data-note-id="ID">`).
 */
export interface BookPart {
  number: number;
  title: string;
  subtitle?: string;
  releaseDate: string;
  chapters: BookChapter[];
  notes: AuthorNote[];
  /** Minutos de lectura de la parte completa */
  minutes: number;
}
