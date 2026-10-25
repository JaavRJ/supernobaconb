import { cacheLife } from "next/cache";
import Image from "next/image";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra, getLatestRelease, toLocalDateString } from "@/content";
import type { Work, WorkLink, WorkType } from "@/types/content";
import styles from "./LatestRelease.module.css";

const TYPE_LABELS: Record<WorkType, string> = {
  libro: "Libro",
  sencillo: "Sencillo",
  ep: "EP",
  album: "Álbum",
  video: "Video",
  proyecto: "Proyecto",
  puzzle: "Puzzle",
};

const PLATFORM_BUTTONS: { platform: WorkLink["platform"]; label: string }[] = [
  { platform: "spotify", label: "Escuchar en Spotify" },
  { platform: "apple-music", label: "Escuchar en Apple Music" },
  { platform: "youtube", label: "Ver en YouTube" },
  { platform: "smartlink", label: "Más plataformas" },
];

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatReleaseDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

/** La hora actual se lee dentro de un caché de horas: así no obliga a renderizar la portada en cada petición */
async function getCurrentLatestRelease(): Promise<Work | undefined> {
  "use cache";
  cacheLife("hours");
  return getLatestRelease(toLocalDateString(new Date()));
}

export async function LatestRelease() {
  const work = await getCurrentLatestRelease();
  if (!work) return null;

  const era = getEra(work.era) ?? null;
  const buttons = PLATFORM_BUTTONS.flatMap(({ platform, label }) => {
    const link = work.links.find((l) => l.platform === platform);
    return link ? [{ label, url: link.url }] : [];
  });

  return (
    <EraTheme
      era={era}
      as="section"
      className={styles.section}
      aria-labelledby="lo-ultimo-titulo"
    >
      <div className={styles.inner}>
        <div className={styles.cover}>
          {work.coverUrl ? (
            <Image
              src={work.coverUrl}
              alt=""
              width={480}
              height={480}
              sizes="(min-width: 48rem) 320px, 200px"
              className={styles.coverImage}
              priority
            />
          ) : (
            <div className={styles.coverFallback} aria-hidden="true">
              <span>{work.title}</span>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.meta}>
            <span className={styles.kicker}>Lo último</span>
            <span>{TYPE_LABELS[work.type]}</span>
            {work.releaseDate && (
              <time dateTime={work.releaseDate}>
                {formatReleaseDate(work.releaseDate)}
              </time>
            )}
          </p>
          <h2 id="lo-ultimo-titulo" className={styles.title}>
            <a href={work.href} className={styles.titleLink}>
              {work.title}
            </a>
          </h2>
          {era?.name && <p className={styles.era}>{era.name}</p>}

          {buttons.length > 0 && (
            <ul className={styles.actions}>
              {buttons.map((button, index) => (
                <li key={button.url}>
                  <a
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={index === 0 ? styles.primary : styles.secondary}
                  >
                    {button.label}
                    <span className={styles.srOnly}>
                      {" "}
                      (se abre en una pestaña nueva)
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </EraTheme>
  );
}
