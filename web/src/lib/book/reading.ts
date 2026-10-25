const WORDS_PER_MINUTE = 200;

/** Texto plano de un fragmento de HTML (las etiquetas separan palabras) */
export function htmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Minutos de lectura (palabras / 200, mínimo 1) de un texto o de HTML ya limpio */
export function readingMinutes(htmlOrText: string): number {
  const text = htmlToText(htmlOrText);
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
