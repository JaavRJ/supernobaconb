"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { getEra, getWork } from "@/content";
import { eraThemeStyle } from "@/lib/theme";
import { FullPlayer } from "./FullPlayer";
import {
  ChevronUpIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  VolumeIcon,
  formatTime,
} from "./PlayerIcons";
import { usePlayer } from "./PlayerProvider";
import styles from "./MiniPlayer.module.css";

/** Margen entre la barra flotante y el borde inferior (px); debe coincidir con el CSS */
const PLAYER_MARGIN = 18;

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
  const openerRef = useRef<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Sin canción no hay vista completa que mantener abierta
  if (!currentTrack && expanded) setExpanded(false);

  const closeFull = useCallback(() => setExpanded(false), []);

  const openFull = (e: MouseEvent<HTMLElement>) => {
    openerRef.current = e.currentTarget;
    setExpanded(true);
  };

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
    <>
    <div
      ref={barRef}
      className={styles.player}
      style={era ? eraThemeStyle(era.theme) : undefined}
    >
      <button
        type="button"
        className={styles.open}
        onClick={openFull}
        aria-label={`Abrir el reproductor completo: ${currentTrack.title}`}
        aria-haspopup="dialog"
        aria-expanded={expanded}
      >
        <span
          className={styles.thumb}
          style={work?.coverSmallUrl ? { background: `url("${work.coverSmallUrl}") center / cover no-repeat` } : undefined}
          aria-hidden="true"
        />
        <span className={styles.info}>
          <span className={styles.title}>{currentTrack.title}</span>
          {work && <span className={styles.work}>{work.title}</span>}
        </span>
      </button>

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
        <button
          type="button"
          className={`${styles.button} ${styles.expand}`}
          onClick={openFull}
          aria-label="Abrir el reproductor completo"
          aria-haspopup="dialog"
          aria-expanded={expanded}
        >
          <ChevronUpIcon />
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
    <FullPlayer
      open={expanded}
      onClose={closeFull}
      openerRef={openerRef}
      track={currentTrack}
    />
    </>
  );
}
