"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { parseYouTube, safeHttpsUrl } from "./EmbedParse";
import styles from "./Embed.module.css";

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

/** Fachada: miniatura y botón; el iframe de youtube-nocookie solo se monta tras pulsar */
export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const id = parseYouTube(url);
  const [active, setActive] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (active) frameRef.current?.focus();
  }, [active]);

  const name = title ?? "Video de YouTube";

  if (!id) {
    const href = safeHttpsUrl(url);
    if (!href) return null;
    return (
      <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
        Ver video
      </a>
    );
  }

  if (active) {
    return (
      <iframe
        referrerPolicy="strict-origin-when-cross-origin"
        ref={frameRef}
        className={`${styles.frame} ${styles.frame16x9}`}
        style={{ maxWidth: 560 }}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={`Video de YouTube: ${name}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.thumb}>
        <Image
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          fill
          sizes="(max-width: 600px) 100vw, 560px"
          loading="lazy"
          unoptimized
        />
      </div>
      <div className={styles.body}>
        <div className={styles.text}>
          <p className={styles.kind}>Video</p>
          <p className={styles.title}>{name}</p>
        </div>
        <button type="button" className={styles.button} onClick={() => setActive(true)}>
          Ver video
        </button>
      </div>
    </div>
  );
}
