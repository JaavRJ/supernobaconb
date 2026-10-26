"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/media/Lightbox";
import type { ProjectScreenshot } from "@/types/content";
import styles from "./ProjectScreenshots.module.css";

/** Una captura es vertical si es claramente más alta que ancha (como las de AURA) */
function isTall(shot: ProjectScreenshot) {
  return shot.height > shot.width * 1.1;
}

/** Capturas a color con marco fino; cada una abre el visor en esa imagen */
export function ProjectScreenshots({ screenshots }: { screenshots: ProjectScreenshot[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (screenshots.length === 0) return null;

  const [first, ...rest] = screenshots;
  const firstTall = isTall(first);

  const renderShot = (shot: ProjectScreenshot, i: number, large: boolean) => (
    <figure className={styles.figure}>
      <button
        type="button"
        className={styles.frame}
        aria-label={`Ampliar captura: ${shot.alt}`}
        onClick={() => setIndex(i)}
      >
        <Image
          className={styles.image}
          src={shot.src}
          width={shot.width}
          height={shot.height}
          alt=""
          sizes={
            large
              ? "(max-width: 72rem) 92vw, 1100px"
              : "(max-width: 640px) 46vw, (max-width: 1200px) 30vw, 360px"
          }
          loading={i === 0 ? "eager" : "lazy"}
        />
      </button>
      {shot.caption ? <figcaption className={styles.caption}>{shot.caption}</figcaption> : null}
    </figure>
  );

  // Verticales: una fila de angostas; el resto: rejilla de 2 a 3 columnas
  const allTall = rest.length > 0 && rest.every(isTall);
  // Si todas son verticales (capturas de celular), van juntas en una sola fila, sin destacar la primera
  const onlyTall = firstTall && allTall;

  if (onlyTall) {
    return (
      <section className={styles.section} aria-label="Capturas">
        <ul className={styles.tallRow}>
          {screenshots.map((shot, i) => (
            <li key={shot.src} className={styles.cell}>
              {renderShot(shot, i, false)}
            </li>
          ))}
        </ul>
        <Lightbox
          images={screenshots}
          index={index}
          onClose={() => setIndex(null)}
          onIndexChange={setIndex}
        />
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Capturas">
      <div className={firstTall ? styles.firstTall : styles.first}>{renderShot(first, 0, !firstTall)}</div>
      {rest.length > 0 ? (
        <ul className={allTall ? styles.tallRow : styles.grid}>
          {rest.map((shot, i) => (
            <li key={shot.src} className={styles.cell}>
              {renderShot(shot, i + 1, false)}
            </li>
          ))}
        </ul>
      ) : null}
      <Lightbox
        images={screenshots}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </section>
  );
}
