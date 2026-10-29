// Solo servidor: importa Firestore y la semilla local completa. Los componentes de cliente reciben los datos por props.
import { cacheLife, cacheTag } from "next/cache";
import { contentApi, type Content } from "./api";
import { listCollection } from "./firestore";
import { parseAboutDoc, parsers } from "./parse";
import { getLocalSnapshot } from "./seed";
import type { ContentSnapshot } from "./types";
import { buildVideos } from "./videos";

export type { Content } from "./api";
export type { AboutDoc, ContentSnapshot, SiteContact } from "./types";
export { contentApi };

/** Valor de Firestore si trae al menos un documento válido; si no, el respaldo local */
function pick<T>(remote: T[], local: T[]): T[] {
  return remote.length > 0 ? remote : local;
}

/**
 * Todo el contenido editable del sitio: lo que hay en Firestore y, colección por colección, la semilla de
 * `web/src/content/` cuando Firestore no está configurado, falla o la colección viene vacía.
 * Las constelaciones, las eras y la antesala del libro no están aquí: se quedan en código.
 *
 * Las páginas usan `content()`, que añade las consultas. Se actualiza al momento con
 * `updateTag("content")` (el admin lo hace al guardar) y, si no, cada hora.
 */
export async function getContent(): Promise<ContentSnapshot> {
  "use cache";
  cacheTag("content");

  const local = getLocalSnapshot();
  const [works, threads, tracks, signals, videos, photos, products, diary, writings, projectDetails, site] =
    await Promise.all([
      listCollection("works"),
      listCollection("threads"),
      listCollection("tracks"),
      listCollection("signals"),
      listCollection("videos"),
      listCollection("photos"),
      listCollection("products"),
      listCollection("diary"),
      listCollection("writings"),
      listCollection("projectDetails"),
      listCollection("site"),
    ]);

  // Un fallo de red se guarda poco tiempo para no fijar el respaldo por horas
  const failed = [works, threads, tracks, signals, videos, photos, products, diary, writings, projectDetails, site].some(
    (r) => r.transient,
  );
  if (failed) cacheLife("seconds");
  else cacheLife("hours");

  const about = parseAboutDoc(site.docs.find((d) => d.id === "about")?.data);
  const mergedWorks = pick(parsers.works(works.docs), local.works);
  const mergedTracks = pick(parsers.tracks(tracks.docs), local.tracks);

  return {
    works: mergedWorks,
    threads: pick(parsers.threads(threads.docs), local.threads),
    tracks: mergedTracks,
    signals: pick(parsers.signals(signals.docs), local.signals),
    videos: buildVideos(mergedWorks, mergedTracks, parsers.videos(videos.docs)),
    photos: pick(parsers.photos(photos.docs), local.photos),
    products: pick(parsers.products(products.docs), local.products),
    diary: pick(parsers.diary(diary.docs), local.diary),
    writings: pick(parsers.writings(writings.docs), local.writings),
    projectDetails: pick(parsers.projectDetails(projectDetails.docs), local.projectDetails),
    about: about.about ?? local.about,
    bio: about.bio ?? local.bio,
    contact: {
      instagram: about.instagram ?? local.contact.instagram,
      tiktok: about.tiktok ?? local.contact.tiktok,
      pressEmail: about.pressEmail ?? local.contact.pressEmail,
    },
  };
}

/** El contenido con sus funciones de consulta; es lo que usan las páginas y componentes de servidor */
export async function content(): Promise<Content> {
  return contentApi(await getContent());
}
