import Link from "next/link";
import { YouTubeEmbed } from "@/components/music/YouTubeEmbed";
import { getWork } from "@/content";
import type { Video } from "@/types/content";
import styles from "./VideoList.module.css";

/** Fecha larga en español, sin depender de la zona horaria del servidor */
function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-MX", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Videoclips en rejilla: fachada de YouTube, sencillo ligado y fecha */
export function VideoList({ videos }: { videos: Video[] }) {
  return (
    <ul className={styles.grid}>
      {videos.map((video) => {
        const work = getWork(video.workId);
        return (
          <li key={video.id} className={styles.item}>
            <YouTubeEmbed url={video.url} title={video.title} />
            <p className={styles.meta}>
              {work?.href && (
                <>
                  <span className={styles.label}>Sencillo</span>{" "}
                  <Link className={styles.link} href={work.href}>
                    {work.title}
                  </Link>
                  <span aria-hidden="true"> · </span>
                </>
              )}
              <time dateTime={video.date}>{formatDate(video.date)}</time>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
