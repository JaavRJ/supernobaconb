"use client";

import type { MouseEvent } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Track } from "@/types/content";
import styles from "./LatestRelease.module.css";

interface LatestActionsProps {
  title: string;
  /** Canciones con audio propio; si hay, suenan en el reproductor del sitio */
  tracks: Track[];
  spotifyUrl?: string;
}

/** Acciones del aviso "Nuevo": escuchar (reproductor o Spotify) y bajar al cielo */
export function LatestActions({ title, tracks, spotifyUrl }: LatestActionsProps) {
  const { playQueue } = usePlayer();
  const playable = tracks.filter((t) => Boolean(t.audioUrl));

  function goToSky(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("cielo");
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", "#cielo");
  }

  return (
    <div className={styles.actions}>
      {playable.length > 0 ? (
        <button
          type="button"
          className={`${styles.btn} ${styles.warm}`}
          aria-label={`Escuchar ${title}`}
          onClick={() => playQueue(playable)}
        >
          Escuchar
        </button>
      ) : (
        spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.warm}`}
          >
            Escuchar
            <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>
          </a>
        )
      )}
      <a href="#cielo" className={styles.btn} onClick={goToSky}>
        Ver en el cielo
      </a>
    </div>
  );
}
