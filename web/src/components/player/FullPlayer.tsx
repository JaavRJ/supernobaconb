"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getEra, getWork } from "@/content";
import { eraThemeStyle } from "@/lib/theme";
import type { Track } from "@/types/content";
import {
  ChevronDownIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  VolumeIcon,
  formatTime,
} from "./PlayerIcons";
import { usePlayer } from "./PlayerProvider";
import styles from "./FullPlayer.module.css";

/** Debe coincidir con la duración de las animaciones del CSS */
const EXIT_MS = 260;

/** Desplazamiento hacia abajo (px) a partir del cual el gesto cierra la vista */
const SWIPE_CLOSE_PX = 90;

interface FullPlayerProps {
  open: boolean;
  onClose: () => void;
  /** Elemento que abrió la vista; recupera el foco al cerrar */
  openerRef: RefObject<HTMLElement | null>;
  track: Track;
}

/**
 * Vista completa del reproductor. Se monta en <body> para que el resto de la
 * página pueda quedar inerte, y se mantiene montada durante la animación de salida.
 */
export function FullPlayer({ open, onClose, openerRef, track }: FullPlayerProps) {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  // Mientras está abierta: página inerte y sin scroll de fondo
  useEffect(() => {
    if (!open) return;
    const inerted: Element[] = [];
    for (const el of Array.from(document.body.children)) {
      // Los portales del propio Next (avisos de ruta, overlay de desarrollo) y los scripts no se tocan
      if (el.hasAttribute("data-full-player") || el.tagName === "SCRIPT" || el.tagName.includes("-")) continue;
      if (!el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        inerted.push(el);
      }
    }
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      for (const el of inerted) el.removeAttribute("inert");
      html.style.overflow = previousOverflow;
    };
  }, [open]);

  // Al cerrar, el foco vuelve al botón que la abrió (ya sin inert)
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      openerRef.current?.focus();
    }
  }, [open, openerRef]);

  // Tras la animación de salida se desmonta
  useEffect(() => {
    if (open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduced ? 0 : EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!present) return null;
  return createPortal(<Dialog open={open} onClose={onClose} track={track} />, document.body);
}

function Dialog({
  open,
  onClose,
  track,
}: {
  open: boolean;
  onClose: () => void;
  track: Track;
}) {
  const {
    queue,
    index,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    playQueue,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();

  const dialogRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"letra" | "cola">("letra");

  // Navegar con la vista abierta la cierra; la música sigue (el <audio> vive en el layout)
  const pathname = usePathname();
  const openedAt = useRef(pathname);
  useEffect(() => {
    if (pathname !== openedAt.current) onClose();
  }, [pathname, onClose]);

  // El foco entra al diálogo al abrir
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Gesto de deslizar hacia abajo desde la franja superior (solo celular)
  const swipeStart = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    swipeStart.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (swipeStart.current === null || !dialogRef.current) return;
    const dy = Math.max(0, e.touches[0].clientY - swipeStart.current);
    dialogRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (dialogRef.current) dialogRef.current.style.transform = "";
    if (start !== null && e.changedTouches[0].clientY - start > SWIPE_CLOSE_PX) onClose();
  };
  // Si el sistema cancela el toque, el diálogo vuelve a su lugar sin cerrarse
  const onTouchCancel = () => {
    swipeStart.current = null;
    if (dialogRef.current) dialogRef.current.style.transform = "";
  };

  const work = getWork(track.workId);
  const era = work ? getEra(work.era) : undefined;
  const total = duration || track.durationSec;
  const progressText = `${formatTime(currentTime)} de ${formatTime(total)}`;
  const lyrics = track.lyrics?.filter((stanza) => stanza.length > 0) ?? [];

  const themeStyle: CSSProperties | undefined = era ? eraThemeStyle(era.theme) : undefined;

  return (
    <div
      ref={dialogRef}
      className={styles.dialog}
      data-full-player=""
      data-state={open ? "open" : "closed"}
      data-tab={tab}
      data-themed={era ? "" : undefined}
      style={themeStyle}
      role="dialog"
      aria-modal="true"
      aria-label={`Reproductor: ${track.title}`}
      tabIndex={-1}
    >
      <div
        className={styles.top}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar el reproductor">
          <ChevronDownIcon />
        </button>
        <span className={styles.grip} aria-hidden="true" />
      </div>

      <div className={styles.layout}>
        <section className={styles.main} aria-label="Ahora suena">
          <div className={styles.cover}>
            {work?.coverUrl ? (
              <Image
                src={work.coverUrl}
                alt={work.title ? `Portada de ${work.title}` : "Portada"}
                fill
                sizes="(min-width: 900px) 40vh, 60vw"
                priority
                className={styles.coverImage}
              />
            ) : (
              <span className={styles.coverFallback} aria-hidden="true" />
            )}
          </div>

          <div className={styles.meta}>
            <h2 className={styles.title}>{track.title}</h2>
            {work && (
              <Link href={work.href} className={styles.work} onClick={onClose}>
                {work.title}
              </Link>
            )}
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

          <div className={styles.controls}>
            <button type="button" className={styles.button} onClick={previous} aria-label="Canción anterior">
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
        </section>

        <div className={styles.tabs} role="group" aria-label="Contenido">
          <button
            type="button"
            className={styles.tab}
            aria-pressed={tab === "letra"}
            onClick={() => setTab("letra")}
          >
            Letra
          </button>
          <button
            type="button"
            className={styles.tab}
            aria-pressed={tab === "cola"}
            onClick={() => setTab("cola")}
          >
            Cola
          </button>
        </div>

        <section className={styles.queue} aria-label="Cola de reproducción">
          <ol className={styles.queueList}>
            {queue.map((item, i) => {
              const itemWork = getWork(item.workId);
              const current = i === index;
              return (
                <li key={`${item.id}-${i}`}>
                  <button
                    type="button"
                    className={styles.queueItem}
                    aria-current={current ? "true" : undefined}
                    onClick={() => playQueue(queue, i)}
                  >
                    <span className={styles.queueTitle}>{item.title}</span>
                    <span className={styles.queueWork}>{itemWork?.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.lyrics} aria-label="Letra" tabIndex={0} key={track.id}>
          {lyrics.length > 0 ? (
            lyrics.map((stanza, i) => (
              <p key={i} className={styles.stanza}>
                {stanza.map((line, j) => (
                  <span key={j} className={styles.line}>
                    {line}
                  </span>
                ))}
              </p>
            ))
          ) : (
            <p className={styles.noLyrics}>Esta canción no tiene letra</p>
          )}
        </section>
      </div>
    </div>
  );
}
