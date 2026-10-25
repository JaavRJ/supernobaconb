import { getWork, toLocalDateString } from "@/content";
import type { Work } from "@/types/content";

type WorkPart = NonNullable<Work["parts"]>[number];

/** Partes de la novela según el contenido del sitio (vacío si la obra no existe) */
export function getBookParts(): WorkPart[] {
  return getWork("bduem")?.parts ?? [];
}

export function getPartMeta(partNumber: number): WorkPart | undefined {
  return getBookParts().find((p) => p.number === partNumber);
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
export function parsePartSlug(slug: string): number | null {
  const match = /^parte-([1-9]\d*)$/.exec(slug);
  if (!match) return null;
  const n = Number(match[1]);
  return getPartMeta(n) ? n : null;
}
