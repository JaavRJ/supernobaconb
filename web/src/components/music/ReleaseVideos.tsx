"use client";

import { useState } from "react";
import styles from "./Release.module.css";
import { YouTubeEmbed } from "./YouTubeEmbed";

/** Videos que se ven sin expandir; el resto aparece con "Ver más videos" */
const VISIBLE = 2;

/** Videos de las canciones de un sencillo; si son más de dos, los demás esperan a que se pidan */
export function ReleaseVideos({ videos }: { videos: { url: string; title: string }[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? videos : videos.slice(0, VISIBLE);
  const hidden = videos.length - VISIBLE;

  return (
    <>
      {shown.map((v) => (
        <YouTubeEmbed key={v.url} url={v.url} title={v.title} />
      ))}
      {hidden > 0 && !expanded && (
        <button type="button" className={styles.moreVideos} onClick={() => setExpanded(true)}>
          Ver más videos ({hidden})
        </button>
      )}
    </>
  );
}
