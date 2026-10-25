"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./Reader.module.css";

interface ReaderBarProps {
  partNumber: number;
  partTitle: string;
  /** Minutos de lectura de la parte completa */
  totalMinutes: number;
  /** id del elemento con el texto, para medir el avance */
  targetId: string;
  /** Hueco para los controles de lectura (modo, tamaño, marcadores) */
  children?: ReactNode;
}

/** Barra fija y mínima: volver al libro, nombre de la parte, progreso y tiempo restante */
export function ReaderBar({ partNumber, partTitle, totalMinutes, targetId, children }: ReaderBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.getElementById(targetId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = el.offsetHeight - window.innerHeight;
      const value = span > 0 ? (window.scrollY - top) / span : 0;
      setProgress(Math.min(1, Math.max(0, value)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  const remaining = Math.ceil(totalMinutes * (1 - progress));

  return (
    <div className={styles.bar}>
      <div className={styles.barInner}>
        <Link href="/libros/bduem" className={styles.barBack}>
          <span aria-hidden="true">←</span> BDUEM
        </Link>
        <p className={styles.barTitle}>
          Parte {partNumber} · {partTitle}
        </p>
        <p className={styles.barTime}>
          {progress >= 0.995 ? "fin" : `${Math.max(1, remaining)} min`}
        </p>
        <div className={styles.barSlot}>{children}</div>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Avance de lectura"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
