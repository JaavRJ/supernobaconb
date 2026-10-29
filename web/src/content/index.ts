import type {
  Constellation,
  DiaryEntry,
  ConstellationId,
  Era,
  Photo,
  Product,
  ProjectDetail,
  Signal,
  Thread,
  Track,
  Video,
  Work,
} from "@/types/content";
import { constellations } from "./constellations";
import { diary } from "./diary";
import { eras } from "./eras";
import { photos } from "./photos";
import { products } from "./products";
import { projectDetails } from "./projects";
import { signals } from "./signals";
import { threads } from "./threads";
import { tracks } from "./tracks";
import { videos } from "./videos";
import { works } from "./works";

export {
  constellations,
  diary,
  eras,
  photos,
  products,
  projectDetails,
  signals,
  threads,
  tracks,
  videos,
  works,
};

export function getWork(id: string): Work | undefined {
  return works.find((w) => w.id === id);
}

export function getEra(id: string): Era | undefined {
  return eras.find((e) => e.id === id);
}

export function getConstellation(id: ConstellationId): Constellation | undefined {
  return constellations.find((c) => c.id === id);
}

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

/** Obras de una constelación por fecha; las que no tienen fecha van al final */
export function getWorksByConstellation(
  id: ConstellationId,
  options: { includeHidden?: boolean } = {},
): Work[] {
  return works
    .filter((w) => w.constellation === id && (options.includeHidden || !w.hidden))
    .sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return a.releaseDate.localeCompare(b.releaseDate);
    });
}

export function getWorksByEra(
  eraId: string,
  options: { includeHidden?: boolean } = {},
): Work[] {
  return works.filter((w) => w.era === eraId && (options.includeHidden || !w.hidden));
}

/** Hilos donde la obra es origen o destino */
export function getThreadsForWork(workId: string): Thread[] {
  return threads.filter((t) => t.from === workId || t.to === workId);
}

export function getTracksForWork(workId: string): Track[] {
  return tracks.filter((t) => t.workId === workId).sort((a, b) => a.number - b.number);
}

/** Era encendida o en órbita cuya fase actual empezó más recientemente */
export function getCurrentEra(): Era | undefined {
  const start = (e: Era) => e.phaseDates[e.phase] ?? "";
  return eras
    .filter((e) => e.phase === "encendida" || e.phase === "orbita")
    .sort((a, b) => start(b).localeCompare(start(a)))[0];
}

export function getNebulas(): Era[] {
  return eras.filter((e) => e.phase === "nebulosa");
}

/** Señal activa más reciente de una era */
export function getActiveSignal(eraId: string): Signal | undefined {
  return signals
    .filter((s) => s.era === eraId && s.active)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

/** Fecha YYYY-MM-DD en la zona dada; la llama quien tenga la hora actual (cliente o tras `connection()`) */
export function toLocalDateString(date: Date, timeZone = "America/Mexico_City"): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("toLocalDateString: la fecha recibida no es válida");
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Tipos que pueden ser "lo último": música y libros, nunca proyectos ni puzzles */
const RELEASE_TYPES: Work["type"][] = ["sencillo", "ep", "album", "libro"];

/** Obra publicada más reciente (fecha <= today, no oculta); today es YYYY-MM-DD */
export function getLatestRelease(today: string): Work | undefined {
  return works
    .filter((w) => RELEASE_TYPES.includes(w.type) && !w.hidden && w.releaseDate && w.releaseDate <= today)
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""))[0];
}

/** Obras de Jabi tipo proyecto (no ocultas), las más nuevas primero, con su ficha */
export function getProjects(): (Work & { detail: ProjectDetail })[] {
  return works
    .filter((w) => w.constellation === "jabi" && w.type === "proyecto" && !w.hidden)
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""))
    .flatMap((w) => {
      const detail = getProjectDetail(w.id);
      return detail ? [{ ...w, detail }] : [];
    });
}

export function getProjectDetail(id: string): ProjectDetail | undefined {
  return projectDetails.find((p) => p.workId === id);
}

export function getVideos(): Video[] {
  return videos;
}

export function getPhotos(): Photo[] {
  return photos;
}

export function getProducts(): Product[] {
  return products;
}

/** Entradas del diario, las más nuevas primero */
export function getDiary(): DiaryEntry[] {
  return [...diary].sort((a, b) => b.date.localeCompare(a.date));
}

export function getDiaryEntry(id: string): DiaryEntry | undefined {
  return diary.find((e) => e.id === id);
}
