import { eras } from "@/content";
import type {
  ConstellationId,
  DiaryEntry,
  PlayerTrack,
  ProjectDetail,
  Signal,
  Thread,
  Track,
  Work,
  Writing,
} from "@/types/content";
import type { ContentSnapshot } from "./types";

/** Tipos que pueden ser "lo último": música y libros, nunca proyectos ni puzzles */
const RELEASE_TYPES: Work["type"][] = ["sencillo", "ep", "album", "libro"];

const byNewest = (a: Work, b: Work) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");

/**
 * Consultas sobre un snapshot de contenido. Devuelve el propio snapshot (`c.works`, `c.photos`, `c.about`...)
 * más las funciones de consulta, que resuelven con los datos de ese snapshot.
 */
export function contentApi(snapshot: ContentSnapshot) {
  const { works, threads, tracks, signals, projectDetails, writings, diary } = snapshot;
  const workById = new Map(works.map((w) => [w.id, w]));

  function getWork(id: string): Work | undefined {
    return workById.get(id);
  }

  function getTrack(id: string): Track | undefined {
    return tracks.find((t) => t.id === id);
  }

  /** Obras de una constelación por fecha; las que no tienen fecha van al final */
  function getWorksByConstellation(id: ConstellationId, options: { includeHidden?: boolean } = {}): Work[] {
    return works
      .filter((w) => w.constellation === id && (options.includeHidden || !w.hidden))
      .sort((a, b) => {
        if (!a.releaseDate && !b.releaseDate) return 0;
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return a.releaseDate.localeCompare(b.releaseDate);
      });
  }

  function getWorksByEra(eraId: string, options: { includeHidden?: boolean } = {}): Work[] {
    return works.filter((w) => w.era === eraId && (options.includeHidden || !w.hidden));
  }

  /** Hilos donde la obra es origen o destino */
  function getThreadsForWork(workId: string): Thread[] {
    return threads.filter((t) => t.from === workId || t.to === workId);
  }

  function getTracksForWork(workId: string): Track[] {
    return tracks.filter((t) => t.workId === workId).sort((a, b) => a.number - b.number);
  }

  /** Señal activa más reciente de una era */
  function getActiveSignal(eraId: string): Signal | undefined {
    return signals
      .filter((s) => s.era === eraId && s.active)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
  }

  /** Obra publicada más reciente (fecha <= today, no oculta); today es YYYY-MM-DD */
  function getLatestRelease(today: string): Work | undefined {
    return works
      .filter((w) => RELEASE_TYPES.includes(w.type) && !w.hidden && w.releaseDate && w.releaseDate <= today)
      .sort(byNewest)[0];
  }

  function getProjectDetail(id: string): ProjectDetail | undefined {
    return projectDetails.find((p) => p.workId === id);
  }

  /** Obras de Jabi tipo proyecto (no ocultas), las más nuevas primero, con su ficha */
  function getProjects(): (Work & { detail: ProjectDetail })[] {
    return works
      .filter((w) => w.constellation === "jabi" && w.type === "proyecto" && !w.hidden)
      .sort(byNewest)
      .flatMap((w) => {
        const detail = getProjectDetail(w.id);
        return detail ? [{ ...w, detail }] : [];
      });
  }

  /** Obras tipo escrito (no ocultas) con su contenido, las más nuevas primero */
  function getWritings(): (Work & { writing: Writing })[] {
    return works
      .filter((w) => w.type === "escrito" && !w.hidden)
      .sort(byNewest)
      .flatMap((w) => {
        const writing = writings.find((x) => x.workId === w.id);
        return writing ? [{ ...w, writing }] : [];
      });
  }

  function getWriting(id: string): (Work & { writing: Writing }) | undefined {
    return getWritings().find((w) => w.id === id);
  }

  /** Entradas del diario, las más nuevas primero */
  function getDiary(): DiaryEntry[] {
    return [...diary].sort((a, b) => b.date.localeCompare(a.date));
  }

  function getDiaryEntry(id: string): DiaryEntry | undefined {
    return diary.find((e) => e.id === id);
  }

  /** Canciones con los datos de su obra y el tema de su era, para la cola del reproductor (cliente) */
  function toPlayerTracks(list: Track[]): PlayerTrack[] {
    return list.map((track) => {
      const work = workById.get(track.workId);
      if (!work) return track;
      const era = eras.find((e) => e.id === work.era);
      return {
        ...track,
        work: {
          title: work.title,
          href: work.href,
          ...(work.coverUrl ? { coverUrl: work.coverUrl } : {}),
          ...(work.coverSmallUrl ? { coverSmallUrl: work.coverSmallUrl } : {}),
          ...(era ? { theme: era.theme } : {}),
        },
      };
    });
  }

  return {
    ...snapshot,
    getWork,
    getTrack,
    getWorksByConstellation,
    getWorksByEra,
    getThreadsForWork,
    getTracksForWork,
    getActiveSignal,
    getLatestRelease,
    getProjectDetail,
    getProjects,
    getWritings,
    getWriting,
    getDiary,
    getDiaryEntry,
    toPlayerTracks,
  };
}

export type Content = ReturnType<typeof contentApi>;
