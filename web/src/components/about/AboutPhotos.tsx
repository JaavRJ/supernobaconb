"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/media/Lightbox";
import type { Photo } from "@/types/content";
import styles from "./AboutPhotos.module.css";

/** Giro fijo por posición: el mismo en el servidor y en el cliente */
const TILTS = [-3, 2, -2, 3];

/** Tira de polaroids en blanco y negro; cada una abre el visor en esa foto */
export function AboutPhotos({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <ul className={styles.strip}>
        {photos.map((photo, i) => (
          <li key={photo.id} className={styles.item}>
            <button
              type="button"
              className={styles.frame}
              style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
              aria-label={`Ver foto: ${photo.alt}`}
              onClick={() => setIndex(i)}
            >
              <Image
                className={styles.photo}
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt=""
                sizes="(max-width: 700px) 46vw, 240px"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        images={photos}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
        monochrome
      />
    </>
  );
}
