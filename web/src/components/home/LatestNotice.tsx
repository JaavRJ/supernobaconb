"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerTrack } from "@/types/content";
import styles from "./LatestRelease.module.css";

interface LatestNoticeProps {
  title: string;
  eraName?: string | null;
  /** Canciones con audio propio; si hay, suenan en el reproductor del sitio */
  tracks: PlayerTrack[];
  spotifyUrl?: string;
}

/**
 * Anotación "Nuevo": en escritorio, una estrella con su nota al margen dentro del hero;
 * en celular, una isla flotante que se puede ocultar durante la visita.
 */
export function LatestNotice({
  title,
  eraName,
  tracks,
  spotifyUrl,
}: LatestNoticeProps) {
  const { playQueue } = usePlayer();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const playable = tracks.filter((t) => Boolean(t.audioUrl));

  // En celular la isla solo se ve mientras el hero está en pantalla
  useEffect(() => {
    const hero = rootRef.current?.parentElement;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisible(entry.isIntersecting);
      if (!entry.isIntersecting) setExpanded(false);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Escape o tocar fuera colapsan el panel
  useEffect(() => {
    if (!expanded) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setExpanded(false);
      toggleRef.current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setExpanded(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [expanded]);

  function goToSky(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("cielo");
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", "#cielo");
    setExpanded(false);
  }

  return (
    <section
      ref={rootRef}
      aria-label="Novedad"
      className={`${styles.notice} ${dismissed ? styles.dismissed : ""} ${heroVisible ? "" : styles.offscreen}`}
    >
      <span className={styles.star} aria-hidden="true" />
      <span className={styles.line} aria-hidden="true" />
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={styles.dot} aria-hidden="true" />
        Nuevo
      </button>
      <div
        id={panelId}
        className={`${styles.panel} ${expanded ? "" : styles.collapsed}`}
      >
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
                  <span className={styles.srOnly}>
                    {" "}
                    (se abre en una pestaña nueva)
                  </span>
                </a>
              )
            )}
            <a
              href="#cielo"
              className={`${styles.link} ${styles.skyLink}`}
              onClick={goToSky}
            >
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
      </div>
    </section>
  );
}
