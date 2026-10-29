import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { cacheLife } from "next/cache";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { BookPart } from "@/types/book";
import { getBookPart } from "./index";

/** Carpeta de las fuentes (OFL) leída del disco del servidor */
const FONTS_DIR = path.join(process.cwd(), "src", "lib", "book", "fonts");

/** A5 en puntos */
const PAGE_W = 419.53;
const PAGE_H = 595.28;
const MARGIN_X = 52;
const MARGIN_TOP = 60;
const MARGIN_BOTTOM = 66;
const TEXT_W = PAGE_W - MARGIN_X * 2;

const BODY_SIZE = 11.5;
const LEADING = BODY_SIZE * 1.45;
const INDENT = 16;
const BLACK = rgb(0, 0, 0);
const GREY = rgb(0.35, 0.35, 0.35);

/** Hasta cuánto se deja crecer un espacio al justificar antes de dejar la línea sin justificar */
const MAX_SPACE_STRETCH = 2.4;

interface Fonts {
  regular: PDFFont;
  italic: PDFFont;
  bold: PDFFont;
  boldItalic: PDFFont;
  uncial: PDFFont;
}

interface Run {
  text: string;
  italic: boolean;
  bold: boolean;
}

/** Párrafo: tramos con estilo; `\n` dentro de un tramo es un salto de línea forzado */
type Paragraph = Run[];

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : Number(body.slice(1));
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : "";
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/** Quita caracteres que la fuente no dibuja (de control, ancho cero) y unifica espacios */
function cleanText(s: string): string {
  return s
    .replace(/[\u0000-\u0008\u000b-\u001f​-‍⁠﻿]/g, "")
    .replace(/[   ]/g, " ");
}

/** HTML limpio de un capítulo (`p`, `br`, `em`, `strong`, `h2`; el `span` de notas pasa transparente) a párrafos */
export function htmlToParagraphs(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let current: Paragraph | null = null;
  let italic = 0;
  let bold = 0;
  let skipHeading = false;

  const push = (text: string) => {
    if (!text || !current) return;
    current.push({ text, italic: italic > 0, bold: bold > 0 });
  };
  const close = () => {
    if (current && current.some((r) => r.text.trim() !== "")) paragraphs.push(current);
    current = null;
  };

  for (const token of html.split(/(<[^>]+>)/)) {
    if (token === "") continue;
    if (!token.startsWith("<")) {
      if (skipHeading) continue;
      // Un texto suelto fuera de `<p>` abre su propio párrafo
      current ??= [];
      push(cleanText(decodeEntities(token)).replace(/\s+/g, " "));
      continue;
    }
    const closing = token.startsWith("</");
    const name = /^<\/?([a-z0-9]+)/i.exec(token)?.[1]?.toLowerCase();
    switch (name) {
      case "h2":
        // El título se dibuja aparte, con la fuente de títulos
        skipHeading = !closing;
        break;
      case "p":
        if (closing) close();
        else {
          close();
          current = [];
        }
        break;
      case "br":
        current ??= [];
        push("\n");
        break;
      case "em":
      case "i":
        italic = Math.max(0, italic + (closing ? -1 : 1));
        break;
      case "strong":
      case "b":
        bold = Math.max(0, bold + (closing ? -1 : 1));
        break;
      default:
        break;
    }
  }
  close();
  return paragraphs;
}

interface Word {
  text: string;
  font: PDFFont;
  width: number;
}

interface Line {
  words: Word[];
  /** Línea que no se justifica (última del párrafo o antes de un salto forzado) */
  loose: boolean;
  indent: number;
}

function pickFont(fonts: Fonts, run: Run): PDFFont {
  if (run.bold) return run.italic ? fonts.boldItalic : fonts.bold;
  return run.italic ? fonts.italic : fonts.regular;
}

/** Parte el párrafo en líneas que caben en `TEXT_W`, midiendo cada palabra con su fuente */
function breakLines(paragraph: Paragraph, fonts: Fonts, firstIndent: number): Line[] {
  const spaceW = fonts.regular.widthOfTextAtSize(" ", BODY_SIZE);
  const lines: Line[] = [];
  let words: Word[] = [];
  let used = 0;
  let indent = firstIndent;

  const flush = (loose: boolean) => {
    if (words.length > 0) lines.push({ words, loose, indent });
    words = [];
    used = 0;
    indent = 0;
  };

  for (const run of paragraph) {
    const font = pickFont(fonts, run);
    // Un salto forzado separa segmentos; el resto se parte en palabras
    const segments = run.text.split("\n");
    segments.forEach((segment, segIndex) => {
      if (segIndex > 0) flush(true);
      for (const text of segment.split(/ +/)) {
        if (text === "") continue;
        const width = font.widthOfTextAtSize(text, BODY_SIZE);
        const avail = TEXT_W - indent;
        const needed = used + (words.length > 0 ? spaceW : 0) + width;
        if (words.length > 0 && needed > avail) flush(false);
        used += (words.length > 0 ? spaceW : 0) + width;
        words.push({ text, font, width });
      }
    });
  }
  flush(true);
  return lines;
}

/** Parte un texto en líneas de como mucho `maxWidth` (para títulos y portada) */
function wrapPlain(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCentered(page: PDFPage, text: string, font: PDFFont, size: number, y: number, color = BLACK) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE_W - w) / 2, y, size, font, color });
}

/** Texto centrado con espacio extra entre letras (rótulos en versalitas) */
function drawSpaced(page: PDFPage, text: string, font: PDFFont, size: number, tracking: number, y: number) {
  const chars = [...text];
  const total = chars.reduce((sum, c) => sum + font.widthOfTextAtSize(c, size) + tracking, -tracking);
  let x = (PAGE_W - total) / 2;
  for (const c of chars) {
    page.drawText(c, { x, y, size, font, color: BLACK });
    x += font.widthOfTextAtSize(c, size) + tracking;
  }
}

function drawCover(doc: PDFDocument, fonts: Fonts, part: BookPart) {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const maxW = PAGE_W - 110;

  let y = PAGE_H - 150;
  for (const line of wrapPlain("BRILLO DE UNA ESTRELLA MUERTA", fonts.uncial, 25, maxW)) {
    drawCentered(page, line, fonts.uncial, 25, y);
    y -= 34;
  }

  y -= 26;
  page.drawLine({ start: { x: PAGE_W / 2 - 28, y }, end: { x: PAGE_W / 2 + 28, y }, thickness: 0.6, color: BLACK });
  y -= 44;

  drawSpaced(page, `PARTE ${part.number}`, fonts.bold, 12, 3.2, y);
  y -= 46;
  for (const line of wrapPlain(part.title, fonts.uncial, 32, maxW)) {
    drawCentered(page, line, fonts.uncial, 32, y);
    y -= 42;
  }
  if (part.subtitle) {
    y -= 8;
    for (const line of wrapPlain(part.subtitle, fonts.italic, 14, maxW - 20)) {
      drawCentered(page, line, fonts.italic, 14, y, GREY);
      y -= 20;
    }
  }

  drawSpaced(page, "SUPERNOBA", fonts.bold, 10.5, 3.6, 54);
}

/** Dibuja las páginas de un capítulo (empieza en página nueva) */
function drawChapter(doc: PDFDocument, fonts: Fonts, title: string, html: string) {
  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;

  const titleSize = 20;
  y -= 30;
  for (const line of wrapPlain(title, fonts.uncial, titleSize, TEXT_W)) {
    drawCentered(page, line, fonts.uncial, titleSize, y);
    y -= titleSize * 1.4;
  }
  y -= 22;

  const bottom = MARGIN_BOTTOM;
  const paragraphs = htmlToParagraphs(html);

  paragraphs.forEach((paragraph, pIndex) => {
    const lines = breakLines(paragraph, fonts, pIndex === 0 ? 0 : INDENT);
    for (const line of lines) {
      if (y - LEADING < bottom - 10) {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN_TOP;
      }
      y -= LEADING;

      const avail = TEXT_W - line.indent;
      const natural = line.words.reduce((sum, w) => sum + w.width, 0);
      const gaps = line.words.length - 1;
      const baseSpace = fonts.regular.widthOfTextAtSize(" ", BODY_SIZE);
      let space = baseSpace;
      if (!line.loose && gaps > 0) {
        const stretched = (avail - natural) / gaps;
        if (stretched >= baseSpace * 0.8 && stretched <= baseSpace * MAX_SPACE_STRETCH) space = stretched;
      }

      let x = MARGIN_X + line.indent;
      for (const word of line.words) {
        page.drawText(word.text, { x, y, size: BODY_SIZE, font: word.font, color: BLACK });
        x += word.width + space;
      }
    }
  });
}

/** Número de página al pie de cada página de texto (la portada no lleva) */
function numberPages(doc: PDFDocument, fonts: Fonts) {
  doc.getPages().forEach((page, index) => {
    if (index === 0) return;
    drawCentered(page, String(index + 1), fonts.regular, 10, 36, GREY);
  });
}

const fontFile = (name: string) => readFile(path.join(FONTS_DIR, name));

/** Arma el PDF de una parte (A5, fondo blanco y texto negro) */
export async function createPartPdf(part: BookPart): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const [regular, italic, bold, boldItalic, uncial] = await Promise.all([
    fontFile("CormorantGaramond-Regular.ttf"),
    fontFile("CormorantGaramond-Italic.ttf"),
    fontFile("CormorantGaramond-SemiBold.ttf"),
    fontFile("CormorantGaramond-SemiBoldItalic.ttf"),
    fontFile("UncialAntiqua-Regular.ttf"),
  ]);
  const embed = (bytes: Uint8Array) => doc.embedFont(bytes, { subset: true });
  const fonts: Fonts = {
    regular: await embed(regular),
    italic: await embed(italic),
    bold: await embed(bold),
    boldItalic: await embed(boldItalic),
    uncial: await embed(uncial),
  };

  const book = "Brillo de una Estrella Muerta";
  // Fechas fijas (la de publicación) para que el mismo texto dé siempre los mismos bytes
  const date = new Date(`${part.releaseDate}T12:00:00Z`);
  doc.setTitle(`${book} — Parte ${part.number}: ${part.title}`);
  doc.setAuthor("Supernoba");
  doc.setSubject(part.subtitle ? `${book}. ${part.subtitle}.` : book);
  doc.setCreator("supernoba.com");
  doc.setProducer("Supernoba");
  doc.setLanguage("es-MX");
  doc.setCreationDate(date);
  doc.setModificationDate(date);

  drawCover(doc, fonts, part);
  for (const chapter of part.chapters) drawChapter(doc, fonts, chapter.title, chapter.html);
  numberPages(doc, fonts);

  return doc.save();
}

/**
 * Bytes del PDF de una parte, en caché: solo cambian cuando cambia el texto de Firestore.
 * Igual que `getBookPart`, un fallo se guarda segundos para no fijarlo por horas. `null` si no se pudo leer la parte.
 */
export async function getPartPdf(partNumber: number): Promise<Uint8Array | null> {
  "use cache";
  const part = await getBookPart(partNumber);
  if (!part) {
    cacheLife("seconds");
    return null;
  }
  cacheLife("hours");
  return createPartPdf(part);
}
