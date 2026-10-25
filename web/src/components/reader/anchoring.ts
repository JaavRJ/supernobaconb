/**
 * Anclaje de resaltados y citas al texto del servidor sin modificar el HTML:
 * se indexa el texto de los cuerpos de capítulo (`[data-chapter-body]`) y las
 * posiciones se guardan como desplazamientos dentro del capítulo, con un poco
 * de contexto (prefijo y sufijo) para volver a encontrarlas.
 */

export const BODY_SELECTOR = "[data-chapter-body]";
const CONTEXT = 32;

export interface TextIndex {
  /** Texto de toda la parte (solo cuerpos de capítulo), sin separadores */
  text: string;
  nodes: { node: Text; start: number; end: number }[];
  /** Inicio global del cuerpo de cada capítulo */
  chapterStarts: number[];
  /** `text` sin espacios en blanco, y para cada letra su posición en `text` */
  stripped: string;
  map: number[];
}

export interface Anchor {
  text: string;
  chapterIndex: number;
  offset: number;
  prefix: string;
  suffix: string;
}

/** Datos mínimos para volver a ubicar un texto guardado (incluye los del sitio viejo) */
export interface Anchored {
  text: string;
  chapterIndex?: number;
  offset?: number;
  prefix?: string;
  suffix?: string;
}

const strip = (s: string) => s.replace(/\s+/g, "");

export function buildIndex(article: HTMLElement): TextIndex {
  const nodes: TextIndex["nodes"] = [];
  const chapterStarts: number[] = [];
  let text = "";
  const bodies = article.querySelectorAll<HTMLElement>(BODY_SELECTOR);
  bodies.forEach((body) => {
    chapterStarts.push(text.length);
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const node = n as Text;
      const value = node.data;
      if (!value) continue;
      nodes.push({ node, start: text.length, end: text.length + value.length });
      text += value;
    }
  });
  let stripped = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (/\s/.test(text[i])) continue;
    stripped += text[i];
    map.push(i);
  }
  return { text, nodes, chapterStarts, stripped, map };
}

export function chapterAt(index: TextIndex, global: number): number {
  let chapter = 0;
  index.chapterStarts.forEach((start, i) => {
    if (start <= global) chapter = i;
  });
  return chapter;
}

function chapterEnd(index: TextIndex, chapter: number): number {
  return index.chapterStarts[chapter + 1] ?? index.text.length;
}

/** Posición global de un punto límite de un rango */
function boundary(index: TextIndex, container: Node, offset: number): number {
  if (container.nodeType === Node.TEXT_NODE) {
    const hit = index.nodes.find((n) => n.node === container);
    if (hit) return hit.start + offset;
  }
  const probe = document.createRange();
  probe.setStart(container, offset);
  probe.collapse(true);
  for (const n of index.nodes) {
    if (probe.comparePoint(n.node, 0) >= 0) return n.start;
  }
  return index.text.length;
}

/** Ancla de una selección, o null si queda fuera del texto o está vacía */
export function anchorFromRange(index: TextIndex, range: Range): Anchor | null {
  const start = boundary(index, range.startContainer, range.startOffset);
  let end = boundary(index, range.endContainer, range.endOffset);
  if (end <= start) return null;
  const chapterIndex = chapterAt(index, start);
  end = Math.min(end, chapterEnd(index, chapterIndex));
  const text = index.text.slice(start, end);
  if (!text.trim()) return null;
  return {
    text,
    chapterIndex,
    offset: start - index.chapterStarts[chapterIndex],
    prefix: index.text.slice(Math.max(0, start - CONTEXT), start),
    suffix: index.text.slice(end, end + CONTEXT),
  };
}

/** Rango del DOM para posiciones globales [start, end) */
export function rangeFromGlobal(index: TextIndex, start: number, end: number): Range | null {
  const first = index.nodes.find((n) => start < n.end);
  const last = [...index.nodes].reverse().find((n) => end > n.start);
  if (!first || !last) return null;
  const range = document.createRange();
  range.setStart(first.node, Math.max(0, start - first.start));
  range.setEnd(last.node, Math.min(last.node.length, end - last.start));
  return range;
}

/** Posiciones globales de un texto guardado, o null si ya no está en la parte */
export function locate(index: TextIndex, item: Anchored): { start: number; end: number } | null {
  const needle = strip(item.text);
  if (!needle) return null;
  const prefix = strip(item.prefix ?? "");
  const suffix = strip(item.suffix ?? "");
  const exact = item.offset !== undefined && item.chapterIndex !== undefined;

  let best = -1;
  let bestScore = -1;
  let from = 0;
  for (let found = index.stripped.indexOf(needle, from), tries = 0; found >= 0 && tries < 200; tries++) {
    const globalStart = index.map[found];
    let score = 0;
    if (exact) {
      const expected = (index.chapterStarts[item.chapterIndex!] ?? 0) + item.offset!;
      if (globalStart === expected) score += 4;
      else if (chapterAt(index, globalStart) === item.chapterIndex) score += 1;
    }
    if (prefix && index.stripped.slice(Math.max(0, found - prefix.length), found) === prefix) score += 3;
    const after = found + needle.length;
    if (suffix && index.stripped.slice(after, after + suffix.length) === suffix) score += 3;
    if (score > bestScore) {
      best = found;
      bestScore = score;
    }
    from = found + 1;
    found = index.stripped.indexOf(needle, from);
  }
  if (best < 0) return null;
  return { start: index.map[best], end: index.map[best + needle.length - 1] + 1 };
}

export function findRange(index: TextIndex, item: Anchored): Range | null {
  const hit = locate(index, item);
  return hit ? rangeFromGlobal(index, hit.start, hit.end) : null;
}
