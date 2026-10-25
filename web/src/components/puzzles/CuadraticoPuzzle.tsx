"use client";

import { useMemo, useState } from "react";
import styles from "./CuadraticoPuzzle.module.css";

type Clue = { x: number; y: number; char: string };

function nearlyEqual(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

interface CuadraticoPuzzleProps {
  hiddenText?: string;
  lengthLimit?: number;
}

export function CuadraticoPuzzle({
  hiddenText = "supernobaconb.web.app/0618am/030806",
  lengthLimit = 120,
}: CuadraticoPuzzleProps) {
  // Convertir mensaje a códigos (UTF-16)
  const text = hiddenText.slice(0, lengthLimit);
  const charCodes = useMemo(
    () => Array.from(text).map((ch) => ch.charCodeAt(0)),
    [text],
  );

  // Coeficientes secretos, fijos mientras la página esté montada
  const [secret] = useState(() => {
    const min = -20;
    const max = 100;
    const randInt = (lo: number, hi: number) =>
      Math.floor(Math.random() * (hi - lo + 1)) + lo;
    return { a: randInt(min, max), b: randInt(min, max), c: randInt(min, max) };
  });

  // Secuencia codificada: y(x) = charCode + p(x)
  const encoded = useMemo(
    () =>
      charCodes.map((code, i) => {
        const x = i + 1;
        return secret.a * x * x + secret.b * x + secret.c + code;
      }),
    [charCodes, secret],
  );

  // 3 pistas con posiciones bien separadas (evita matrices singulares)
  const clues: Clue[] = useMemo(() => {
    const xs = [
      1,
      Math.max(2, Math.floor(charCodes.length / 2)),
      Math.max(3, charCodes.length),
    ];
    return xs.map((x) => ({ x, y: encoded[x - 1], char: text[x - 1] || " " }));
  }, [encoded, charCodes.length, text]);

  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [inputC, setInputC] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const tryUnlock = () => {
    setFeedback(null);
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    const c = parseFloat(inputC);
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) {
      setFeedback("Introduce números válidos para a, b y c.");
      return;
    }

    // Las 3 pistas deben cumplir a*x^2 + b*x + c ≈ y - charCode
    const ok = clues.every((clue) => {
      const expected = clue.y - clue.char.charCodeAt(0);
      const got = a * clue.x * clue.x + b * clue.x + c;
      return nearlyEqual(expected, got, 1e-3);
    });

    if (!ok) {
      setFeedback("No coincide. Sigue intentando (pista: usa las 3 parejas dadas).");
      return;
    }

    const decoded = encoded
      .map((y, idx) => {
        const x = idx + 1;
        const poly = a * x * x + b * x + c;
        return String.fromCharCode(Math.round(y - poly));
      })
      .join("");

    setMessage(decoded);
    setUnlocked(true);
    setFeedback("¡Correcto! Preview desbloqueado.");
  };

  return (
    <section className={styles.puzzle} aria-labelledby="cuadratico-titulo">
      <h1 id="cuadratico-titulo" className={styles.title}>
        supernoba.org
      </h1>

      <div className={styles.panel}>
        <div className={styles.left}>
          <p className={styles.instruction}>
            Se ha codificado un mensaje aplicando a cada carácter un polinomio cuadrático.
            Tienes la secuencia de valores codificados (y). Además se revelan{" "}
            <b>3 caracteres pistas</b> con su posición en el preview(x), el valor
            codificado (y) y el carácter real en esa posición. Encuentra los valores a,
            b y c del polinomio. Consejo: Recuerda la tabla ASCII.
          </p>

          <div className={styles.block}>
            <h2 className={styles.subtitle}>Pistas</h2>
            {clues.map((c) => (
              <div key={c.x} className={styles.clue}>
                <span>x = {c.x}</span>
                <span>y = {c.y}</span>
                <span>char = &quot;{c.char}&quot;</span>
              </div>
            ))}
          </div>

          <div className={styles.block}>
            <h2 className={styles.subtitle}>Secuencia codificada (y)</h2>
            <ul className={styles.encodedList}>
              {encoded.map((y, i) => (
                <li key={i} className={styles.encodedItem}>
                  <small>x={i + 1}</small>
                  <span className={styles.num}>{y}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form
          className={styles.right}
          onSubmit={(e) => {
            e.preventDefault();
            tryUnlock();
          }}
        >
          <h2 className={styles.subtitle}>Introduce coeficientes</h2>
          <label className={styles.label}>
            a
            <input
              className={styles.input}
              inputMode="decimal"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              placeholder="ej. 3"
            />
          </label>
          <label className={styles.label}>
            b
            <input
              className={styles.input}
              inputMode="decimal"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              placeholder="ej. -5"
            />
          </label>
          <label className={styles.label}>
            c
            <input
              className={styles.input}
              inputMode="decimal"
              value={inputC}
              onChange={(e) => setInputC(e.target.value)}
              placeholder="ej. 12"
            />
          </label>

          <button type="submit" className={styles.button}>
            Probar
          </button>

          <p className={styles.feedback} role="status">
            {feedback}
          </p>

          <div className={styles.preview}>
            <h2 className={styles.subtitle}>Preview</h2>
            {unlocked ? (
              <p className={styles.content}>{message}</p>
            ) : (
              <p className={styles.cover}>
                Contenido bloqueado. Resuelve para ver el mensaje.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
