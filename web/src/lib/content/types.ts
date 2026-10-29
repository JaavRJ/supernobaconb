import type { About, Bio } from "@/content/bio";
import type { Site } from "@/content/site";
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

/** Redes y contacto editables; el resto de `Site` (nombre, menú, plataformas) es estructura y se queda en código */
export type SiteContact = Pick<Site, "instagram" | "tiktok" | "pressEmail">;

/** Documento `site/about`: Sobre mí, biografía del kit y redes */
export interface AboutDoc extends SiteContact {
  about: About;
  bio: Record<"es" | "en", Bio>;
}

/**
 * Contenido editable del sitio ya resuelto: lo de Firestore y, por colección, la semilla local
 * donde no hay datos. Es lo que devuelve (y guarda en caché) `getContent()`.
 */
export interface ContentSnapshot {
  works: Work[];
  threads: Thread[];
  tracks: Track[];
  signals: Signal[];
  /** Videoclips: los de las canciones con YouTube más los de la colección `videos` */
  videos: Video[];
  photos: Photo[];
  products: Product[];
  diary: DiaryEntry[];
  writings: Writing[];
  projectDetails: ProjectDetail[];
  about: About;
  bio: Record<"es" | "en", Bio>;
  contact: SiteContact;
}
