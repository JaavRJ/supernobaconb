"use client";

import { useEffect, useRef, useState } from "react";
import { parseSpotify, safeHttpsUrl } from "./EmbedParse";
import styles from "./Embed.module.css";

interface SpotifyEmbedProps {
  url: string;
  title?: string;
}

/** Fachada: tarjeta sin red hasta que se pulsa el botón; entonces monta el iframe oficial */
export function SpotifyEmbed({ url, title }: SpotifyEmbedProps) {
  const ref = parseSpotify(url);
  const [active, setActive] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (active) frameRef.current?.focus();
  }, [active]);

  const kindLabel = ref?.kind === "album" ? "Álbum" : "Canción";
  const name = title ?? "Spotify";

  if (!ref) {
    const href = safeHttpsUrl(url);
    if (!href) return null;
    return (
      <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
        Escuchar en Spotify
      </a>
    );
  }

  if (active) {
    return (
      <iframe
        referrerPolicy="strict-origin-when-cross-origin"
        ref={frameRef}
        className={styles.frame}
        style={{ maxWidth: 560, height: ref.kind === "album" ? 352 : 152 }}
        src={`https://open.spotify.com/embed/${ref.kind}/${ref.id}`}
        title={`Reproductor de Spotify: ${name}`}
        allow="encrypted-media"
        loading="lazy"
      />
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <svg className={styles.icon} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="18" cy="18" r="15" />
          <path d="M9.5 14c6-1.6 12-1.2 17 1.6M10.5 19.2c5-1.2 9.6-.9 14 1.4M11.5 24c4-.8 7.2-.6 10.5 1" />
        </svg>
        <div className={styles.text}>
          <p className={styles.kind}>{kindLabel}</p>
          <p className={styles.title}>{name}</p>
        </div>
        <button type="button" className={styles.button} onClick={() => setActive(true)}>
          Escuchar en Spotify
        </button>
      </div>
    </div>
  );
}
