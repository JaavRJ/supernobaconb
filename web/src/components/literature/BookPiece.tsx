import Link from "next/link";
import { StarWord } from "@/components/brand/StarWord";
import { Polaroid } from "@/components/era/Polaroid";
import type { Work } from "@/types/content";
import styles from "./BookPiece.module.css";

/** Un libro como pieza editorial: su polaroid en blanco y negro, título, resumen y enlace */
export function BookPiece({ book }: { book: Work }) {
  const year = book.releaseDate?.slice(0, 4);
  const partCount = book.parts?.length ?? 0;
  const meta = [
    "Libro",
    partCount > 0 ? `${partCount} ${partCount === 1 ? "parte" : "partes"}` : null,
    year ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className={styles.piece}>
      <div className={styles.photo}>
        <Polaroid src={book.photoUrl} alt="" rotate={-2} />
      </div>
      <div className={styles.text}>
        <StarWord as="h2" text={book.title} className={styles.title} />
        <p className={styles.meta}>{meta}</p>
        <p className={styles.summary}>{book.summary}</p>
        <Link href={book.href} className={styles.enter}>
          Entrar al libro →
        </Link>
      </div>
    </article>
  );
}
