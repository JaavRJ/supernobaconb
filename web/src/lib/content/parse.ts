// Solo servidor (usa console.warn para avisar de documentos descartados).
import type { About, Bio } from "@/content/bio";
import type {
  DiaryEntry,
  Photo,
  Product,
  ProjectDetail,
  Signal,
  Thread,
  Track,
  Video,
  Work,
  Writing,
} from "@/types/content";
import type { RawDoc } from "./firestore";
import { textToStanzas } from "./stanzas";
import type { AboutDoc } from "./types";

type Rec = Record<string, unknown>;

/** Un documento válido, o el motivo por el que se descarta */
type Parser<T> = (id: string, d: Rec) => T | string;

const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStrList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);
const oneOf = <T extends string>(v: unknown, options: readonly T[]): v is T =>
  isStr(v) && (options as readonly string[]).includes(v);
const missing = (d: Rec, keys: string[], check: (v: unknown) => boolean = isStr) =>
  keys.filter((k) => !check(d[k]));
const need = (keys: string[]) => (keys.length ? `faltan o son inválidos: ${keys.join(", ")}` : null);

/** Quita campos de apoyo que no son parte del contenido */
function clean(d: Rec, id?: Rec): Rec {
  const rest = Object.fromEntries(Object.entries(d).filter(([key]) => key !== "order"));
  return { ...rest, ...id };
}

/** Lista que puede faltar: vacía */
const listOrEmpty = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const parseWork: Parser<Work> = (id, d) => {
  const bad = need([
    ...missing(d, ["title", "era", "summary", "href"]),
    ...(oneOf(d.constellation, ["jabi", "noba", "supernoba"]) ? [] : ["constellation"]),
    ...(oneOf(d.type, ["libro", "sencillo", "ep", "album", "video", "proyecto", "puzzle", "escrito"])
      ? []
      : ["type"]),
    ...(oneOf(d.role, ["nucleo", "orbita"]) ? [] : ["role"]),
  ]);
  if (bad) return bad;
  return clean(d, { id, links: listOrEmpty(d.links) }) as unknown as Work;
};

const parseThread: Parser<Thread> = (id, d) => {
  const bad = need([
    ...missing(d, ["from", "to"]),
    ...(oneOf(d.kind, ["inspira", "continua", "comparte-universo", "guino", "construye"]) ? [] : ["kind"]),
  ]);
  return bad ?? (clean(d, { id }) as unknown as Thread);
};

const parseTrack: Parser<Track> = (id, d) => {
  const bad = need([
    ...missing(d, ["workId", "title"]),
    ...missing(d, ["number", "durationSec"], isNum),
  ]);
  if (bad) return bad;
  const lyrics = isStr(d.lyrics) ? textToStanzas(d.lyrics) : [];
  return clean(d, {
    id,
    explicit: d.explicit === true,
    links: listOrEmpty(d.links),
    lyrics: lyrics.length ? lyrics : undefined,
  }) as unknown as Track;
};

const parseSignal: Parser<Signal> = (id, d) => {
  const bad = need([
    ...missing(d, ["era", "content", "date"]),
    ...(oneOf(d.kind, ["video", "frase", "imagen"]) ? [] : ["kind"]),
  ]);
  return bad ?? (clean(d, { id, active: d.active === true }) as unknown as Signal);
};

const parseVideo: Parser<Video> = (id, d) => {
  const bad = need(missing(d, ["title", "url", "workId", "date"]));
  return bad ?? (clean(d, { id }) as unknown as Video);
};

const parsePhoto: Parser<Photo> = (id, d) => {
  const bad = need([
    ...missing(d, ["src", "alt"]),
    ...missing(d, ["width", "height"], isNum),
    ...(oneOf(d.source, ["kit", "libro"]) ? [] : ["source"]),
  ]);
  return bad ?? (clean(d, { id }) as unknown as Photo);
};

const parseProduct: Parser<Product> = (id, d) => {
  const bad = need([
    ...missing(d, ["name", "description", "format"]),
    ...(isRec(d.image) && isStr(d.image.src) && isNum(d.image.width) && isNum(d.image.height) ? [] : ["image"]),
    ...(isRec(d.buy) && isStr(d.buy.url) && isStr(d.buy.store) ? [] : ["buy"]),
  ]);
  return bad ?? (clean(d, { id }) as unknown as Product);
};

const parseDiary: Parser<DiaryEntry> = (id, d) => {
  const bad = need([
    ...missing(d, ["date", "title"]),
    ...missing(d, ["paragraphs"], isStrList),
  ]);
  return bad ?? (clean(d, { id }) as unknown as DiaryEntry);
};

const parseWriting: Parser<Writing> = (id, d) => {
  const bad = need(oneOf(d.kind, ["letra", "poema", "texto"]) ? [] : ["kind"]);
  if (bad) return bad;
  const body = isStr(d.body) ? textToStanzas(d.body) : [];
  if (body.length === 0) return "no tiene texto";
  return clean(d, { workId: id, body }) as unknown as Writing;
};

const parseProjectDetail: Parser<ProjectDetail> = (id, d) => {
  const bad = need([
    ...missing(d, ["tagline"]),
    ...missing(d, ["paragraphs"], isStrList),
    ...(isRec(d.repo) && (isStr(d.repo.url) || d.repo.private === true) ? [] : ["repo"]),
  ]);
  if (bad) return bad;
  return clean(d, {
    workId: id,
    highlights: listOrEmpty(d.highlights),
    stack: listOrEmpty(d.stack),
    screenshots: listOrEmpty(d.screenshots),
  }) as unknown as ProjectDetail;
};

/**
 * Convierte los documentos de una colección al tipo del sitio. Descarta con un aviso los que no cumplen
 * la forma mínima. Respeta el campo numérico opcional `order` (menor primero); sin él, el orden de Firestore.
 */
function parseCollection<T>(name: string, docs: RawDoc[], parse: Parser<T>): T[] {
  const parsed: { value: T; order: number; index: number }[] = [];
  docs.forEach((doc, index) => {
    const result = parse(doc.id, doc.data);
    if (typeof result === "string") {
      console.warn(`[content] ${name}/${doc.id} descartado: ${result}`);
      return;
    }
    parsed.push({
      value: result,
      order: isNum(doc.data.order) ? doc.data.order : Number.POSITIVE_INFINITY,
      index,
    });
  });
  return parsed
    .sort((a, b) => (a.order === b.order ? a.index - b.index : a.order < b.order ? -1 : 1))
    .map((p) => p.value);
}

export const parsers = {
  works: (docs: RawDoc[]) => parseCollection("works", docs, parseWork),
  threads: (docs: RawDoc[]) => parseCollection("threads", docs, parseThread),
  tracks: (docs: RawDoc[]) => parseCollection("tracks", docs, parseTrack),
  signals: (docs: RawDoc[]) => parseCollection("signals", docs, parseSignal),
  videos: (docs: RawDoc[]) => parseCollection("videos", docs, parseVideo),
  photos: (docs: RawDoc[]) => parseCollection("photos", docs, parsePhoto),
  products: (docs: RawDoc[]) => parseCollection("products", docs, parseProduct),
  diary: (docs: RawDoc[]) => parseCollection("diary", docs, parseDiary),
  writings: (docs: RawDoc[]) => parseCollection("writings", docs, parseWriting),
  projectDetails: (docs: RawDoc[]) => parseCollection("projectDetails", docs, parseProjectDetail),
};

const isBio = (v: unknown): v is Bio =>
  isRec(v) && isStr(v.short) && isStr(v.medium) && isStrList(v.long);

const isAbout = (v: unknown): v is About =>
  isRec(v) &&
  isStr(v.intro) &&
  isStr(v.closing) &&
  Array.isArray(v.parts) &&
  v.parts.every((p) => isRec(p) && isStr(p.label) && isStr(p.text));

const isHandle = (v: unknown): v is { handle: string; url: string } =>
  isRec(v) && isStr(v.handle) && isStr(v.url);

/**
 * Documento `site/about`: cada parte se valida por separado; la que falta o no cumple la forma
 * se omite y queda la local. `pressEmail` presente (aunque vacío) reemplaza al local.
 */
export function parseAboutDoc(data: Rec | undefined): Partial<AboutDoc> {
  if (!data) return {};
  const out: Partial<AboutDoc> = {};
  if (isAbout(data.about)) out.about = data.about;
  if (isRec(data.bio) && isBio(data.bio.es) && isBio(data.bio.en)) out.bio = { es: data.bio.es, en: data.bio.en };
  if (isHandle(data.instagram)) out.instagram = data.instagram;
  if (isHandle(data.tiktok)) out.tiktok = data.tiktok;
  if (isStr(data.pressEmail)) out.pressEmail = data.pressEmail;
  return out;
}
