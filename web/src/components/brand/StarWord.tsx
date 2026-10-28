import type { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./StarWord.module.css";

interface StarWordProps {
  text: string;
  /** Índice de la "O" que se reemplaza; por defecto la de SUPERNOBA o la de BRILLO */
  starAt?: number;
  as?: "span" | "h1" | "h2";
  className?: string;
  /** Cada carácter visible va en su propia letra (con --i, --dx, --dy) para animarlas una a una */
  letters?: boolean;
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

/** Desvío pseudoaleatorio pero determinista (sin Math.random: igual en servidor y cliente), en em */
function scatter(i: number, salt: number): string {
  const n = (i * 7919 + salt * 104729) % 17;
  return `${((n - 8) * 0.45).toFixed(2)}em`;
}

function letterStyle(i: number): CSSProperties {
  return { "--i": i, "--dx": scatter(i, 1), "--dy": scatter(i, 2) } as CSSProperties;
}

/** Un carácter por letra; los espacios quedan como texto para que la línea siga pudiendo partirse */
function renderLetters(chunk: string, offset: number): ReactNode[] {
  return Array.from(chunk).map((char, k) =>
    char === " " ? (
      " "
    ) : (
      <span key={offset + k} className={styles.letter} style={letterStyle(offset + k)}>
        <span className={styles.glyph}>{char}</span>
      </span>
    ),
  );
}

/**
 * Escribe un texto con la estrella-brújula en lugar de una "O" (solo en SUPERNOBA y en el título de BDUEM).
 * El lector de pantalla lee la palabra completa; la parte visual va oculta.
 */
export function StarWord({ text, starAt, as: Tag = "span", className, letters }: StarWordProps) {
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

  if (letters) {
    return (
      <Root className={classes}>
        <span className={styles.sr}>{text}</span>
        <span aria-hidden="true">
          {renderLetters(before.slice(0, before.length - lead.length), 0)}
          <span className={styles.nowrap}>
            {renderLetters(lead, before.length - lead.length)}
            <span className={`${styles.letter} ${styles.starLetter}`} style={letterStyle(index)}>
              <span className={styles.glyph}>
                <span className={styles.star} />
              </span>
            </span>
            {renderLetters(tail, index + 1)}
          </span>
          {renderLetters(after.slice(tail.length), index + 1 + tail.length)}
        </span>
      </Root>
    );
  }

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
