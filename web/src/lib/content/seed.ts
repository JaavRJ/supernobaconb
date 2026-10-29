import { about, bio } from "@/content/bio";
import { diary } from "@/content/diary";
import { photos } from "@/content/photos";
import { products } from "@/content/products";
import { projectDetails } from "@/content/projects";
import { signals } from "@/content/signals";
import { site } from "@/content/site";
import { threads } from "@/content/threads";
import { tracks } from "@/content/tracks";
import { works } from "@/content/works";
import { writings } from "@/content/writings";
import { stanzasToText } from "./stanzas";
import type { AboutDoc, ContentSnapshot } from "./types";
import { buildVideos } from "./videos";

/** Colecciones de contenido en Firestore */
export const CONTENT_COLLECTIONS = [
  "works",
  "threads",
  "tracks",
  "signals",
  "videos",
  "photos",
  "products",
  "diary",
  "writings",
  "projectDetails",
] as const;
export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];

/** Documento listo para escribir en Firestore */
export interface SeedDoc {
  id: string;
  data: Record<string, unknown>;
}

export interface LocalSeed {
  collections: Record<ContentCollection, SeedDoc[]>;
  /** Documento `site/about` */
  about: SeedDoc;
}

/** Copia sin campos `undefined` (Firestore no los acepta) */
function plain<T>(value: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

/**
 * El contenido local como sale en el sitio cuando Firestore no tiene nada: lo que `getContent()` usa
 * por colección de respaldo. Los videoclips salen de las canciones.
 */
export function getLocalSnapshot(): ContentSnapshot {
  return {
    works,
    threads,
    tracks,
    signals,
    videos: buildVideos(works, tracks, []),
    photos,
    products,
    diary,
    writings,
    projectDetails,
    about,
    bio,
    contact: { instagram: site.instagram, tiktok: site.tiktok, pressEmail: site.pressEmail },
  };
}

/**
 * Los documentos locales por colección, listos para escribir en Firestore (sin escribirlos aquí).
 * - El id del documento es el `id` del objeto; en `writings` y `projectDetails`, su `workId`.
 * - `order` conserva el orden local; el sitio ordena por él y lo quita al leer.
 * - Letras (`tracks.lyrics`) y cuerpo de escritos (`writings.body`) van como texto con una línea en blanco
 *   entre estrofas (ver `stanzas.ts`), porque Firestore no admite arreglos dentro de arreglos.
 * - `videos` va vacía: los videoclips se derivan de las canciones; esa colección es solo para videos extra.
 */
export function getLocalSeed(): LocalSeed {
  const docs = <T>(items: T[], idOf: (item: T) => string, encode?: (item: T) => object): SeedDoc[] =>
    items.map((item, order) => ({
      id: idOf(item),
      data: { ...plain(encode ? encode(item) : item), order },
    }));

  const aboutData: AboutDoc = {
    about,
    bio,
    instagram: site.instagram,
    tiktok: site.tiktok,
    ...(site.pressEmail !== undefined ? { pressEmail: site.pressEmail } : {}),
  };

  return {
    collections: {
      works: docs(works, (w) => w.id),
      threads: docs(threads, (t) => t.id),
      tracks: docs(
        tracks,
        (t) => t.id,
        (t) => ({ ...t, lyrics: t.lyrics ? stanzasToText(t.lyrics) : undefined }),
      ),
      signals: docs(signals, (s) => s.id),
      videos: [],
      photos: docs(photos, (p) => p.id),
      products: docs(products, (p) => p.id),
      diary: docs(diary, (e) => e.id),
      writings: docs(
        writings,
        (w) => w.workId,
        (w) => ({ ...w, body: stanzasToText(w.body) }),
      ),
      projectDetails: docs(projectDetails, (p) => p.workId),
    },
    about: { id: "about", data: plain(aboutData) },
  };
}
