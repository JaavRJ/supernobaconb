"use client";

import { useSyncExternalStore } from "react";
import styles from "./Reader.module.css";
import { releaseInstant } from "./format";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

const getNow = () => Math.floor(Date.now() / 1000);
/** En el servidor y en la hidratación no hay hora: se muestran guiones y luego el valor real */
const getServerNow = () => null;

const pad = (n: number) => String(n).padStart(2, "0");

/** Cuenta regresiva a la fecha de publicación (YYYY-MM-DD, hora de México) */
export function PartCountdown({ releaseDate }: { releaseDate: string }) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  const left = now === null ? null : Math.max(0, releaseInstant(releaseDate) / 1000 - now);

  const units =
    left === null
      ? [["--", "días"], ["--", "horas"], ["--", "min"], ["--", "seg"]]
      : [
          [String(Math.floor(left / 86400)), "días"],
          [pad(Math.floor((left % 86400) / 3600)), "horas"],
          [pad(Math.floor((left % 3600) / 60)), "min"],
          [pad(Math.floor(left % 60)), "seg"],
        ];

  return (
    <div className={styles.countdown} role="timer" aria-label="Tiempo para la publicación">
      {units.map(([value, label]) => (
        <span key={label} className={styles.countUnit}>
          <b>{value}</b>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}
