import type { Track, Video, Work, WorkLink } from "@/types/content";

/** Obras que tienen canciones */
export const TRACK_WORK_TYPES: readonly Work["type"][] = ["sencillo", "ep", "album"];

export const TYPE_LABEL: Partial<Record<Work["type"], string>> = {
  sencillo: "Sencillo",
  ep: "EP",
  album: "Álbum",
};

/** Lo que el admin necesita de una obra (documento de `works`) */
export type WorkDoc = Pick<Work, "title" | "type" | "releaseDate"> & { hidden?: boolean };

/** Canción tal como se guarda en Firestore: la letra va como texto y `order` ordena la colección */
export type TrackDoc = Omit<Track, "id" | "lyrics"> & { lyrics?: string; order?: number };

/** Video extra tal como se guarda en Firestore */
export type VideoDoc = Omit<Video, "id"> & { order?: number };

export const PLATFORM_OPTIONS: { value: WorkLink["platform"]; label: string }[] = [
  { value: "spotify", label: "Spotify" },
  { value: "apple-music", label: "Apple Music" },
  { value: "youtube", label: "YouTube" },
  { value: "smartlink", label: "Smartlink" },
  { value: "web", label: "Web" },
];

export const ID_PATTERN = /^[a-z0-9-]+$/;

/** 167 -> "2:47" */
export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

/** "2:47" -> 167; null si el texto no es mm:ss válido (o es 0:00) */
export function parseDuration(text: string): number | null {
  const m = /^(\d{1,3}):([0-5]\d)$/.exec(text.trim());
  if (!m) return null;
  const sec = Number(m[1]) * 60 + Number(m[2]);
  return sec > 0 ? sec : null;
}

/** El texto es una URL http(s) completa */
export function isHttpUrl(text: string): boolean {
  try {
    const u = new URL(text.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** URL de un video de YouTube: watch?v=, youtu.be/, embed/, shorts/ o live/ */
export function isYoutubeUrl(text: string): boolean {
  if (!isHttpUrl(text)) return false;
  const u = new URL(text.trim());
  const host = u.hostname.replace(/^(www|m|music)\./, "");
  if (host === "youtu.be") return u.pathname.length > 1;
  if (host !== "youtube.com") return false;
  if (u.pathname === "/watch") return Boolean(u.searchParams.get("v"));
  return /^\/(embed|shorts|live)\/[\w-]+/.test(u.pathname);
}

/** "Mi canción nueva" -> "mi-cancion-nueva" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Siguiente valor de `order` de una colección (el campo numérico más alto + 1) */
export function nextOrder(items: readonly { order?: number }[]): number {
  const orders = items.map((i) => i.order).filter((o): o is number => typeof o === "number" && Number.isFinite(o));
  return orders.length ? Math.max(...orders) + 1 : 0;
}
