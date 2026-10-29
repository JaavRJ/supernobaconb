import type { Track, Video, Work } from "@/types/content";

/**
 * Videoclips: uno por cada canción con link de YouTube (fecha de su obra) más los extra de la colección `videos`.
 * El más nuevo primero; a igual fecha, la canción de número mayor va antes.
 */
export function buildVideos(works: Work[], tracks: Track[], extras: Video[]): Video[] {
  const workById = new Map(works.map((w) => [w.id, w]));
  const derived: Video[] = tracks.flatMap((t) => {
    const url = t.links.find((l) => l.platform === "youtube")?.url;
    const work = workById.get(t.workId);
    if (!url || work?.hidden) return [];
    return [{ id: t.id, title: t.title, url, workId: t.workId, trackId: t.id, date: work?.releaseDate ?? "" }];
  });
  const ids = new Set(derived.map((v) => v.id));
  return [...derived.reverse(), ...extras.filter((v) => !ids.has(v.id))].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}
