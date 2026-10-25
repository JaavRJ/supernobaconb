/** Largo máximo razonable de un texto guardado por el lector. */
export const MAX_TEXT_LENGTH = 2000;
export const MAX_NOTE_LENGTH = 500;

/**
 * Deja texto plano: quita etiquetas, caracteres de control y espacios de más,
 * y recorta el largo. No usa DOMPurify porque nunca se guarda HTML.
 */
export function sanitizeText(input: unknown, max: number = MAX_TEXT_LENGTH): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>?/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, max);
}
