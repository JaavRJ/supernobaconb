import type { ElementType } from "react";
import styles from "./StarWord.module.css";

interface StarWordProps {
  text: string;
  /** Índice de la "O" que se reemplaza; por defecto la primera O del texto */
  starAt?: number;
  as?: "span" | "h1" | "h2";
  className?: string;
}

/**
 * Escribe un texto con la estrella-brújula en lugar de una "O".
 * El lector de pantalla lee la palabra completa; la parte visual va oculta.
 */
export function StarWord({ text, starAt, as: Tag = "span", className }: StarWordProps) {
  const index = starAt ?? text.search(/[oO]/);
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
