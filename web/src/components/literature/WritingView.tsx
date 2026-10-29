import Link from "next/link";
import { VerticalLabel } from "@/components/era/VerticalLabel";
import { Connections } from "@/components/works/Connections";
import type { Work, Writing } from "@/types/content";
import { KIND_LABEL, formatDate } from "./format";
import styles from "./WritingView.module.css";

interface WritingViewProps {
  work: Work;
  writing: Writing;
  /** Libro del que nace el escrito; sin él va en la base radiante */
  book?: Work;
}

/** Página de un escrito: estrofas con sus versos, o párrafos si es un texto */
export function WritingView({ work, writing, book }: WritingViewProps) {
  const isProse = writing.kind === "texto";

  return (
    <div className={styles.stage} data-era-page={book ? "" : undefined}>
      {book && <VerticalLabel />}

      <Link href="/libros" className={styles.back}>
        ← Literatura
      </Link>

      <header className={styles.header}>
        <p className={styles.kicker}>
          {KIND_LABEL[writing.kind]}
          {work.releaseDate && (
            <>
              {" · "}
              <time dateTime={work.releaseDate}>{formatDate(work.releaseDate)}</time>
            </>
          )}
        </p>
        <h1 className={styles.title}>{work.title}</h1>
        {book && (
          <p className={styles.book}>
            de <Link href={book.href}>{book.title}</Link>
          </p>
        )}
      </header>

      <div className={styles.body}>
        {writing.body.map((block, i) =>
          isProse ? (
            block.map((paragraph, j) => (
              <p key={`${i}-${j}`} className={styles.paragraph}>
                {paragraph}
              </p>
            ))
          ) : (
            <p key={i} className={styles.stanza}>
              {block.map((line, j) => (
                <span key={j} className={styles.line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          ),
        )}
        {writing.note && <p className={styles.note}>{writing.note}</p>}
      </div>

      <div className={styles.connections}>
        <Connections work={work} />
      </div>
    </div>
  );
}
