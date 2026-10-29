import type { Constellation, ConstellationId, Era } from "@/types/content";
import { constellations } from "./constellations";
import { eras } from "./eras";

// Aquí solo viven los datos que son estructura del sitio (constelaciones y eras) y funciones puras.
// El contenido editable (obras, canciones, fotos...) se lee con `content()` de `@/lib/content`; los
// archivos de esta carpeta son su semilla y respaldo.
export { constellations, eras };

export function getEra(id: string): Era | undefined {
  return eras.find((e) => e.id === id);
}

export function getConstellation(id: ConstellationId): Constellation | undefined {
  return constellations.find((c) => c.id === id);
}

/** Era encendida o en órbita cuya fase actual empezó más recientemente */
export function getCurrentEra(): Era | undefined {
  const start = (e: Era) => e.phaseDates[e.phase] ?? "";
  return eras
    .filter((e) => e.phase === "encendida" || e.phase === "orbita")
    .sort((a, b) => start(b).localeCompare(start(a)))[0];
}

export function getNebulas(): Era[] {
  return eras.filter((e) => e.phase === "nebulosa");
}

/** Fecha YYYY-MM-DD en la zona dada; la llama quien tenga la hora actual (cliente o tras `connection()`) */
export function toLocalDateString(date: Date, timeZone = "America/Mexico_City"): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("toLocalDateString: la fecha recibida no es válida");
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
