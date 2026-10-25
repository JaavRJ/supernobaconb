import type { CSSProperties } from "react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { getEra, getLatestRelease, getTracksForWork, toLocalDateString } from "@/content";
import type { Work, WorkLink } from "@/types/content";
import { LatestPlay } from "./LatestPlay";
import styles from "./LatestRelease.module.css";

const OTHER_PLATFORMS: { platform: WorkLink["platform"]; label: string }[] = [
  { platform: "apple-music", label: "Apple Music" },
  { platform: "youtube", label: "YouTube" },
  { platform: "smartlink", label: "Más plataformas" },
];

/** La hora actual se lee dentro de un caché de horas: así no obliga a renderizar la portada en cada petición */
async function getCurrentLatestRelease(): Promise<Work | undefined> {
  "use cache";
  cacheLife("hours");
  return getLatestRelease(toLocalDateString(new Date()));
}

/** Franja minimalista "Lo último" al pie de la portada */
export async function LatestRelease() {
  const work = await getCurrentLatestRelease();
  if (!work) return null;

  const era = getEra(work.era) ?? null;
  const spotifyUrl = work.links.find((l) => l.platform === "spotify")?.url;
  const others = OTHER_PLATFORMS.flatMap(({ platform, label }) => {
    const link = work.links.find((l) => l.platform === platform);
    return link ? [{ label, url: link.url }] : [];
  });
  const tracks = getTracksForWork(work.id).filter((t) => Boolean(t.audioUrl));
  // Solo el acento toma el color de la era; el resto es el cielo base
  const accentStyle = era
    ? ({ "--era-accent": era.theme.accent } as CSSProperties)
    : undefined;

  return (
    <section className={styles.strip} style={accentStyle} aria-labelledby="lo-ultimo-titulo">
      <div className={styles.row}>
        <div className={styles.info}>
          <p className={styles.label}>Lo último</p>
          <h2 id="lo-ultimo-titulo" className={styles.title}>
            {work.title}
          </h2>
          {era?.name && (
            <p className={styles.era}>
              <Link href={work.href} className={styles.eraLink}>
                {era.name}
                <span aria-hidden="true"> ↗</span>
                <span className={styles.srOnly}>, ver la obra {work.title}</span>
              </Link>
            </p>
          )}
        </div>
        <LatestPlay title={work.title} tracks={tracks} spotifyUrl={spotifyUrl} />
      </div>

      {others.length > 0 && (
        <ul className={styles.platforms}>
          {others.map((p) => (
            <li key={p.url}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.platformLink}
              >
                {p.label}
                <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
