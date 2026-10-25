import Image from "next/image";
import Link from "next/link";
import { StarWord } from "@/components/brand/StarWord";
import { VerticalLabel } from "@/components/era/VerticalLabel";
import { getWork, threads } from "@/content";
import { partSlug } from "@/lib/book/publication";
import type { Era, Track, Work, WorkLink } from "@/types/content";
import { Credits } from "./Credits";
import { Lyrics } from "./Lyrics";
import styles from "./Release.module.css";
import { ReleaseListenButton, ReleaseTrackList } from "./ReleaseTracks";
import { SpotifyEmbed } from "./SpotifyEmbed";
import { ReleaseVideos } from "./ReleaseVideos";

const TYPE_LABEL: Partial<Record<Work["type"], string>> = {
  sencillo: "SENCILLO",
  ep: "EP",
  album: "ÁLBUM",
};

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-03-13" -> "13 DE MARZO DE 2026" */
function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} DE ${MONTHS[month - 1].toUpperCase()} DE ${year}`;
}

const PLATFORMS: { platform: WorkLink["platform"]; label: string }[] = [
  { platform: "spotify", label: "Spotify" },
  { platform: "apple-music", label: "Apple Music" },
  { platform: "youtube", label: "YouTube" },
  { platform: "smartlink", label: "Otras plataformas" },
];

interface Connection {
  id: string;
  text: string;
  href: string;
}

/** Hilos que tocan la obra o alguna de sus canciones, con su frase y enlace */
function getConnections(work: Work): Connection[] {
  const ids = new Set([work.id, ...(work.trackIds ?? [])]);
  const result: Connection[] = [];
  for (const t of threads) {
    const incoming = ids.has(t.to);
    if (!incoming && !ids.has(t.from)) continue;
    const other = getWork(incoming ? t.from : t.to);
    if (!other || other.hidden) continue;
    const isBook = other.type === "libro";
    const part = other.parts?.find((p) => p.number === t.fromPart);
    let text: string;
    let href = other.href;
    if (t.kind === "inspira" && incoming && part) {
      text = `inspirada en la Parte ${part.number}: ${part.title}`;
      href = `${other.href}/leer/${partSlug(part.number)}`;
    } else if (t.kind === "guino") {
      text = isBook ? `guiño al libro ${other.title}` : `guiño a ${other.title}`;
    } else if (t.kind === "inspira") {
      text = `inspiración de ${other.title}`;
    } else if (t.kind === "continua") {
      text = `continúa ${other.title}`;
    } else if (t.kind === "comparte-universo") {
      text = `comparte universo con ${other.title}`;
    } else {
      continue;
    }
    result.push({ id: t.id, text, href });
  }
  return result;
}

interface ReleaseViewProps {
  work: Work;
  era: Era | null;
  tracks: Track[];
}

/** Página de un sencillo: portada, canciones, embeds y conexiones, sobre el negro de la era */
export function ReleaseView({ work, era, tracks }: ReleaseViewProps) {
  const link = (platform: WorkLink["platform"]) => work.links.find((l) => l.platform === platform)?.url;
  const spotifyUrl = link("spotify");
  const hasAudio = tracks.some((t) => t.audioUrl);
  const platforms = PLATFORMS.flatMap((p) => {
    const url = link(p.platform);
    return url ? [{ ...p, url }] : [];
  });

  const seen = new Set<string>();
  const videos: { url: string; title: string }[] = [];
  for (const t of tracks) {
    const url = t.links.find((l) => l.platform === "youtube")?.url;
    if (url && !seen.has(url)) {
      seen.add(url);
      videos.push({ url, title: t.title });
    }
  }
  const workVideo = link("youtube");
  if (workVideo && !seen.has(workVideo)) videos.push({ url: workVideo, title: work.title });

  const connections = getConnections(work);
  const eraName = era?.name ? `Era ${era.name}` : null;

  return (
    <div className={styles.stage} data-era-page>
      <VerticalLabel />

      <header className={styles.header}>
        {work.coverUrl && (
          <div className={styles.cover}>
            <Image
              src={work.coverUrl}
              alt={`Portada de ${work.title}`}
              width={1400}
              height={1400}
              sizes="(max-width: 639px) calc(100vw - 72px), 420px"
              priority
            />
          </div>
        )}

        <p className={styles.kicker}>
          {TYPE_LABEL[work.type] ?? work.type.toUpperCase()}
          {work.releaseDate && (
            <>
              {" · "}
              <time dateTime={work.releaseDate}>{formatDate(work.releaseDate)}</time>
            </>
          )}
        </p>
        <StarWord as="h1" text={work.title} className={styles.title} />
        {era && eraName && (
          <p className={styles.era}>
            <Link href={era.coreWorkId ? (getWork(era.coreWorkId)?.href ?? "/libros/bduem") : "/libros/bduem"}>
              {eraName}
            </Link>
          </p>
        )}

        <div className={styles.actions}>
          {hasAudio && <ReleaseListenButton tracks={tracks.filter((t) => t.audioUrl)} title={work.title} />}
          {platforms.length > 0 && (
            <ul className={styles.platforms} aria-label="Escuchar en otras plataformas">
              {platforms.map((p) => (
                <li key={p.platform}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.label}
                    <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {tracks.length > 0 && (
          <section className={styles.section} aria-labelledby="release-tracks">
            <h2 id="release-tracks" className={styles.heading}>
              Canciones
            </h2>
            <ReleaseTrackList tracks={tracks} fallbackUrl={spotifyUrl} />
          </section>
        )}

        {(spotifyUrl || videos.length > 0) && (
          <section className={styles.section} aria-labelledby="release-embeds">
            <h2 id="release-embeds" className={styles.heading}>
              Escuchar y ver
            </h2>
            <div className={styles.embeds}>
              {spotifyUrl && <SpotifyEmbed url={spotifyUrl} title={work.title} />}
              <ReleaseVideos videos={videos} />
            </div>
          </section>
        )}

        <Lyrics tracks={tracks} />

        {tracks.some((t) => !t.lyrics?.length && !!t.credits?.length) && (
          <section className={styles.section} aria-labelledby="release-credits">
            <h2 id="release-credits" className={styles.heading}>
              Créditos
            </h2>
            {tracks
              .filter((t) => !t.lyrics?.length && !!t.credits?.length)
              .map((t) => (
                <div key={t.id} className={styles.creditsBlock}>
                  <h3 className={styles.creditsTitle}>{t.title}</h3>
                  <Credits credits={t.credits ?? []} title={t.title} />
                </div>
              ))}
          </section>
        )}

        {connections.length > 0 && (
          <section className={styles.section} aria-labelledby="release-threads">
            <h2 id="release-threads" className={styles.heading}>
              Conectado con
            </h2>
            <ul className={styles.threads}>
              {connections.map((c) => (
                <li key={c.id}>
                  <Link href={c.href}>
                    {c.text}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
