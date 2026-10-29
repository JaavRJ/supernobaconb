import Link from "next/link";
import { getDiary } from "@/content";
import styles from "./DiaryList.module.css";

/** Primer párrafo recortado en una palabra completa */
function excerpt(text: string, max = 180) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Lista del diario de Proceso, las entradas más nuevas primero */
export function DiaryList() {
  const entries = getDiary();

  if (entries.length === 0) {
    return (
      <p className={styles.empty}>
        Aquí irán las notas de cómo nacen las canciones, el libro y lo que venga.
      </p>
    );
  }

  return (
    <section aria-label="Diario">
      <ol className={styles.rows}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.row}>
            <time className={styles.date} dateTime={entry.date}>
              {formatDate(entry.date)}
            </time>
            <h2 className={styles.name}>
              <Link href={`/proceso/${entry.id}`} className={styles.nameLink}>
                {entry.title}
              </Link>
            </h2>
            {entry.paragraphs[0] && <p className={styles.excerpt}>{excerpt(entry.paragraphs[0])}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
