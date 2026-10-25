"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import styles from "./ConstellationPuzzle.module.css";

interface Star {
  id: number;
  x: number;
  y: number;
  done: boolean;
}

// Espacio lógico del tablero: las coordenadas se escalan al ancho real
const BOARD_W = 1100;
const BOARD_H = 480;
const TOLERANCE = 40;
const KEY_STEP = 12;

const INITIAL: Star[] = [
  { id: 1, x: 100, y: 100, done: false },
  { id: 2, x: 300, y: 200, done: false },
  { id: 3, x: 150, y: 350, done: false },
  { id: 4, x: 500, y: 100, done: false },
  { id: 5, x: 380, y: 350, done: false },
];

// Constelación correcta
const TARGETS = [
  { id: 1, x: 800, y: 150 },
  { id: 2, x: 900, y: 220 },
  { id: 3, x: 820, y: 350 },
  { id: 4, x: 1000, y: 170 },
  { id: 5, x: 940, y: 330 },
];

const clamp = (v: number, max: number) => Math.min(max, Math.max(0, v));
const pct = (v: number, total: number) => `${(v / total) * 100}%`;

interface DragState {
  id: number;
  px: number;
  py: number;
  x: number;
  y: number;
}

export function ConstellationPuzzle() {
  const [stars, setStars] = useState<Star[]>(INITIAL);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  const completed = stars.filter((s) => s.done).length;

  // Mueve la estrella y, si queda cerca de su objetivo, la fija en él
  const place = (id: number, x: number, y: number, settle: boolean) => {
    const nx = clamp(x, BOARD_W);
    const ny = clamp(y, BOARD_H);
    setStars((prev) =>
      prev.map((s) => {
        if (s.id !== id || s.done) return s;
        const t = TARGETS[id - 1];
        if (settle && Math.hypot(nx - t.x, ny - t.y) < TOLERANCE) {
          return { ...s, x: t.x, y: t.y, done: true };
        }
        return { ...s, x: nx, y: ny };
      }),
    );
  };

  // Posición lógica de la estrella según el movimiento del puntero
  const dragged = (d: DragState, e: PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current;
    if (!board) return null;
    const scale = board.getBoundingClientRect().width / BOARD_W;
    return {
      x: d.x + (e.clientX - d.px) / scale,
      y: d.y + (e.clientY - d.py) / scale,
    };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>, s: Star) => {
    // Un segundo dedo no reemplaza el arrastre en curso
    if (s.done || drag.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: s.id, px: e.clientX, py: e.clientY, x: s.x, y: s.y };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = dragged(d, e);
    if (p) place(d.id, p.x, p.y, false);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const p = dragged(d, e);
    if (p) place(d.id, p.x, p.y, true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, s: Star) => {
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m || s.done) return;
    e.preventDefault();
    place(s.id, s.x + m[0], s.y + m[1], true);
  };

  const finished = completed === stars.length;

  return (
    <section className={styles.wrap} aria-labelledby="constelacion-titulo">
      <h1 id="constelacion-titulo" className={styles.title}>
        ✦ Arma la constelación ({completed}/{stars.length})
      </h1>
      <p className={styles.hint}>
        Arrastra cada estrella hasta su punto tenue. Con teclado: enfoca una estrella y
        usa las flechas (con Mayús, pasos más grandes).
      </p>

      <div
        ref={boardRef}
        className={styles.board}
        style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}
      >
        {TARGETS.map((t) => (
          <span
            key={t.id}
            className={styles.target}
            style={{ left: pct(t.x, BOARD_W), top: pct(t.y, BOARD_H) }}
            aria-hidden="true"
          />
        ))}

        {stars.map((s) => (
          <div
            key={s.id}
            className={`${styles.star} ${s.done ? styles.done : ""}`}
            style={{ left: pct(s.x, BOARD_W), top: pct(s.y, BOARD_H) }}
            role="button"
            tabIndex={s.done ? -1 : 0}
            aria-label={
              s.done
                ? `Estrella ${s.id}, en su lugar`
                : `Estrella ${s.id}, mover con las flechas del teclado`
            }
            aria-disabled={s.done}
            onPointerDown={(e) => onPointerDown(e, s)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              // Al cancelarse, las coordenadas no son confiables: solo se suelta
              drag.current = null;
            }}
            onKeyDown={(e) => onKeyDown(e, s)}
          />
        ))}
      </div>

      <div role="status" className={styles.final}>
        {finished && (
          <>
            ✦ CONSTELACIÓN COMPLETA ✦
            <span>Has desbloqueado un fragmento oculto</span>
          </>
        )}
      </div>
    </section>
  );
}
