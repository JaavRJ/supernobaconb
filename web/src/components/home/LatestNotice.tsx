"use client";

import { useState, type MouseEvent } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Track } from "@/types/content";
import styles from "./LatestRelease.module.css";

interface LatestNoticeProps {
  title: string;
  eraName?: string | null;
  /** Canciones con audio propio; si hay, suenan en el reproductor del sitio */
  tracks: Track[];
  spotifyUrl?: string;
}

/**
 * Anotación "Nuevo": en escritorio, una estrella con su nota al margen dentro del hero;
 * en celular, una isla flotante que se puede ocultar durante la visita.
 */
export function LatestNotice({ title, eraName, tracks, spotifyUrl }: LatestNoticeProps) {
  const { playQueue } = usePlayer();
  const [dismissed, setDismissed] = useState(false);
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
    <section
      aria-label="Novedad"
      className={`${styles.notice} ${dismissed ? styles.dismissed : ""}`}
    >
      <span className={styles.star} aria-hidden="true" />
      <span className={styles.line} aria-hidden="true" />
      <div className={styles.body}>
        <p className={styles.eyebrow}>NUEVO</p>
        <h2 className={styles.title}>{title}</h2>
        {eraName && <p className={styles.era}>{eraName}</p>}
        <div className={styles.actions}>
          {playable.length > 0 ? (
            <button
              type="button"
              className={styles.link}
              aria-label={`Escuchar ${title}`}
              onClick={() => playQueue(playable)}
            >
              escuchar ↗
            </button>
          ) : (
            spotifyUrl && (
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                escuchar ↗
                <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>
              </a>
            )
          )}
          <a href="#cielo" className={`${styles.link} ${styles.skyLink}`} onClick={goToSky}>
            ver en el cielo
          </a>
        </div>
      </div>
      <button
        type="button"
        className={styles.close}
        aria-label="Ocultar novedad"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </section>
  );
}
