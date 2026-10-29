import Link from "next/link";
import type { Work, Writing } from "@/types/content";
import { KIND_LABEL, formatDate } from "./format";
import styles from "./WritingsList.module.css";

/** Lista de escritos: tipo, título, fecha y primer verso, cada uno enlazado a su página */
export function WritingsList({ writings }: { writings: (Work & { writing: Writing })[] }) {
  return (
    <ul className={styles.list}>
      {writings.map((w) => {
        const firstLine = w.writing.body[0]?.[0];
        return (
          <li key={w.id}>
            <Link href={w.href} className={styles.item}>
              <span className={styles.kind}>{KIND_LABEL[w.writing.kind]}</span>
              <span className={styles.title}>{w.title}</span>
              {w.releaseDate && (
                <time className={styles.date} dateTime={w.releaseDate}>
                  {formatDate(w.releaseDate)}
                </time>
              )}
              {firstLine && <span className={styles.first}>{firstLine}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
