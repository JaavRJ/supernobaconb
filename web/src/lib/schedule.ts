import { cacheLife } from "next/cache";
import { toLocalDateString, works } from "@/content";

const TIME_ZONE = "America/Mexico_City";

/** Perfil "hours" de Next 16 (stale 5 min, revalidate 1 h, expire 1 día): es el tope cuando no hay publicación cerca */
const HOURS = { stale: 300, revalidate: 3600, expire: 86400 };

/** Fechas (día calendario de México) en que algo se publica: partes de libros y obras con fecha */
function knownReleaseDates(): string[] {
  return works
    .filter((w) => !w.hidden)
    .flatMap((w) => [w.releaseDate, ...(w.parts ?? []).map((p) => p.releaseDate)])
    .filter((d): d is string => Boolean(d));
}

/** Milisegundos que el reloj de México va por delante de UTC en el instante dado (negativo al oeste) */
function zoneOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Instante exacto en que empieza el día `date` ("YYYY-MM-DD") en México */
function startOfLocalDay(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d);
  // Dos pasadas por si el desfase cambia entre la medianoche y la estimación
  let instant = wall - zoneOffsetMs(new Date(wall));
  instant = wall - zoneOffsetMs(new Date(instant));
  return instant;
}

/**
 * Segundos (redondeados hacia abajo, mínimo 1) hasta la siguiente fecha de publicación posterior a `now`,
 * o `null` si no hay ninguna. Pura: recibe `now` y, opcionalmente, las fechas.
 */
export function secondsUntilNextRelease(
  now: Date,
  dates: readonly string[] = knownReleaseDates(),
): number | null {
  const today = toLocalDateString(now);
  const next = dates.filter((d) => d > today).sort()[0];
  if (!next) return null;
  return Math.max(1, Math.floor((startOfLocalDay(next) - now.getTime()) / 1000));
}

/** Perfil de caché para una cuenta atrás en segundos (`null` = nada próximo: perfil "hours") */
export function scheduledProfile(seconds: number | null): { stale: number; revalidate: number; expire: number } {
  if (seconds === null) return HOURS;
  // El caché vence a más tardar en la publicación y nunca dura más que el perfil de horas
  const expire = Math.min(HOURS.expire, seconds);
  return {
    stale: Math.min(HOURS.stale, Math.max(30, expire)),
    revalidate: Math.min(HOURS.revalidate, Math.max(0, expire - 1)),
    expire,
  };
}

/**
 * Sustituye a `cacheLife("hours")` en las funciones cacheadas que deciden qué está publicado.
 * Llamar dentro del ámbito `"use cache"`.
 *
 * Según la guía de Next 16, entre `revalidate` y `expire` se sirve la copia vieja mientras se
 * regenera, y solo después de `expire` la siguiente visita espera la copia nueva. Por eso `expire`
 * cae en la publicación (redondeada hacia abajo, así la copia nunca sobrevive a la fecha) y
 * `revalidate` un segundo antes: la ventana de copia vieja queda siempre antes de la fecha, y la
 * primera visita posterior se regenera con la hora nueva. Lo que se regenera en el último segundo
 * puede vivir hasta 1 s después de la fecha (el mínimo de `expire`).
 */
export function scheduledCacheLife(now: Date = new Date()): void {
  cacheLife(scheduledProfile(secondsUntilNextRelease(now)));
}
