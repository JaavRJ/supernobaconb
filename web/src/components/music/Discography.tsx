import { Suspense } from "react";
import { getEra, toLocalDateString } from "@/content";
import { Sky } from "@/components/sky/Sky";
import { content } from "@/lib/content";
import { scheduledCacheLife } from "@/lib/schedule";
import type { WorkLink } from "@/types/content";
import { DiscographyView, type DiscographyItem } from "./DiscographyView";

/** La hora actual se lee dentro de un caché que vence en la siguiente publicación, como en la portada */
async function getToday(): Promise<string> {
  "use cache";
  await scheduledCacheLife();
  return toLocalDateString(new Date());
}

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

/** Duración total como "6:12 min" */
function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = String(totalSec % 60).padStart(2, "0");
  return `${minutes}:${seconds} min`;
}

function linkUrl(links: WorkLink[], platform: WorkLink["platform"]): string | undefined {
  return links.find((l) => l.platform === platform)?.url;
}

/** Constelación Supernoba y lista de sus sencillos, del más nuevo al más viejo */
export function Discography() {
  // Si la publicación está a menos de 5 min, el caché es de petición y Next exige un límite de Suspense
  return (
    <Suspense fallback={null}>
      <DiscographyList />
    </Suspense>
  );
}

async function DiscographyList() {
  const today = await getToday();
  const c = await content();
  const works = c.getWorksByConstellation("supernoba")
    // Las obras sin fecha (por anunciar) van primero, luego de la más nueva a la más vieja
    .reverse();

  const items: DiscographyItem[] = works.map((work) => {
    const tracks = c.toPlayerTracks(c.getTracksForWork(work.id));
    const upcoming = !work.releaseDate || work.releaseDate > today;
    const spotify = linkUrl(work.links, "spotify");
    return {
      id: work.id,
      href: work.href,
      title: work.title,
      coverUrl: work.coverUrl ?? work.photoUrl,
      dateIso: work.releaseDate,
      dateLabel: work.releaseDate ? formatDate(work.releaseDate) : undefined,
      eraName: getEra(work.era)?.name ?? undefined,
      trackCount: tracks.length,
      duration: tracks.length > 0 ? formatDuration(tracks.reduce((sum, t) => sum + t.durationSec, 0)) : undefined,
      upcoming,
      playable: upcoming ? [] : tracks.filter((t) => Boolean(t.audioUrl)),
      listenUrl: linkUrl(work.links, "smartlink") ?? spotify,
      spotifyUrl: spotify,
      appleUrl: linkUrl(work.links, "apple-music"),
      youtubeUrl: linkUrl(work.links, "youtube"),
    };
  });

  return <DiscographyView items={items} sky={<Sky only="supernoba" />} />;
}
