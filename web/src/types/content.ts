import type { EraThemeTokens } from "./theme";

/** Las tres constelaciones (ámbitos) del cielo */
export type ConstellationId = "jabi" | "noba" | "supernoba";

export interface Constellation {
  id: ConstellationId;
  /** Nombre tal cual se escribe: "Jabi", "noba", "Supernoba" */
  name: "Jabi" | "noba" | "Supernoba";
  /** Faceta del artista */
  facet: "el que piensa" | "el que escribe" | "el que canta";
  description: string;
  /** Color base (CSS) de las líneas y estrellas de la constelación */
  color: string;
  /** Centro de la constelación en el cielo, normalizado 0–1 */
  skyRegion: { x: number; y: number };
}

// Las partes de un libro viven en `Work.parts`, no como obras propias.
export type WorkType =
  | "libro"
  | "sencillo"
  | "ep"
  | "album"
  | "video"
  | "proyecto"
  | "puzzle";

export interface WorkLink {
  platform:
    | "spotify"
    | "apple-music"
    | "youtube"
    | "smartlink"
    | "repo"
    | "demo"
    | "tienda"
    | "web";
  url: string;
  label?: string;
}

/** Una obra: una estrella dentro de su constelación */
export interface Work {
  /** Slug único */
  id: string;
  title: string;
  constellation: ConstellationId;
  type: WorkType;
  /** Id de la era a la que pertenece */
  era: string;
  /** Núcleo de la era (el libro) u obra satélite */
  role: "nucleo" | "orbita";
  /** Fecha ISO YYYY-MM-DD; ausente si aún no se publica */
  releaseDate?: string;
  /** La fecha es aproximada */
  dateApproximate?: boolean;
  summary: string;
  /** Portada real de la obra (1400 px) */
  coverUrl?: string;
  /** Portada chica (512 px) para el reproductor y la sesión de medios */
  coverSmallUrl?: string;
  /** Foto para su polaroid en la era (se muestra en blanco y negro) */
  photoUrl?: string;
  links: WorkLink[];
  /** Ruta interna del sitio */
  href: string;
  /** Canciones de la obra (ids de Track) */
  trackIds?: string[];
  /** Partes (solo libros) */
  parts?: { number: number; title: string; subtitle?: string; releaseDate: string }[];
  /** Posición manual en el cielo, normalizada 0–1 */
  skyPosition?: { x: number; y: number };
  /** Estrella oculta (secreto) */
  hidden?: boolean;
}

/** Ciclo de vida de una era, como el de una estrella */
export type EraPhase = "nebulosa" | "encendida" | "orbita" | "cerrada";

export interface Era {
  id: string;
  /** null mientras la era es nebulosa */
  name: string | null;
  /** Libro núcleo; null si aún no se revela */
  coreWorkId: string | null;
  phase: EraPhase;
  /** Fecha ISO en que empezó cada fase */
  phaseDates: Partial<Record<EraPhase, string>>;
  description: string;
  theme: EraThemeTokens;
}

export type ThreadKind =
  | "inspira"
  | "continua"
  | "comparte-universo"
  | "guino"
  | "construye";

/** Hilo: conexión entre dos obras */
export interface Thread {
  id: string;
  /** Id de la obra origen */
  from: string;
  /** Id de la obra destino */
  to: string;
  kind: ThreadKind;
  /** Parte concreta del libro origen */
  fromPart?: number;
  note?: string;
}

export type SignalKind = "video" | "frase" | "imagen";

/** Señal de una nebulosa */
export interface Signal {
  id: string;
  /** Id de la era */
  era: string;
  kind: SignalKind;
  /** Texto de la frase, o URL del video o la imagen */
  content: string;
  alt?: string;
  date: string;
  active: boolean;
}

export interface Track {
  id: string;
  workId: string;
  number: number;
  title: string;
  durationSec: number;
  explicit: boolean;
  links: WorkLink[];
  /** Audio para el reproductor propio */
  audioUrl?: string;
  /** Letra: estrofas, cada una con sus líneas */
  lyrics?: string[][];
  /** Créditos: persona y los roles que tuvo en la canción */
  credits?: { name: string; roles: string[] }[];
}
