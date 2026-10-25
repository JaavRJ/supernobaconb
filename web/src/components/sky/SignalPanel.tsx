"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SkySignal } from "./meta";
import styles from "./Sky.module.css";

interface SignalPanelProps {
  id: string;
  signal: SkySignal | null;
  style: CSSProperties;
  /** Id del botón de la nebulosa: un clic en él no cuenta como "fuera" */
  triggerId: string;
  /** `returnFocus` es verdadero al cerrar con teclado */
  onClose: (returnFocus: boolean) => void;
}

const TYPE_INTERVAL_MS = 45;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function describe(signal: SkySignal | null): string {
  if (!signal) return "Sin señal por ahora.";
  if (signal.kind === "frase") return `Transmisión interceptada: ${signal.content}`;
  if (signal.kind === "imagen") {
    return `Transmisión interceptada: imagen. ${signal.alt ?? ""}`.trim();
  }
  return `Transmisión interceptada: video. ${signal.alt ?? ""}`.trim();
}

/** Panel de "transmisión interceptada" junto a una nebulosa; solo se monta mientras está abierto */
export function SignalPanel({ id, signal, style, triggerId, onClose }: SignalPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReducedMotion);
  const phrase = signal?.kind === "frase" ? signal.content : "";
  const [typed, setTyped] = useState(reduced ? phrase.length : 0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // La región en vivo ya existe vacía; el texto entra después para que se anuncie
    const timer = window.setTimeout(() => setAnnouncement(describe(signal)), 100);
    return () => window.clearTimeout(timer);
  }, [signal]);

  useEffect(() => {
    if (reduced || !phrase) return;
    const timer = window.setInterval(() => {
      setTyped((n) => {
        if (n >= phrase.length) {
          window.clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, TYPE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduced, phrase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panel.current?.contains(target) || document.getElementById(triggerId)?.contains(target)) return;
      onClose(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose, triggerId]);

  return (
    <div ref={panel} id={id} className={styles.signal} style={style}>
      <p className={styles.signalTitle}>Transmisión interceptada</p>
      <div className={styles.signalBody}>
        {!signal && <p className={styles.signalText}>Sin señal por ahora.</p>}
        {signal?.kind === "frase" && (
          <p className={styles.signalText} aria-hidden="true">
            {phrase.slice(0, typed)}
            {typed < phrase.length && <span className={styles.caret}>_</span>}
          </p>
        )}
        {signal?.kind === "imagen" && (
          // La URL de la señal es arbitraria y cambia con el tiempo; no pasa por next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.signalMedia} src={signal.content} alt={signal.alt ?? ""} />
        )}
        {signal?.kind === "video" && (
          <video
            className={styles.signalMedia}
            src={signal.content}
            muted
            loop
            playsInline
            autoPlay
            aria-label={signal.alt}
          />
        )}
        <span className={styles.scan} aria-hidden="true" />
      </div>
      <div className={styles.srOnly} aria-live="polite">
        {announcement}
      </div>
      <button type="button" className={styles.signalClose} onClick={() => onClose(true)}>
        Cerrar
      </button>
    </div>
  );
}
