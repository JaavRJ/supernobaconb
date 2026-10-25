import { cacheLife } from "next/cache";
import { getEra, getLatestRelease, getTracksForWork, toLocalDateString } from "@/content";
import type { Work, WorkType } from "@/types/content";
import { LatestActions } from "./LatestActions";
import styles from "./LatestRelease.module.css";

const TYPE_LABELS: Record<WorkType, string> = {
  libro: "LIBRO",
  sencillo: "SENCILLO",
  ep: "EP",
  album: "ÁLBUM",
  video: "VIDEO",
  proyecto: "PROYECTO",
  puzzle: "PUZZLE",
};

/** La hora actual se lee dentro de un caché de horas: así no obliga a renderizar la portada en cada petición */
async function getCurrentLatestRelease(): Promise<Work | undefined> {
  "use cache";
  cacheLife("hours");
  return getLatestRelease(toLocalDateString(new Date()));
}

/** Aviso "Nuevo" al inicio de la portada: la última obra publicada */
export async function LatestRelease() {
  const work = await getCurrentLatestRelease();
  if (!work) return null;

  const era = getEra(work.era);
  const spotifyUrl = work.links.find((l) => l.platform === "spotify")?.url;
  const tracks = getTracksForWork(work.id).filter((t) => Boolean(t.audioUrl));

  return (
    <section className={styles.notice} aria-labelledby="nuevo-titulo">
      <p className={styles.eyebrow}>NUEVO · {TYPE_LABELS[work.type]}</p>
      <h2 id="nuevo-titulo" className={styles.title}>
        {work.title}
      </h2>
      {era?.name && <p className={styles.era}>{era.name}</p>}
      <LatestActions title={work.title} tracks={tracks} spotifyUrl={spotifyUrl} />
    </section>
  );
}
