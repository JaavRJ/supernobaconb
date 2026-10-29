import { BookPiece } from "@/components/literature/BookPiece";
import { WritingsList } from "@/components/literature/WritingsList";
import { getWorksByConstellation, getWritings } from "@/content";
import styles from "./page.module.css";

export const metadata = {
  title: "Literatura",
  description:
    "Los libros y escritos de noba, el que escribe: Brillo de una Estrella Muerta, letras y textos.",
};

export default function LibrosPage() {
  const books = getWorksByConstellation("noba").filter((w) => w.type === "libro");
  const writings = getWritings();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Literatura</h1>
        <p className={styles.tagline}>el que escribe</p>
      </header>

      {books.length > 0 && (
        <section className={styles.section} aria-labelledby="libros-libros">
          <h2 id="libros-libros" className={styles.heading}>
            Libros
          </h2>
          <div className={styles.books}>
            {books.map((book) => (
              <BookPiece key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {writings.length > 0 && (
        <section className={styles.section} aria-labelledby="libros-escritos">
          <h2 id="libros-escritos" className={styles.heading}>
            Escritos
          </h2>
          <WritingsList writings={writings} />
        </section>
      )}
    </div>
  );
}
