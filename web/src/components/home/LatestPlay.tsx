"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import type { Track } from "@/types/content";
import styles from "./LatestRelease.module.css";

interface LatestPlayProps {
  title: string;
  /** Canciones con audio propio; si hay, suenan en el reproductor del sitio */
  tracks: Track[];
  spotifyUrl?: string;
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

/** Botón redondo de play: reproductor del sitio si hay audio; si no, Spotify en pestaña nueva */
export function LatestPlay({ title, tracks, spotifyUrl }: LatestPlayProps) {
  const { playQueue } = usePlayer();
  const playable = tracks.filter((t) => Boolean(t.audioUrl));

  if (playable.length > 0) {
    return (
      <button
        type="button"
        className={styles.play}
        aria-label={`Reproducir ${title}`}
        onClick={() => playQueue(playable)}
      >
        <PlayIcon />
      </button>
    );
  }

  if (!spotifyUrl) return null;

  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.play}
      aria-label={`Escuchar ${title} en Spotify`}
    >
      <PlayIcon />
    </a>
  );
}
