import type { Era, EraPhase, Work } from "@/types/content";
import { isoToDays } from "./layout";

/** Margen del eje tras la fecha más reciente conocida, como fracción del rango */
const AXIS_MARGIN = 0.1;

export interface TimelineSegment {
  phase: EraPhase;
  /** Fecha ISO en que empieza la fase; no se incluye para eras en nebulosa */
  start?: string;
  /** Inicio difuminado: la era sigue oculta y no debe marcar una fecha precisa */
  fuzzy?: boolean;
  /** Posición y ancho en % del eje */
  left: number;
  width: number;
}

export interface TimelineMarker {
  workId: string;
  /** Posición en % del eje */
  left: number;
}

export interface TimelineRow {
  eraId: string;
  accent: string;
  /** Fase actual de la era y desde cuándo */
  phase: EraPhase;
  since?: string;
  segments: TimelineSegment[];
  markers: TimelineMarker[];
}

export interface TimelineTick {
  year: number;
  left: number;
}

export interface TimelineData {
  rows: TimelineRow[];
  ticks: TimelineTick[];
}

const PHASE_ORDER: EraPhase[] = ["nebulosa", "encendida", "orbita", "cerrada"];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function daysToIso(days: number): string {
  return new Date(days * 86400000).toISOString().slice(0, 10);
}

function knownPhases(era: Era): { phase: EraPhase; date: string }[] {
  return PHASE_ORDER.flatMap((phase) => {
    const date = era.phaseDates[phase];
    return date ? [{ phase, date }] : [];
  }).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Datos puros de la línea de tiempo: eje común y una fila por era.
 *
 * Casos: una era sin fecha para su fase actual solo dibuja las fases con fecha y no tiene
 * `since`; las fases con la misma fecha no generan segmentos de ancho 0; una era `cerrada`
 * se dibuja hasta el final del eje, atenuada (intencional). Las eras en nebulosa no
 * exponen fechas ni obras, y sus obras no cuentan para el rango del eje.
 */
export function buildTimeline(eras: Era[], works: Work[]): TimelineData {
  const nebulaIds = new Set(eras.filter((e) => e.phase === "nebulosa").map((e) => e.id));
  const visible = works.filter((w) => !w.hidden && w.releaseDate);
  const allDays = [
    ...eras.flatMap((e) => knownPhases(e).map((p) => isoToDays(p.date))),
    ...visible.filter((w) => !nebulaIds.has(w.era)).map((w) => isoToDays(w.releaseDate as string)),
  ];
  if (allDays.length === 0) return { rows: [], ticks: [] };

  const min = Math.min(...allDays);
  const latest = Math.max(...allDays);
  const max = latest + Math.max(1, Math.round((latest - min) * AXIS_MARGIN));
  const span = max - min;
  const pct = (days: number) => round(((days - min) / span) * 100);

  const rows = eras
    .map((era): TimelineRow | null => {
      const phases = knownPhases(era);
      if (phases.length === 0) return null;
      const segments = phases.flatMap((p, i): TimelineSegment[] => {
        const startDays = isoToDays(p.date);
        const endDays = i + 1 < phases.length ? isoToDays(phases[i + 1].date) : max;
        const width = round(pct(endDays) - pct(startDays));
        if (width <= 0) return [];
        return [{ phase: p.phase, start: p.date, left: pct(startDays), width }];
      });
      // Una nebulosa no muestra obras, ni siquiera como marcas
      const markers =
        era.phase === "nebulosa"
          ? []
          : visible
              .filter((w) => w.era === era.id)
              .sort((a, b) => (a.releaseDate as string).localeCompare(b.releaseDate as string))
              .map((w) => ({ workId: w.id, left: pct(isoToDays(w.releaseDate as string)) }));
      return {
        eraId: era.id,
        accent: era.theme.accent,
        phase: era.phase,
        since: era.phase === "nebulosa" ? undefined : era.phaseDates[era.phase],
        segments,
        markers,
      };
    })
    .filter((r): r is TimelineRow => r !== null)
    .sort(
      (a, b) =>
        (a.segments[0]?.start ?? "").localeCompare(b.segments[0]?.start ?? "") || a.eraId.localeCompare(b.eraId),
    );

  // Las fechas de una nebulosa no salen del servidor: solo quedan los porcentajes
  for (const row of rows) {
    if (row.phase !== "nebulosa") continue;
    row.segments = row.segments.map(({ phase, left, width }) => ({
      phase,
      left,
      width,
      fuzzy: true,
    }));
  }

  const startYear = Number(daysToIso(min).slice(0, 4));
  const endYear = Number(daysToIso(max).slice(0, 4));
  const ticks: TimelineTick[] = [];
  for (let year = startYear; year <= endYear; year++) {
    const jan1 = isoToDays(`${year}-01-01`);
    ticks.push({ year, left: pct(Math.max(jan1, min)) });
  }

  return { rows, ticks };
}
