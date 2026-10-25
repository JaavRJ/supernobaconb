import { cacheLife } from "next/cache";
import { getEra, getTracksForWork, getWorksByConstellation, toLocalDateString } from "@/content";
import { Sky } from "@/components/sky/Sky";
import type { WorkLink } from "@/types/content";
import { DiscographyView, type DiscographyItem } from "./DiscographyView";

/** La hora actual se lee dentro de un caché de horas, como en la portada */
async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
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
export async function Discography() {
  const today = await getToday();
  const works = getWorksByConstellation("supernoba")
    // Las obras sin fecha (por anunciar) van primero, luego de la más nueva a la más vieja
    .reverse();

  const items: DiscographyItem[] = works.map((work) => {
    const tracks = getTracksForWork(work.id);
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
