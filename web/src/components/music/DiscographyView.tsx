"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Track } from "@/types/content";
import styles from "./Discography.module.css";

export interface DiscographyItem {
  id: string;
  href: string;
  title: string;
  coverUrl?: string;
  dateIso?: string;
  /** Fecha en español; ausente si aún no hay fecha */
  dateLabel?: string;
  eraName?: string;
  trackCount: number;
  /** Duración total ya formateada */
  duration?: string;
  /** Aún no se publica: se muestra apagada y sin "Escuchar" */
  upcoming: boolean;
  /** Canciones con audio propio, para el reproductor del sitio */
  playable: Track[];
  /** Smart link o, si no hay, Spotify */
  listenUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
}

interface DiscographyViewProps {
  items: DiscographyItem[];
  /** La constelación, ya dibujada en el servidor */
  sky: ReactNode;
}

const NEW_TAB = <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>;

function ExternalLink({ url, label, title }: { url: string; label: string; title: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.platform}
    >
      {label}
      <span className={styles.srOnly}>: {title}</span>
      {NEW_TAB}
    </a>
  );
}

function Row({ item }: { item: DiscographyItem }) {
  const { playQueue } = usePlayer();
  const { title } = item;

  return (
    <li className={`${styles.row} ${item.upcoming ? styles.upcoming : ""}`}>
      <div className={styles.cover}>
        {item.coverUrl ? (
          <Image src={item.coverUrl} alt="" width={240} height={240} sizes="(max-width: 639px) 96px, 120px" />
        ) : (
          <span aria-hidden="true">{title}</span>
        )}
      </div>

      <div className={styles.text}>
        <h3 className={styles.title}>
          <Link href={item.href} className={styles.titleLink}>
            {title}
          </Link>
        </h3>
        <p className={styles.meta}>
          {item.upcoming ? (
            <span>{item.dateLabel ? `se publica el ${item.dateLabel}` : "próximamente"}</span>
          ) : (
            item.dateIso &&
            item.dateLabel && <time dateTime={item.dateIso}>{item.dateLabel}</time>
          )}
          {item.eraName && <span>{item.eraName}</span>}
          {item.trackCount > 0 && (
            <span>
              {item.trackCount} {item.trackCount === 1 ? "canción" : "canciones"}
              {item.duration && ` · ${item.duration}`}
            </span>
          )}
        </p>
      </div>

      {!item.upcoming && (
        <div className={styles.actions}>
          {item.playable.length > 0 ? (
            <button
              type="button"
              className={styles.listen}
              aria-label={`Escuchar ${title}`}
              onClick={() => playQueue(item.playable)}
            >
              Escuchar
            </button>
          ) : (
            item.listenUrl && (
              <a href={item.listenUrl} target="_blank" rel="noopener noreferrer" className={styles.listen}>
                Escuchar
                <span className={styles.srOnly}> {title} (se abre en una pestaña nueva)</span>
              </a>
            )
          )}
          <div className={styles.platforms}>
            {item.spotifyUrl && <ExternalLink url={item.spotifyUrl} label="Spotify" title={title} />}
            {item.appleUrl && <ExternalLink url={item.appleUrl} label="Apple Music" title={title} />}
            {item.youtubeUrl && <ExternalLink url={item.youtubeUrl} label="YouTube" title={title} />}
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * Discografía: la constelación Supernoba y la lista de sus sencillos.
 * En escritorio la constelación va arriba; en celular la lista va primero y la constelación después.
 */
export function DiscographyView({ items, sky }: DiscographyViewProps) {
  return (
    <div className={styles.discography}>
      <section className={styles.sky} aria-label="Constelación Supernoba">
        {sky}
      </section>

      <section className={styles.list} aria-label="Sencillos">
        {items.length > 0 ? (
          <ul className={styles.rows}>
            {items.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Todavía no hay música publicada.</p>
        )}
      </section>
    </div>
  );
}
