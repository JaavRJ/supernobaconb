import { Suspense } from "react";
import { getEra, toLocalDateString } from "@/content";
import { content } from "@/lib/content";
import { scheduledCacheLife } from "@/lib/schedule";
import type { Work } from "@/types/content";
import { LatestNotice } from "./LatestNotice";

/** La hora actual se lee dentro de un caché que vence en la siguiente publicación: así no obliga a renderizar la portada en cada petición */
async function getCurrentLatestRelease(): Promise<Work | undefined> {
  "use cache";
  await scheduledCacheLife();
  return (await content()).getLatestRelease(toLocalDateString(new Date()));
}

/** La última obra publicada, como anotación lateral del hero */
export function LatestRelease() {
  // Si la publicación está a menos de 5 min, el caché es de petición y Next exige un límite de Suspense
  return (
    <Suspense fallback={null}>
      <LatestReleaseNotice />
    </Suspense>
  );
}

async function LatestReleaseNotice() {
  const work = await getCurrentLatestRelease();
  if (!work) return null;

  const c = await content();
  const era = getEra(work.era);
  const spotifyUrl = work.links.find((l) => l.platform === "spotify")?.url;
  const tracks = c.toPlayerTracks(c.getTracksForWork(work.id)).filter((t) => Boolean(t.audioUrl));

  return (
    <LatestNotice title={work.title} eraName={era?.name} tracks={tracks} spotifyUrl={spotifyUrl} />
  );
}
