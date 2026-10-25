import type { AuthorNote } from "@/types/book";

const INLINE_TAGS = new Set(["em", "strong", "span"]);
const ENTITY = /^&(?:amp|lt|gt|quot|#\d+);/;

const normalize = (s: string) => s.replace(/ |&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function decodeEntity(entity: string): string {
  switch (entity) {
    case "&amp;": return "&";
    case "&lt;": return "<";
    case "&gt;": return ">";
    case "&quot;": return '"';
    default: return String.fromCharCode(Number(entity.slice(2, -1)));
  }
}

/** Un carácter visible del texto con su posición en el HTML crudo */
interface Glyph {
  char: string;
  start: number;
  end: number;
}

/** Caracteres del texto de los párrafos (o solo de los `<h2>`), con espacios colapsados */
function collectGlyphs(tokens: string[], inHeadings: boolean): { glyphs: Glyph[]; offsets: number[] } {
  const glyphs: Glyph[] = [];
  const offsets: number[] = [];
  let pos = 0;
  let inHeading = false;
  for (const token of tokens) {
    offsets.push(pos);
    if (token.startsWith("<")) {
      if (token === "<h2>") inHeading = true;
      else if (token === "</h2>") inHeading = false;
    } else if (inHeading === inHeadings) {
      for (let i = 0; i < token.length; ) {
        const entity = ENTITY.exec(token.slice(i, i + 8))?.[0];
        const raw = entity ?? token[i];
        const char = /\s/.test(raw) ? " " : entity ? decodeEntity(entity) : raw;
        const prev = glyphs[glyphs.length - 1];
        if (char === " " && prev?.char === " ") prev.end = pos + i + raw.length;
        else glyphs.push({ char, start: pos + i, end: pos + i + raw.length });
        i += raw.length;
      }
    }
    pos += token.length;
  }
  return { glyphs, offsets };
}

/** Las etiquetas entre `from` y `to` abren y cierran por completo dentro del tramo */
function isBalanced(tokens: string[], from: number, to: number): boolean {
  const stack: string[] = [];
  for (const token of tokens.slice(from, to + 1)) {
    if (!token.startsWith("<")) continue;
    const name = /^<\/?([a-z0-9]+)/i.exec(token)?.[1]?.toLowerCase() ?? "";
    if (!INLINE_TAGS.has(name)) return false;
    if (token.startsWith("</")) {
      if (stack.pop() !== name) return false;
    } else {
      stack.push(name);
    }
  }
  return stack.length === 0;
}

/**
 * Envuelve la primera aparición de `trigger` en `html`.
 * Devuelve `null` si no aparece o si cruza etiquetas de forma que no se puede envolver sin romper el HTML.
 */
function wrapFirst(html: string, trigger: string, noteId: string, inHeadings: boolean): string | null {
  const tokens = html.split(/(<[^>]+>)/).filter((t) => t !== "");
  const { glyphs, offsets } = collectGlyphs(tokens, inHeadings);
  const text = glyphs.map((g) => g.char).join("");
  const at = text.indexOf(trigger);
  if (at === -1) return null;

  const first = glyphs[at];
  const last = glyphs[at + trigger.length - 1];
  const tokenOf = (rawPos: number) => {
    let i = offsets.length - 1;
    while (offsets[i] > rawPos) i--;
    return i;
  };
  const startToken = tokenOf(first.start);
  const endToken = tokenOf(last.end - 1);
  if (!isBalanced(tokens, startToken + 1, endToken - 1)) return null;

  return (
    html.slice(0, first.start) +
    `<span data-note-id="${escapeAttr(noteId)}">` +
    html.slice(first.start, last.end) +
    "</span>" +
    html.slice(last.end)
  );
}

/**
 * Marca en los capítulos la primera aparición de cada nota con `<span data-note-id="ID">`.
 * Busca capítulo por capítulo (las notas traen `chapterIndex` 0 aunque la parte tenga varios).
 * Devuelve los capítulos y solo las notas que quedaron marcadas; las demás se avisan en el log.
 */
export function markAuthorNotes(
  chapters: { html: string }[],
  notes: AuthorNote[],
): { htmls: string[]; marked: AuthorNote[] } {
  const htmls = chapters.map((c) => c.html);
  const marked: AuthorNote[] = [];
  for (const note of notes) {
    const trigger = normalize(note.triggerText);
    let done = false;
    // Primero en el texto; si el disparador es un título de capítulo, en el título
    for (const inHeadings of [false, true]) {
      for (let i = 0; i < htmls.length && !done; i++) {
        const next = wrapFirst(htmls[i], trigger, note.id, inHeadings);
        if (next) {
          htmls[i] = next;
          marked.push(note);
          done = true;
        }
      }
    }
    if (!done) {
      console.warn(`[libro] Nota ${note.id} (parte ${note.partNumber}) omitida: no se pudo marcar "${trigger}"`);
    }
  }
  return { htmls, marked };
}
