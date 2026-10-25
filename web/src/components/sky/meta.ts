import type { SignalKind, ThreadKind, WorkType } from "@/types/content";

export const THREAD_LABELS: Record<ThreadKind, string> = {
  inspira: "inspira",
  continua: "continúa",
  "comparte-universo": "comparte universo",
  guino: "guiño",
  construye: "construye",
};

/** Cómo se lee un hilo desde la obra de destino */
export const INCOMING_THREAD_LABELS: Record<ThreadKind, string> = {
  inspira: "Inspirada por",
  continua: "Continuación de",
  "comparte-universo": "Comparte universo con",
  guino: "Guiño de",
  construye: "Construida por",
};

/** Orden en que aparecen en la leyenda */
export const THREAD_ORDER: ThreadKind[] = [
  "inspira",
  "continua",
  "comparte-universo",
  "construye",
  "guino",
];

export const TYPE_LABELS: Record<WorkType, string> = {
  libro: "Libro",
  sencillo: "Sencillo",
  ep: "EP",
  album: "Álbum",
  video: "Video",
  proyecto: "Proyecto",
  puzzle: "Puzzle",
};

/** Datos de cada estrella que solo se necesitan para la tarjeta y el aria-label */
export interface SkyStarInfo {
  workId: string;
  href: string;
  title: string;
  typeLabel: string;
  /** Fecha en español, o "por publicar" */
  dateLabel: string;
  /** Fecha ISO si existe, para `<time>` */
  dateIso?: string;
  eraName: string | null;
  constellationName: string;
  coverUrl?: string;
  ariaLabel: string;
}

/** Señal activa de una nebulosa, lista para mostrarse */
export interface SkySignal {
  id: string;
  kind: SignalKind;
  content: string;
  alt?: string;
}
