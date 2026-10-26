"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/media/Lightbox";
import type { Photo } from "@/types/content";
import styles from "./PhotoGallery.module.css";

/** Giro fijo por posición: el mismo en el servidor y en el cliente */
const TILTS = [-3, 2, -1.5, 3, -2];

/** Cuántas fotos se cargan sin diferir (las de arriba) */
const EAGER = 4;

/** Mosaico de polaroids en blanco y negro; cada una abre el visor en esa foto */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <ul className={styles.mosaic}>
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
                sizes="(max-width: 700px) 46vw, (max-width: 1200px) 30vw, 360px"
                loading={i < EAGER ? "eager" : "lazy"}
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
