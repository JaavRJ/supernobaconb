"use client";

import type { PlayerTrack } from "@/types/content";
import { usePlayer } from "@/components/player/PlayerProvider";
import styles from "./Release.module.css";

function formatDuration(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

/** Botón principal: reproduce todo el sencillo en el reproductor del sitio */
export function ReleaseListenButton({ tracks, title }: { tracks: PlayerTrack[]; title: string }) {
  const { playQueue } = usePlayer();
  return (
    <button
      type="button"
      className={styles.listen}
      aria-label={`Escuchar ${title}`}
      onClick={() => playQueue(tracks)}
    >
      Escuchar
    </button>
  );
}

interface ReleaseTrackListProps {
  tracks: PlayerTrack[];
  /** Plataforma a la que enviar las canciones sin audio propio */
  fallbackUrl?: string;
}

/** Lista numerada de canciones con su botón de reproducir; la que suena se marca */
export function ReleaseTrackList({ tracks, fallbackUrl }: ReleaseTrackListProps) {
  const { playQueue, currentTrack, isPlaying } = usePlayer();
  const playable = tracks.filter((t) => t.audioUrl);

  return (
    <ol className={styles.tracks}>
      {tracks.map((t) => {
        const current = currentTrack?.id === t.id;
        const url = t.links.find((l) => l.platform === "spotify")?.url ?? fallbackUrl;
        return (
          <li
            key={t.id}
            className={styles.track}
            data-current={current || undefined}
            aria-current={current ? "true" : undefined}
          >
            <span className={styles.trackNumber} aria-hidden="true">
              {t.number}
            </span>
            <span className={styles.trackName}>
              {t.title}
              {t.explicit && (
                <abbr className={styles.explicit} title="Contenido explícito">
                  E<span className={styles.srOnly}> (contenido explícito)</span>
                </abbr>
              )}
              {current && (
                <span className={styles.nowPlaying}>{isPlaying ? "sonando" : "en pausa"}</span>
              )}
              {!!t.lyrics?.length && (
                <a className={styles.trackLyrics} href={`#letra-${t.id}`}>
                  Letra<span className={styles.srOnly}> de {t.title}</span>
                </a>
              )}
            </span>
            <span className={styles.trackDuration}>{formatDuration(t.durationSec)}</span>
            {t.audioUrl ? (
              <button
                type="button"
                className={styles.trackPlay}
                aria-label={`Reproducir ${t.title}`}
                onClick={() => playQueue(playable, playable.findIndex((p) => p.id === t.id))}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                </svg>
              </button>
            ) : url ? (
              <a
                className={styles.trackPlatform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escuchar
                <span className={styles.srOnly}> {t.title} en Spotify (se abre en una pestaña nueva)</span>
              </a>
            ) : (
              <span />
            )}
          </li>
        );
      })}
    </ol>
  );
}
