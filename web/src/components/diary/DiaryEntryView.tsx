import Link from "next/link";
import { ProjectScreenshots } from "@/components/projects/ProjectScreenshots";
import { content } from "@/lib/content";
import type { DiaryEntry } from "@/types/content";
import styles from "./DiaryEntryView.module.css";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Página de una entrada del diario: fecha, título, texto, imágenes y la obra de la que habla */
export async function DiaryEntryView({ entry }: { entry: DiaryEntry }) {
  const work = entry.workId ? (await content()).getWork(entry.workId) : undefined;

  return (
    <article className={styles.page}>
      <Link href="/proceso" className={styles.back}>
        <span aria-hidden="true">← </span>Proceso
      </Link>

      <header>
        <time className={styles.date} dateTime={entry.date}>
          {formatDate(entry.date)}
        </time>
        <h1 className={styles.title}>{entry.title}</h1>
      </header>

      <div className={styles.prose}>
        {entry.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {entry.images && entry.images.length > 0 && <ProjectScreenshots screenshots={entry.images} />}

      {work && (
        <p className={styles.about}>
          Sobre: <Link href={work.href}>{work.title}</Link>
        </p>
      )}
    </article>
  );
}
