import type { Constellation, ConstellationId, Thread, ThreadKind, Work } from "@/types/content";

/** Sistema de coordenadas del cielo (viewBox) */
export const SKY_WIDTH = 1000;
export const SKY_HEIGHT = 600;
/** Margen interior: ninguna estrella (con su radio) queda más cerca del borde */
export const SKY_MARGIN = 56;
/** Separación mínima entre centros de estrellas */
export const MIN_STAR_DISTANCE = 64;

const CORE_RADIUS = 8;
const ORBIT_RADIUS = 5;
const BRIGHTNESS_OLDEST = 0.45;
const BRIGHTNESS_UNRELEASED = 0.2;

export interface SkyInput {
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
function isoToDays(iso: string): number {
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

export function layoutSky({ constellations, works, threads = [] }: SkyInput): SkyLayout {
  const brightness = computeBrightness(works);
  const stars: SkyStar[] = [];
  const lines: SkyLine[] = [];
  const labels: SkyLabel[] = [];
  const placed: { x: number; y: number }[] = [];

  const minX = SKY_MARGIN;
  const maxX = SKY_WIDTH - SKY_MARGIN;
  const minY = SKY_MARGIN;
  const maxY = SKY_HEIGHT - SKY_MARGIN;

  // Primero las posiciones manuales, para que las automáticas las esquiven
  const manual = new Map<string, { x: number; y: number }>();
  for (const w of works) {
    if (w.skyPosition) {
      const p = {
        x: clamp(w.skyPosition.x * SKY_WIDTH, minX, maxX),
        y: clamp(w.skyPosition.y * SKY_HEIGHT, minY, maxY),
      };
      manual.set(w.id, p);
      placed.push(p);
    }
  }

  for (const c of constellations) {
    const own = works.filter((w) => w.constellation === c.id).sort(byReleaseDate);
    const cx = c.skyRegion.x * SKY_WIDTH;
    const cy = c.skyRegion.y * SKY_HEIGHT;
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
            const x = cx + Math.cos(angle) * radius * 1.25;
            const y = cy + Math.sin(angle) * radius * 0.8;
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
      });
    }

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
      const lowest = Math.max(...constellationStars.map((s) => s.y + s.r));
      const xs = constellationStars.map((s) => s.x);
      labels.push({
        constellation: c.id,
        name: c.name,
        facet: c.facet,
        x: round(clamp((Math.min(...xs) + Math.max(...xs)) / 2, 90, SKY_WIDTH - 90)),
        y: round(Math.min(lowest + 44, SKY_HEIGHT - 28)),
      });
    }
    stars.push(...constellationStars);
  }

  return { stars, lines, threads: layoutThreads(threads, stars), labels };
}
