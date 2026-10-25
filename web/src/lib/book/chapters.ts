import sanitizeHtml from "sanitize-html";
import { htmlToText } from "./reading";

export interface RawChapter {
  title: string;
  html: string;
}

const NBSP = / |&nbsp;/g;

/** Lista blanca: sin clases, estilos ni `<o:p>` de Word; b/i pasan a strong/em */
export function cleanWordHtml(raw: string): string {
  return sanitizeHtml(raw.replace(NBSP, " "), {
    allowedTags: ["p", "br", "em", "strong"],
    allowedAttributes: {},
    transformTags: { b: "strong", i: "em" },
  });
}

const decodeEntities = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Título si el párrafo es solo negritas y corto; `null` si es texto normal */
function paragraphTitle(inner: string): string | null {
  const outsideBold = inner.replace(/<strong>[\s\S]*?<\/strong>/g, "");
  if (htmlToText(outsideBold)) return null;
  const title = decodeEntities(htmlToText(inner));
  return title && title.length <= 100 ? title : null;
}

/**
 * Limpia el HTML de Word y lo parte en capítulos por sus títulos en negritas
 * (cada uno pasa a `<h2>`). El texto previo al primer título va en el primer capítulo.
 * Sin títulos, todo queda en un solo capítulo llamado `fallbackTitle`.
 */
export function splitIntoChapters(raw: string, fallbackTitle: string): RawChapter[] {
  const clean = cleanWordHtml(raw);
  const chapters: { title: string | null; blocks: string[] }[] = [{ title: null, blocks: [] }];

  for (const [, inner] of clean.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
    if (!htmlToText(inner)) continue;
    const title = paragraphTitle(inner);
    if (title) {
      // Un título al inicio abre el primer capítulo en lugar de dejar uno vacío
      const current = chapters[chapters.length - 1];
      if (current.title === null && current.blocks.length === 0) current.title = title;
      else chapters.push({ title, blocks: [] });
      continue;
    }
    const body = inner.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
    chapters[chapters.length - 1].blocks.push(`<p>${body}</p>`);
  }

  return chapters.map((c) => ({
    title: c.title ?? fallbackTitle,
    html: `<h2>${escapeText(c.title ?? fallbackTitle)}</h2>${c.blocks.join("")}`,
  }));
}
