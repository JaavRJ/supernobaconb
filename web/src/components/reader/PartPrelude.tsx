import { StarWord } from "@/components/brand/StarWord";
import { HorizontalScroll } from "@/components/era/HorizontalScroll";
import { Polaroid } from "@/components/era/Polaroid";
import { getPartPrelude } from "@/content/bduemPrelude";
import styles from "./PartPrelude.module.css";

interface PartPreludeProps {
  partNumber: number;
  /** Destino del enlace final, normalmente el primer capítulo */
  startHref: string;
  /** Si la página ya tiene el título de la parte, se omite el panel del título */
  showTitle?: boolean;
}

/** Antesala de una parte: título, fragmentos y polaroids en recorrido horizontal, y el paso al texto */
export function PartPrelude({ partNumber, startHref, showTitle = true }: PartPreludeProps) {
  const prelude = getPartPrelude(partNumber);
  if (!prelude) return null;
  const texts = prelude.pieces.filter((p) => p.kind === "text").length;
  const photos = prelude.pieces.length - texts;
  // Posición de cada pieza dentro de su tipo, para que el lector de pantalla las distinga
  const order = prelude.pieces.map((p, i) => prelude.pieces.slice(0, i + 1).filter((q) => q.kind === p.kind).length);

  return (
    <div className={styles.prelude}>
      <HorizontalScroll label={`Antesala de la Parte ${partNumber}`}>
        {showTitle && (
          <section className={`${styles.panel} ${styles.title}`} aria-label="Título de la parte">
            <h2 className={styles.heading}>
              {prelude.label}
              <br />
              <StarWord text={prelude.name} />
            </h2>
            <p className={styles.hint} aria-hidden="true">
              DESLIZA →
            </p>
          </section>
        )}

        {prelude.pieces.map((piece, i) =>
          piece.kind === "text" ? (
            <section key={i} className={`${styles.panel} ${styles.fragment}`} aria-label={`Fragmento ${order[i]} de ${texts}`}>
              <p className={styles.poem}>{piece.text}</p>
            </section>
          ) : (
            <section key={i} className={`${styles.panel} ${styles.photo}`} aria-label={`Fotografía ${order[i]} de ${photos}`}>
              <Polaroid src={piece.src} alt={piece.alt} rotate={piece.rotate} />
            </section>
          ),
        )}

        <section className={`${styles.panel} ${styles.start}`} aria-label="Empezar a leer">
          <a href={startHref} className={styles.btn}>
            Empezar a leer
          </a>
        </section>
      </HorizontalScroll>
    </div>
  );
}
