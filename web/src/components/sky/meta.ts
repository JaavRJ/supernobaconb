import type { EraPhase, SignalKind, ThreadKind, WorkType } from "@/types/content";
import type { EraThemeTokens } from "@/types/theme";

export const THREAD_LABELS: Record<ThreadKind, string> = {
  inspira: "inspira",
  continua: "continúa",
  "comparte-universo": "comparte universo",
  guino: "guiño",
  construye: "construye",
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
  /** Id de la era a la que pertenece la obra */
  eraId: string;
  constellationName: string;
  coverUrl?: string;
  ariaLabel: string;
}

/** Era tal como la necesita el cliente; una nebulosa no lleva nombre */
export interface SkyEraInfo {
  id: string;
  /** Nombre de la era, o "Nebulosa" mientras no se revela */
  label: string;
  phase: EraPhase;
  theme: EraThemeTokens;
}

/** Señal activa de una nebulosa, lista para mostrarse */
export interface SkySignal {
  id: string;
  kind: SignalKind;
  content: string;
  alt?: string;
}

/** Textos de una fila de la línea de tiempo */
export interface SkyTimelineLabels {
  ariaLabel: string;
}
