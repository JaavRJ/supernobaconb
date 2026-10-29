import { cacheLife, cacheTag } from "next/cache";
import type { AuthorNote, BookPart } from "@/types/book";
import { splitIntoChapters } from "./chapters";
import { fetchAuthorNotes, fetchPartHtml } from "./firestore";
import { markAuthorNotes } from "./notes";
import { getPartMeta } from "./publication";
import { readingMinutes } from "./reading";

export { getBookParts, getPartMeta, isPartPublished, parsePartSlug, partSlug } from "./publication";
export { readingMinutes } from "./reading";

/** Construye la parte a partir de Firestore; `null` si falta configuración o falla la red */
async function loadBookPart(partNumber: number): Promise<{ part: BookPart; complete: boolean } | null> {
  const meta = await getPartMeta(partNumber);
  if (!meta) return null;
  const [raw, allNotes] = await Promise.all([fetchPartHtml(partNumber), fetchAuthorNotes()]);
  if (!raw) return null;

  const chapters = splitIntoChapters(raw, meta.title);
  const { htmls, marked } = markAuthorNotes(
    chapters,
    (allNotes ?? []).filter((n) => n.partNumber === partNumber),
  );
  const part: BookPart = {
    number: meta.number,
    title: meta.title,
    subtitle: meta.subtitle,
    releaseDate: meta.releaseDate,
    chapters: chapters.map((c, index) => ({
      index,
      title: c.title,
      html: htmls[index],
      minutes: readingMinutes(c.html),
    })),
    notes: marked,
    minutes: readingMinutes(chapters.map((c) => c.html).join(" ")),
  };
  return { part, complete: allNotes !== null };
}

/**
 * Parte del libro lista para mostrar: capítulos limpios con las notas del autor ya marcadas
 * (`part.notes` trae solo las marcadas). `null` si no hay configuración de Firebase o falla la red.
 * Los fallos se guardan poco tiempo para no fijar un error por horas.
 */
export async function getBookPart(partNumber: number): Promise<BookPart | null> {
  "use cache";
  cacheTag("book");
  const loaded = await loadBookPart(partNumber);
  if (loaded?.complete) cacheLife("hours");
  else cacheLife("seconds");
  return loaded?.part ?? null;
}

/** Todas las notas del autor de una parte (marcadas o no); `[]` si no se pueden leer */
export async function getAuthorNotes(partNumber: number): Promise<AuthorNote[]> {
  "use cache";
  cacheTag("book");
  const notes = await fetchAuthorNotes();
  if (notes) cacheLife("hours");
  else cacheLife("seconds");
  return (notes ?? []).filter((n) => n.partNumber === partNumber);
}
