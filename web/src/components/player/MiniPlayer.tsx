"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { getEra, getWork } from "@/content";
import { eraThemeStyle } from "@/lib/theme";
import { usePlayer } from "./PlayerProvider";
import styles from "./MiniPlayer.module.css";

/** Margen entre la barra flotante y el borde inferior (px); debe coincidir con el CSS */
const PLAYER_MARGIN = 18;

/** m:ss */
function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
      <path d="M6 5h2v14H6zM20 5v14L9.5 12z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
      <path d="M16 5h2v14h-2zM4 5l10.5 7L4 19z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="currentColor">
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="currentColor">
      <path d="M6 4.5h4v15H6zM14 4.5h4v15h-4z" />
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
      <path d="M3 9v6h4l5 4V5L7 9z" />
      {muted ? (
        <path d="M15 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" fill="none" />
      ) : (
        <path
          d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function MiniPlayer() {
  const {
    queue,
    index,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();

  const visible = Boolean(currentTrack);

  const barRef = useRef<HTMLDivElement>(null);

  // Reserva espacio al final de la página: alto real de la barra + su margen inferior
  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;
    if (!visible || !bar) {
      root.style.setProperty("--player-height", "0px");
      return;
    }
    const update = () =>
      root.style.setProperty("--player-height", `${bar.offsetHeight + PLAYER_MARGIN}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.setProperty("--player-height", "0px");
    };
  }, [visible]);

  if (!currentTrack) return null;

  const work = getWork(currentTrack.workId);
  const era = work ? getEra(work.era) : undefined;
  const total = duration || currentTrack.durationSec;
  const progressText = `${formatTime(currentTime)} de ${formatTime(total)}`;

  return (
    <div
      ref={barRef}
      className={styles.player}
      style={era ? eraThemeStyle(era.theme) : undefined}
    >
      <div className={styles.thumb} aria-hidden="true" />
      <div className={styles.info}>
        <span className={styles.title}>{currentTrack.title}</span>
        {work && <span className={styles.work}>{work.title}</span>}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={previous}
          aria-label="Canción anterior"
        >
          <PrevIcon />
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={next}
          disabled={index >= queue.length - 1}
          aria-label="Canción siguiente"
        >
          <NextIcon />
        </button>
      </div>

      <div className={styles.progress}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <input
          type="range"
          className={styles.range}
          style={{ "--pct": `${total ? (Math.min(currentTime, total) / total) * 100 : 0}%` } as CSSProperties}
          min={0}
          max={total}
          step={1}
          value={Math.min(currentTime, total)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Progreso"
          aria-valuetext={progressText}
        />
        <span className={styles.time}>{formatTime(total)}</span>
      </div>

      <div className={styles.volume}>
        <button
          type="button"
          className={styles.button}
          onClick={toggleMute}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          <VolumeIcon muted={muted || volume === 0} />
        </button>
        <input
          type="range"
          className={`${styles.range} ${styles.volumeRange}`}
          style={{ "--pct": `${(muted ? 0 : volume) * 100}%` } as CSSProperties}
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volumen"
          aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} %`}
        />
      </div>
    </div>
  );
}
