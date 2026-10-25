/**
 * Tipos de los datos del lector. Los campos que ya existían en los documentos
 * del sitio viejo conservan nombre y forma; los nuevos son opcionales.
 */

export type HighlightColor = "yellow" | "green" | "blue";

export interface Highlight {
  id: string;
  text: string;
  color: HighlightColor;
  partNumber: number;
  chapterIndex: number;
  pageNumber: number;
  createdAt: string;
  /** Posición del texto dentro del capítulo, para volver a pintarlo. */
  offset?: number;
}

export interface Quote {
  id: string;
  text: string;
  partNumber: number;
  partTitle: string;
  chapterTitle: string;
  pageNumber: number;
  createdAt: string;
  tags?: string[];
  chapterIndex?: number;
  offset?: number;
}

export interface Bookmark {
  id: string;
  partNumber: number;
  chapterIndex: number;
  pageNumber: number;
  createdAt: string;
  note?: string;
  /** Posición relativa dentro del capítulo, de 0 a 1. */
  progress?: number;
}

export interface ReadingProgress {
  partNumber: number;
  scrollPosition: number;
  lastRead: string;
  completed: boolean;
  chapterIndex?: number;
  /** Posición relativa dentro del capítulo, de 0 a 1. */
  progress?: number;
}

export interface ReaderPreferences {
  readingMode: "horizontal" | "vertical";
  fontSize: number;
  lineHeight?: number;
  hasSeenTutorial: boolean;
  hasConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

/** Colecciones de elementos con `id` bajo `users/{uid}/`. */
export type ItemKind = "highlights" | "quotes" | "bookmarks";

export interface ItemTypes {
  highlights: Highlight;
  quotes: Quote;
  bookmarks: Bookmark;
}

export interface ReaderUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
