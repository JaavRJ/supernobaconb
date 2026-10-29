import type { Work, WorkLink, WorkType } from "@/types/content";

/** Obra tal como vive en Firestore: los campos de `Work` más el `order` que usa el sitio para desempates. */
export type WorkDoc = Work & { order?: number };

export const TYPE_OPTIONS: { value: WorkType; label: string }[] = [
  { value: "libro", label: "Libro" },
  { value: "sencillo", label: "Sencillo" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Álbum" },
  { value: "video", label: "Video" },
  { value: "proyecto", label: "Proyecto" },
  { value: "puzzle", label: "Puzzle" },
  { value: "escrito", label: "Escrito" },
];

export const PLATFORM_OPTIONS: { value: WorkLink["platform"]; label: string }[] = [
  { value: "spotify", label: "Spotify" },
  { value: "apple-music", label: "Apple Music" },
  { value: "youtube", label: "YouTube" },
  { value: "smartlink", label: "Smartlink" },
  { value: "repo", label: "Repositorio" },
  { value: "demo", label: "Demo" },
  { value: "tienda", label: "Tienda" },
  { value: "web", label: "Web" },
];

export const ROLE_OPTIONS = [
  { value: "orbita", label: "Órbita (obra satélite)" },
  { value: "nucleo", label: "Núcleo (el libro de la era)" },
];

export const SLUG = /^[a-z0-9-]+$/;

export function typeLabel(type: WorkType): string {
  return TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type;
}

/** Ruta sugerida de la obra según su tipo; vacía mientras no haya id. */
export function suggestHref(type: WorkType, id: string): string {
  if (!id) return "";
  switch (type) {
    case "libro":
      return `/libros/${id}`;
    case "escrito":
      return `/libros/escritos/${id}`;
    case "proyecto":
      return `/proceso/${id}`;
    case "puzzle":
      return `/${id}`;
    default:
      return `/musica/${id}`;
  }
}

/** Portada chica (512 px) a partir de la URL de Cloudinary: inserta la transformación tras `/upload/`. */
export function smallCoverUrl(url: string): string {
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const head = url.slice(0, at + marker.length);
  return `${head}w_512,h_512,c_fill,f_auto,q_auto/${url.slice(at + marker.length)}`;
}

/** Siguiente `order` para una obra nueva. */
export function nextOrder(items: { order?: number }[]): number {
  return items.reduce((max, w) => Math.max(max, typeof w.order === "number" ? w.order : -1), -1) + 1;
}
