/** Las cuatro partes del libro (BDUEM) */
export const PART_NUMBERS = [1, 2, 3, 4] as const;

export const PART_OPTIONS = PART_NUMBERS.map((n) => ({ value: String(n), label: `Parte ${n}` }));

/** Nombre de respaldo para el capítulo único de una parte sin títulos en negritas */
export function partTitle(partNumber: number): string {
  return `Parte ${partNumber}`;
}
