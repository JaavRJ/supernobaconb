import { toLocalDateString } from "@/content";
import { content } from "@/lib/content";
import type { Work } from "@/types/content";

type WorkPart = NonNullable<Work["parts"]>[number];

/** Partes de la novela según el contenido del sitio (vacío si la obra no existe) */
export async function getBookParts(): Promise<WorkPart[]> {
  return (await content()).getWork("bduem")?.parts ?? [];
}

export async function getPartMeta(partNumber: number): Promise<WorkPart | undefined> {
  return (await getBookParts()).find((p) => p.number === partNumber);
}

/**
 * Una parte se publica al llegar su `releaseDate` (día calendario de México).
 * Pura: recibe `now` en lugar de leer el reloj.
 */
export function isPartPublished(part: Pick<WorkPart, "releaseDate">, now: Date): boolean {
  return part.releaseDate <= toLocalDateString(now);
}

/** 3 -> "parte-3" */
export function partSlug(partNumber: number): string {
  return `parte-${partNumber}`;
}

/** "parte-3" -> 3; `null` si el slug no es de una parte del libro */
export async function parsePartSlug(slug: string): Promise<number | null> {
  const match = /^parte-([1-9]\d*)$/.exec(slug);
  if (!match) return null;
  const n = Number(match[1]);
  return (await getPartMeta(n)) ? n : null;
}
