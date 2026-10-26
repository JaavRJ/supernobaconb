import type { ElementType } from "react";
import styles from "./StarWord.module.css";

interface StarWordProps {
  text: string;
  /** Índice de la "O" que se reemplaza; por defecto la de SUPERNOBA o la de BRILLO */
  starAt?: number;
  as?: "span" | "h1" | "h2";
  className?: string;
}

const BOOK_TITLE = "BRILLO DE UNA ESTRELLA MUERTA";

/**
 * La estrella es la firma de solo dos nombres (decisión del artista): SUPERN✦BA y BRILL✦ DE UNA ESTRELLA MUERTA.
 * En cualquier otro texto no hay estrella.
 */
function defaultStarIndex(text: string): number {
  const upper = text.toLocaleUpperCase("es");
  const name = upper.indexOf("SUPERNOBA");
  if (name >= 0) return name + "SUPERN".length;
  if (upper.startsWith(BOOK_TITLE)) return "BRILL".length;
  return -1;
}

/**
 * Escribe un texto con la estrella-brújula en lugar de una "O" (solo en SUPERNOBA y en el título de BDUEM).
 * El lector de pantalla lee la palabra completa; la parte visual va oculta.
 */
export function StarWord({ text, starAt, as: Tag = "span", className }: StarWordProps) {
  const index = starAt ?? defaultStarIndex(text);
  const classes = className ? `${styles.word} ${className}` : styles.word;
  const Root: ElementType = Tag;

  if (index < 0 || index >= text.length) {
    return <Root className={classes}>{text}</Root>;
  }

  const before = text.slice(0, index);
  const after = text.slice(index + 1);
  // La palabra que contiene la estrella no se parte; el resto del texto sí puede saltar de línea
  const lead = before.match(/\S*$/)?.[0] ?? "";
  const tail = after.match(/^\S*/)?.[0] ?? "";

  return (
    <Root className={classes}>
      <span className={styles.sr}>{text}</span>
      <span aria-hidden="true">
        {before.slice(0, before.length - lead.length)}
        <span className={styles.nowrap}>
          {lead}
          <span className={styles.star} />
          {tail}
        </span>
        {after.slice(tail.length)}
      </span>
    </Root>
  );
}
