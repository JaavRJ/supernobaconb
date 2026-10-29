/**
 * Tarjeta de cita para historias de Instagram (1080×1920), dibujada con canvas.
 * Solo corre en el navegador: usa `document`, las fuentes de `next/font` y la estrella-brújula.
 */

export const QUOTE_CARD_WIDTH = 1080;
export const QUOTE_CARD_HEIGHT = 1920;

export type QuoteCardVariant = "noche" | "papel" | "polaroid";

export const QUOTE_CARD_VARIANTS: { id: QuoteCardVariant; label: string }[] = [
  { id: "noche", label: "Noche" },
  { id: "papel", label: "Papel" },
  { id: "polaroid", label: "Polaroid" },
];

export interface QuoteCardInput {
  text: string;
  partNumber: number;
  partTitle: string;
  variant: QuoteCardVariant;
}

interface Palette {
  bg: string;
  fg: string;
  muted: string;
  /** Color base del polvo de estrellas (se le agrega la opacidad) */
  dust: string;
  /** Si el fondo es claro, la estrella se dibuja oscura */
  light: boolean;
}

const NIGHT: Palette = { bg: "#000000", fg: "#ffffff", muted: "rgba(255,255,255,0.62)", dust: "255,255,255", light: false };
const PAPER: Palette = { bg: "#f4f1ea", fg: "#000000", muted: "rgba(0,0,0,0.58)", dust: "70,70,70", light: true };

const MAX_LINES = 12;
const MAX_SIZE = 64;
const MIN_SIZE = 40;

interface Families {
  quote: string;
  title: string;
  ui: string;
}

/** Nombre real de cada familia: next/font las expone en variables CSS del <html> */
function families(): Families {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    quote: read("--font-cormorant", "serif"),
    title: read("--font-uncial", "serif"),
    ui: read("--font-inter", "sans-serif"),
  };
}

/** Generador pseudoaleatorio con semilla: la misma cita da siempre el mismo cielo */
function seeded(seedText: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawDust(
  ctx: CanvasRenderingContext2D,
  seed: string,
  palette: Palette,
  area: { x: number; y: number; w: number; h: number },
  count: number,
) {
  const rand = seeded(seed);
  for (let i = 0; i < count; i++) {
    const x = area.x + rand() * area.w;
    const y = area.y + rand() * area.h;
    const big = rand() > 0.94;
    const r = big ? 1.8 + rand() * 1.4 : 0.6 + rand() * 1.1;
    const alpha = (big ? 0.7 : 0.25) + rand() * 0.3;
    ctx.fillStyle = `rgba(${palette.dust},${alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

/** Parte la cita en líneas que caben en `maxWidth` con la fuente ya puesta en `ctx` */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Ajusta tamaño y líneas para que la cita quepa; si no cabe ni al mínimo, recorta con "…" */
function fitQuote(ctx: CanvasRenderingContext2D, family: string, text: string, box: { w: number; h: number }) {
  const quoted = `“${text.replace(/\s+/g, " ").trim()}”`;
  for (let size = MAX_SIZE; size >= MIN_SIZE; size -= 2) {
    ctx.font = `italic 400 ${size}px ${family}`;
    const lines = wrapLines(ctx, quoted, box.w);
    const lineHeight = Math.round(size * 1.32);
    if (lines.length <= MAX_LINES && lines.length * lineHeight <= box.h) return { size, lineHeight, lines };
  }
  const size = MIN_SIZE;
  const lineHeight = Math.round(size * 1.32);
  ctx.font = `italic 400 ${size}px ${family}`;
  const fits = Math.min(MAX_LINES, Math.floor(box.h / lineHeight));
  const lines = wrapLines(ctx, quoted, box.w).slice(0, fits);
  let last = lines[fits - 1] ?? lines[lines.length - 1] ?? "";
  while (last && ctx.measureText(`${last}…`).width > box.w) last = last.slice(0, -1).trimEnd();
  lines[lines.length - 1] = `${last}…`;
  return { size, lineHeight, lines };
}

function drawQuote(
  ctx: CanvasRenderingContext2D,
  family: string,
  text: string,
  color: string,
  box: { x: number; y: number; w: number; h: number },
) {
  const { lineHeight, lines } = fitQuote(ctx, family, text, box);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const top = box.y + (box.h - lines.length * lineHeight) / 2 + lineHeight / 2;
  lines.forEach((line, i) => ctx.fillText(line, box.x + box.w / 2, top + i * lineHeight));
}

/** "PARTE N · TÍTULO" en una línea; si es larga, baja el tamaño y al final recorta */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  family: string,
  text: string,
  color: string,
  cx: number,
  y: number,
  maxWidth: number,
) {
  let size = 26;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  let shown = text;
  for (; size >= 18; size -= 2) {
    ctx.font = `400 ${size}px ${family}`;
    setSpacing(ctx, size * 0.2);
    if (ctx.measureText(shown).width <= maxWidth) break;
  }
  while (shown.length > 1 && ctx.measureText(shown).width > maxWidth) shown = `${shown.slice(0, -2).trimEnd()}…`;
  ctx.fillText(shown, cx, y);
  setSpacing(ctx, 0);
}

/** BRILL✦ DE UNA ESTRELLA MUERTA, con la estrella-brújula en lugar de la O */
function drawBrand(
  ctx: CanvasRenderingContext2D,
  family: string,
  star: HTMLImageElement | null,
  palette: Palette,
  fg: string,
  y: number,
) {
  const size = 40;
  ctx.font = `400 ${size}px ${family}`;
  setSpacing(ctx, 5);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const starSize = Math.round(size * 1.5);
  const head = "BRILL";
  const tail = " DE UNA ESTRELLA MUERTA";
  const headW = ctx.measureText(head).width;
  const tailW = ctx.measureText(tail).width;
  const total = headW + starSize + tailW;
  const x = (QUOTE_CARD_WIDTH - total) / 2;

  ctx.fillStyle = fg;
  ctx.fillText(head, x, y);
  ctx.fillText(tail, x + headW + starSize, y);
  setSpacing(ctx, 0);

  if (!star) {
    ctx.fillText("O", x + headW, y);
    return;
  }
  // La imagen es blanca sobre negro: en fondo oscuro se suma ("lighter") y en claro se
  // invierte y se multiplica, así el negro de la imagen no se ve en ningún caso
  const sx = x + headW + 2;
  const sy = y - starSize / 2;
  if (!palette.light) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(star, sx, sy, starSize, starSize);
    ctx.restore();
    return;
  }
  const layer = document.createElement("canvas");
  layer.width = starSize;
  layer.height = starSize;
  const lctx = layer.getContext("2d");
  if (!lctx) return;
  lctx.drawImage(star, 0, 0, starSize, starSize);
  lctx.globalCompositeOperation = "difference";
  lctx.fillStyle = "#fff";
  lctx.fillRect(0, 0, starSize, starSize);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(layer, sx, sy);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderQuoteCard({ text, partNumber, partTitle, variant }: QuoteCardInput): Promise<Blob> {
  const fam = families();
  const caption = `Parte ${partNumber} · ${partTitle}`.toLocaleUpperCase("es");
  await Promise.all([
    document.fonts.load(`italic 400 64px ${fam.quote}`, text),
    document.fonts.load(`400 40px ${fam.title}`, "BRILL DE UNA ESTRELLA MUERTA"),
    document.fonts.load(`400 26px ${fam.ui}`, `${caption} supernobaconb`),
  ]);
  const star = await loadImage("/brand/estrella.jpg");

  const canvas = document.createElement("canvas");
  canvas.width = QUOTE_CARD_WIDTH;
  canvas.height = QUOTE_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  const W = QUOTE_CARD_WIDTH;
  const H = QUOTE_CARD_HEIGHT;
  const palette = variant === "papel" ? PAPER : NIGHT;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);
  drawDust(ctx, text, palette, { x: 0, y: 0, w: W, h: H }, 260);

  if (variant === "polaroid") {
    // Marco blanco con borde inferior ancho; la foto es un cuadro negro con su propio polvo
    const frame = { x: 80, y: 200, w: 920, h: 1360 };
    const photo = { x: 130, y: 250, w: 820, h: 1010 };
    ctx.fillStyle = "#f4f1ea";
    roundRect(ctx, frame.x, frame.y, frame.w, frame.h, 8);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(photo.x, photo.y, photo.w, photo.h);
    ctx.clip();
    drawDust(ctx, `${text}·p`, NIGHT, photo, 90);
    ctx.restore();
    drawQuote(ctx, fam.quote, text, "#ffffff", { x: photo.x + 50, y: photo.y + 40, w: photo.w - 100, h: photo.h - 80 });
    drawCaption(ctx, fam.ui, caption, "#000000", W / 2, 1410, frame.w - 100);
  } else {
    drawQuote(ctx, fam.quote, text, palette.fg, { x: 130, y: 260, w: W - 260, h: 1190 });
    drawCaption(ctx, fam.ui, caption, palette.muted, W / 2, 1540, W - 200);
  }

  drawBrand(ctx, fam.title, star, palette, palette.fg, 1700);
  ctx.font = `400 24px ${fam.ui}`;
  setSpacing(ctx, 5);
  ctx.fillStyle = palette.muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("supernobaconb", W / 2, 1810);
  setSpacing(ctx, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo crear la imagen"))), "image/png");
  });
}
