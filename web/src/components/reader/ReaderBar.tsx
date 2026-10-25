import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Reader.module.css";

interface ReaderBarProps {
  partNumber: number;
  partTitle: string;
  /** Minutos de lectura de la parte completa */
  totalMinutes: number;
  /** Avance de 0 a 1 (por scroll o por páginas, lo calcula el lector) */
  progress: number;
  /** Hueco para los controles de lectura (modo, tamaño, marcadores) */
  children?: ReactNode;
}

/** Barra fija y mínima: volver al libro, nombre de la parte, progreso y tiempo restante */
export function ReaderBar({ partNumber, partTitle, totalMinutes, progress, children }: ReaderBarProps) {
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
