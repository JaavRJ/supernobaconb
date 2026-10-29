import { htmlToText } from "@/lib/book/reading";

/**
 * Limpieza del texto del libro en el navegador. Deja la misma lista blanca que usa el sitio
 * (`p`, `br`, `em`, `strong`) para que lo guardado se lea igual que lo que se ve en el editor.
 */

const SKIP = new Set(["script", "style", "head", "title", "meta", "link", "template"]);
const BLOCK = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "blockquote",
  "section", "article", "table", "tr", "pre", "header", "footer",
]);

const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decodeEntities = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

interface Ctx {
  blocks: string[];
  cur: string;
}

/** Junta etiquetas iguales contiguas (`</strong><strong>`) que deja el recorrido nodo por nodo */
function mergeAdjacent(html: string): string {
  let out = html;
  let prev = "";
  while (out !== prev) {
    prev = out;
    out = out.replace(/<\/em><\/strong><strong><em>/g, "").replace(/<\/strong><strong>/g, "").replace(/<\/em><em>/g, "");
  }
  return out;
}

function flush(ctx: Ctx) {
  const inner = mergeAdjacent(ctx.cur.replace(/^(?:\s|<br>)+|(?:\s|<br>)+$/g, ""));
  if (htmlToText(inner)) ctx.blocks.push(`<p>${inner}</p>`);
  ctx.cur = "";
}

/** Word y Google Docs marcan negritas y cursivas con estilos en `span` en lugar de `b` / `i` */
function isBold(el: HTMLElement, tag: string, inherited: boolean): boolean {
  const weight = el.style.fontWeight;
  if (weight) return weight === "bold" || weight === "bolder" || Number(weight) >= 600;
  return tag === "b" || tag === "strong" ? true : inherited;
}

function isItalic(el: HTMLElement, tag: string, inherited: boolean): boolean {
  const style = el.style.fontStyle;
  if (style) return style === "italic" || style === "oblique";
  return tag === "i" || tag === "em" ? true : inherited;
}

function walk(node: Node, bold: boolean, italic: boolean, ctx: Ctx) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").replace(/[\s ]+/g, " ");
    if (!text) return;
    let out = escapeText(text);
    if (text.trim()) {
      if (italic) out = `<em>${out}</em>`;
      if (bold) out = `<strong>${out}</strong>`;
    }
    ctx.cur += out;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (SKIP.has(tag)) return;
  if (tag === "br") {
    ctx.cur += "<br>";
    return;
  }
  const nextBold = /^h[1-6]$/.test(tag) || isBold(el, tag, bold);
  const nextItalic = isItalic(el, tag, italic);
  const isBlock = BLOCK.has(tag);
  if (isBlock) flush(ctx);
  el.childNodes.forEach((child) => walk(child, nextBold, nextItalic, ctx));
  if (isBlock) flush(ctx);
}

/** HTML pegado o guardado -> solo `<p>`, `<br>`, `<em>` y `<strong>`; los párrafos vacíos se omiten */
export function cleanBookHtml(raw: string): string {
  const doc = new DOMParser().parseFromString(raw, "text/html");
  const ctx: Ctx = { blocks: [], cur: "" };
  doc.body.childNodes.forEach((child) => walk(child, false, false, ctx));
  flush(ctx);
  return ctx.blocks.join("\n");
}

/** Texto plano pegado -> un párrafo por línea */
export function plainTextToHtml(text: string): string {
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeText(line)}</p>`)
    .join("\n");
}

/** Texto visible (para buscar la frase de una nota); sin etiquetas y con espacios colapsados */
export function visibleText(html: string): string {
  return decodeEntities(htmlToText(html)).replace(/\s+/g, " ").trim();
}

export interface ChapterPreview {
  title: string;
  paragraphs: number;
}

/** Título si el párrafo es solo negritas y corto; `null` si es texto normal (mismo criterio que el sitio) */
function paragraphTitle(inner: string): string | null {
  const outsideBold = inner.replace(/<strong>[\s\S]*?<\/strong>/g, "");
  if (htmlToText(outsideBold)) return null;
  const title = decodeEntities(htmlToText(inner));
  return title && title.length <= 100 ? title : null;
}

/**
 * Cómo partirá el sitio este HTML (ya limpio) en capítulos: cada párrafo corto todo en negritas abre uno.
 * Si no hay títulos, un solo capítulo llamado `fallbackTitle`.
 */
export function previewChapters(cleanHtml: string, fallbackTitle: string): ChapterPreview[] {
  const chapters: { title: string | null; paragraphs: number }[] = [{ title: null, paragraphs: 0 }];
  for (const [, inner] of cleanHtml.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
    if (!htmlToText(inner)) continue;
    const title = paragraphTitle(inner);
    if (title) {
      const current = chapters[chapters.length - 1];
      if (current.title === null && current.paragraphs === 0) current.title = title;
      else chapters.push({ title, paragraphs: 0 });
      continue;
    }
    chapters[chapters.length - 1].paragraphs += 1;
  }
  return chapters.map((c) => ({ title: c.title ?? fallbackTitle, paragraphs: c.paragraphs }));
}
