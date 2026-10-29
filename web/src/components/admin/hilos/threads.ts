import type { Thread, ThreadKind, Track, Work } from "@/types/content";

export type ThreadDoc = Thread & { order?: number };

export const KINDS: { value: ThreadKind; label: string; help: string }[] = [
  { value: "inspira", label: "Inspira", help: "El origen inspiró al destino (p. ej. una parte del libro inspiró una canción)." },
  { value: "continua", label: "Continúa", help: "El origen es la continuación del destino." },
  { value: "comparte-universo", label: "Comparte universo", help: "Las dos obras viven en el mismo mundo, sin que una nazca de la otra." },
  { value: "guino", label: "Guiño", help: "El origen le hace un guiño al destino (una referencia, un detalle escondido)." },
  { value: "construye", label: "Construye", help: "El origen se construyó para el destino (un sitio o una herramienta para una obra)." },
];

export const kindLabel = (kind: ThreadKind) => KINDS.find((k) => k.value === kind)?.label ?? kind;

/** Nombre corto de un extremo del hilo (obra o canción) */
export function endpointName(id: string, works: Work[], tracks: Track[]): string {
  const work = works.find((w) => w.id === id);
  if (work) return work.title;
  const track = tracks.find((t) => t.id === id);
  return track ? `${track.title} (canción)` : id;
}

/** Id generado "origen-tipo-destino"; si ya existe agrega un número */
export function threadId(from: string, kind: ThreadKind, to: string, taken: Set<string>): string {
  const base = `${from}-${kind}-${to}`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export interface PreviewLine {
  /** Obra en cuya página se leería la frase */
  viewer: string;
  /** Frase de "Conectado con", o `null` si no aparecería */
  text: string | null;
  /** Por qué no aparece */
  reason?: string;
}

/**
 * Misma regla que `getConnections` (lib/connections.ts), que no se puede usar en el cliente
 * porque su módulo lee el contenido del servidor: aquí se arma con las listas del admin.
 */
function phraseFor(t: Thread, viewer: Work, works: Work[], tracks: Track[]): PreviewLine {
  const ids = new Set([viewer.id, ...(viewer.trackIds ?? []), ...tracks.filter((tr) => tr.workId === viewer.id).map((tr) => tr.id)]);
  const incoming = ids.has(t.to);
  const otherId = incoming ? t.from : t.to;
  const other = works.find((w) => w.id === otherId);
  if (!other) {
    return { viewer: viewer.title, text: null, reason: "el otro extremo es una canción o no existe; el sitio solo enlaza obras" };
  }
  if (other.hidden) return { viewer: viewer.title, text: null, reason: `${other.title} está oculta` };
  const isBook = other.type === "libro";
  const part = other.parts?.find((p) => p.number === t.fromPart);
  let text: string;
  if (t.kind === "inspira" && incoming && part) text = `inspirada en la Parte ${part.number}: ${part.title}`;
  else if (t.kind === "inspira" && incoming) text = `inspirada en ${other.title}`;
  else if (t.kind === "guino") text = isBook ? `guiño al libro ${other.title}` : `guiño a ${other.title}`;
  else if (t.kind === "inspira") text = `inspiración de ${other.title}`;
  else if (t.kind === "continua") text = `continúa ${other.title}`;
  else if (t.kind === "comparte-universo") text = `comparte universo con ${other.title}`;
  else if (!incoming) text = isBook ? `construido para el libro ${other.title}` : `construido para ${other.title}`;
  else text = other.type === "proyecto" ? `su sitio y su lector: ${other.title}` : `construido por ${other.title}`;
  return { viewer: viewer.title, text };
}

/** Cómo se lee el hilo en la página de cada una de las dos obras */
export function previewThread(t: Thread, works: Work[], tracks: Track[]): PreviewLine[] {
  const workOf = (id: string) => {
    const direct = works.find((w) => w.id === id);
    if (direct) return direct;
    const track = tracks.find((tr) => tr.id === id);
    return track ? works.find((w) => w.id === track.workId) : undefined;
  };
  const viewers = [workOf(t.from), workOf(t.to)].filter((w): w is Work => !!w);
  return [...new Map(viewers.map((w) => [w.id, w])).values()].map((w) => phraseFor(t, w, works, tracks));
}
