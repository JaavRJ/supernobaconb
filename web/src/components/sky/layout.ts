import type { Constellation, ConstellationId, Era, Thread, ThreadKind, Work } from "@/types/content";

export type SkyOrientation = "landscape" | "portrait";

/** Sistema de coordenadas del cielo (viewBox): apaisado 1000×600, vertical 600×1000 */
export const SKY_WIDTH = 1000;
export const SKY_HEIGHT = 600;

export function skySize(orientation: SkyOrientation): { width: number; height: number } {
  return orientation === "portrait"
    ? { width: SKY_HEIGHT, height: SKY_WIDTH }
    : { width: SKY_WIDTH, height: SKY_HEIGHT };
}
/** Margen interior: ninguna estrella (con su radio) queda más cerca del borde */
export const SKY_MARGIN = 56;
/** Separación mínima entre centros de estrellas */
export const MIN_STAR_DISTANCE = 64;

const CORE_RADIUS = 8;
/** Radio con que se dibuja la estrella-brújula del núcleo (unidades del viewBox) */
export function coreVisualRadius(orientation: SkyOrientation): number {
  return orientation === "portrait" ? 46 : 56;
}
const ORBIT_RADIUS = 5;
const BRIGHTNESS_OLDEST = 0.45;
const BRIGHTNESS_UNRELEASED = 0.2;

export interface SkyInput {
  /** Por defecto `landscape` */
  orientation?: SkyOrientation;
  constellations: Constellation[];
  /** Obras visibles (sin `hidden`) */
  works: Work[];
  /** Hilos entre obras; se omiten los que no unen dos estrellas visibles */
  threads?: Thread[];
}

export interface SkyStar {
  workId: string;
  constellation: ConstellationId;
  x: number;
  y: number;
  r: number;
  /** 0–1; más nuevo = más brillante */
  brightness: number;
  unreleased: boolean;
  color: string;
  /** Núcleo de la constelación (obra con `role: "nucleo"`): se dibuja con la estrella-brújula */
  core: boolean;
  /** Estrella principal: el núcleo, o la más reciente si no hay; lleva el ícono de la faceta */
  main: boolean;
}

export interface SkyLine {
  constellation: ConstellationId;
  /** Ids de las obras que une */
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SkyThread {
  id: string;
  kind: ThreadKind;
  /** Ids de las obras de origen y destino */
  from: string;
  to: string;
  /** Curva cuadrática `M … Q … …` entre las dos estrellas */
  path: string;
  fromPart?: number;
}

export interface SkyLabel {
  constellation: ConstellationId;
  name: string;
  facet: string;
  x: number;
  y: number;
}

export interface SkyLayout {
  orientation: SkyOrientation;
  /** Tamaño del viewBox */
  width: number;
  height: number;
  stars: SkyStar[];
  lines: SkyLine[];
  threads: SkyThread[];
  labels: SkyLabel[];
}

/** Hash FNV-1a de una cadena, normalizado a [0, 1) */
function hash01(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h / 0x100000000;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Fecha ISO → días desde 1970 (UTC), sin usar Date */
export function isoToDays(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn =
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045;
  return jdn - 2440588;
}

function byReleaseDate(a: Work, b: Work): number {
  if (!a.releaseDate && !b.releaseDate) return 0;
  if (!a.releaseDate) return 1;
  if (!b.releaseDate) return -1;
  return a.releaseDate.localeCompare(b.releaseDate);
}

const GOLDEN_ANGLE = 2.399963229728653;

/** Brillo de cada obra según su fecha dentro del rango de las publicadas */
function computeBrightness(works: Work[]): Map<string, number> {
  const dated = works.filter((w) => w.releaseDate);
  const result = new Map<string, number>();
  if (dated.length === 0) return result;
  const days = dated.map((w) => isoToDays(w.releaseDate as string));
  const min = Math.min(...days);
  const max = Math.max(...days);
  dated.forEach((w, i) => {
    const t = max === min ? 1 : (days[i] - min) / (max - min);
    result.set(w.id, round(BRIGHTNESS_OLDEST + t * (1 - BRIGHTNESS_OLDEST)));
  });
  return result;
}

function isFarEnough(x: number, y: number, placed: { x: number; y: number }[]): boolean {
  return placed.every((p) => Math.hypot(p.x - x, p.y - y) >= MIN_STAR_DISTANCE);
}

/** Desplazamientos del punto de control (fracción de la distancia) para hilos entre el mismo par */
const THREAD_CURVES = [0.22, -0.22, 0.4, -0.4, 0.56, -0.56];

function layoutThreads(threads: Thread[], stars: SkyStar[]): SkyThread[] {
  const byId = new Map(stars.map((s) => [s.workId, s]));
  const perPair = new Map<string, number>();
  const result: SkyThread[] = [];

  for (const t of threads) {
    const a = byId.get(t.from);
    const b = byId.get(t.to);
    if (!a || !b) continue;
    const pair = [t.from, t.to].sort().join("|");
    const index = perPair.get(pair) ?? 0;
    perPair.set(pair, index + 1);

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    // Perpendicular respecto al sentido origen → destino; la curvatura la fija el índice
    const offset = THREAD_CURVES[index % THREAD_CURVES.length] * dist;
    const cx = (a.x + b.x) / 2 + (-dy / dist) * offset;
    const cy = (a.y + b.y) / 2 + (dx / dist) * offset;

    result.push({
      id: t.id,
      kind: t.kind,
      from: t.from,
      to: t.to,
      path: `M ${round(a.x)} ${round(a.y)} Q ${round(cx)} ${round(cy)} ${round(b.x)} ${round(b.y)}`,
      ...(t.fromPart !== undefined ? { fromPart: t.fromPart } : {}),
    });
  }
  return result;
}

/**
 * Región de cada constelación en el cielo vertical: se ordenan por su x apaisada y se reparten
 * en zigzag de arriba abajo (izquierda, derecha, izquierda…). Deja libre la franja de la nebulosa.
 */
function portraitRegions(constellations: Constellation[]): Map<ConstellationId, { x: number; y: number }> {
  const ordered = [...constellations].sort(
    (a, b) => a.skyRegion.x - b.skyRegion.x || a.id.localeCompare(b.id),
  );
  const n = ordered.length;
  return new Map(
    ordered.map((c, i) => [
      c.id,
      { x: i % 2 === 0 ? 0.36 : 0.64, y: n === 1 ? 0.55 : 0.3 + (0.52 * i) / (n - 1) },
    ]),
  );
}

export function layoutSky({
  constellations,
  works,
  threads = [],
  orientation = "landscape",
}: SkyInput): SkyLayout {
  const portrait = orientation === "portrait";
  const { width: skyW, height: skyH } = skySize(orientation);
  const regions = portrait ? portraitRegions(constellations) : null;
  // Elipse de las órbitas: ancha en apaisado, casi redonda en vertical
  const orbitX = portrait ? 0.9 : 1.25;
  const orbitY = portrait ? 1 : 0.8;
  const labelHalf = portrait ? 120 : 90;
  const brightness = computeBrightness(works);
  const stars: SkyStar[] = [];
  const lines: SkyLine[] = [];
  const labels: SkyLabel[] = [];
  const placed: { x: number; y: number }[] = [];

  const minX = SKY_MARGIN;
  const maxX = skyW - SKY_MARGIN;
  const minY = SKY_MARGIN;
  const maxY = skyH - SKY_MARGIN;

  // Primero las posiciones manuales, para que las automáticas las esquiven
  const manual = new Map<string, { x: number; y: number }>();
  // Las posiciones manuales se pensaron para el cielo apaisado; en vertical se ignoran
  for (const w of works) {
    if (w.skyPosition && !portrait) {
      const p = {
        x: clamp(w.skyPosition.x * skyW, minX, maxX),
        y: clamp(w.skyPosition.y * skyH, minY, maxY),
      };
      manual.set(w.id, p);
      placed.push(p);
    }
  }

  for (const c of constellations) {
    const own = works.filter((w) => w.constellation === c.id).sort(byReleaseDate);
    const region = regions?.get(c.id) ?? c.skyRegion;
    const cx = region.x * skyW;
    const cy = region.y * skyH;
    const constellationStars: SkyStar[] = [];
    // Sin núcleo, la primera obra ocupa el centro de la constelación
    const hasCore = own.some((w) => w.role === "nucleo");
    let orbitIndex = 0;
    let first = true;

    for (const w of own) {
      const isCore = w.role === "nucleo";
      const r = isCore ? CORE_RADIUS : ORBIT_RADIUS;
      let pos = manual.get(w.id);

      if (!pos) {
        const seed = hash01(w.id);
        const atCenter = isCore || (!hasCore && first);
        first = false;
        if (atCenter) {
          pos = { x: cx + (seed - 0.5) * 16, y: cy + (hash01(w.id + "y") - 0.5) * 16 };
        } else {
          orbitIndex += 1;
          const baseAngle = orbitIndex * GOLDEN_ANGLE + seed * Math.PI;
          const baseRadius = 100 + orbitIndex * 28 + hash01(w.id + "r") * 36;
          // Si choca con otra estrella o sale del margen, prueba otros ángulos y radios
          let found: { x: number; y: number } | undefined;
          for (let attempt = 0; attempt < 240 && !found; attempt++) {
            const ring = Math.floor(attempt / 24);
            const angle = baseAngle + (attempt % 24) * (Math.PI / 12) * (attempt % 2 ? 1 : -1);
            const radius = baseRadius + ring * 24;
            const x = cx + Math.cos(angle) * radius * orbitX;
            const y = cy + Math.sin(angle) * radius * orbitY;
            if (x < minX || x > maxX || y < minY || y > maxY) continue;
            if (isFarEnough(x, y, placed)) found = { x, y };
          }
          pos = found ?? {
            x: clamp(cx + Math.cos(baseAngle) * baseRadius, minX, maxX),
            y: clamp(cy + Math.sin(baseAngle) * baseRadius, minY, maxY),
          };
        }
        placed.push(pos);
      }

      const released = Boolean(w.releaseDate);
      constellationStars.push({
        workId: w.id,
        constellation: c.id,
        x: round(pos.x),
        y: round(pos.y),
        r,
        brightness: released ? (brightness.get(w.id) ?? 1) : BRIGHTNESS_UNRELEASED,
        unreleased: !released,
        color: c.color,
        core: isCore,
        main: false,
      });
    }

    const mainStar =
      constellationStars.find((s) => s.core) ??
      constellationStars.filter((s) => !s.unreleased).sort((a, b) => b.brightness - a.brightness).at(0) ??
      constellationStars.at(0);
    if (mainStar) mainStar.main = true;

    for (let i = 1; i < constellationStars.length; i++) {
      const a = constellationStars[i - 1];
      const b = constellationStars[i];
      lines.push({
        constellation: c.id,
        from: a.workId,
        to: b.workId,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
      });
    }

    if (constellationStars.length > 0) {
      const lowest = Math.max(
        ...constellationStars.map((s) => s.y + (s.core ? coreVisualRadius(orientation) : s.r)),
      );
      const xs = constellationStars.map((s) => s.x);
      labels.push({
        constellation: c.id,
        name: c.name,
        facet: c.facet,
        x: round(clamp((Math.min(...xs) + Math.max(...xs)) / 2, labelHalf, skyW - labelHalf)),
        y: round(Math.min(lowest + 44, skyH - 28)),
      });
    }
    stars.push(...constellationStars);
  }

  return {
    orientation,
    width: skyW,
    height: skyH,
    stars,
    lines,
    threads: layoutThreads(threads, stars),
    labels,
  };
}

export interface SkyNebula {
  eraId: string;
  x: number;
  y: number;
  /** Radio de la nube en unidades del viewBox */
  r: number;
}

const NEBULA_Y = { landscape: 0.2, portrait: 0.1 };
const NEBULA_RADIUS = 64;

/** Una nebulosa por era en fase `nebulosa`, repartidas en horizontal arriba del cielo (en ambas orientaciones) */
export function layoutNebulas(eras: Era[], orientation: SkyOrientation = "landscape"): SkyNebula[] {
  const { width, height } = skySize(orientation);
  const nebulas = eras.filter((e) => e.phase === "nebulosa");
  return nebulas.map((e, i) => ({
    eraId: e.id,
    x: round(((i + 1) / (nebulas.length + 1)) * width),
    y: round(NEBULA_Y[orientation] * height),
    r: NEBULA_RADIUS,
  }));
}
