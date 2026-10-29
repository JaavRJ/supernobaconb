"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ReaderTutorial.module.css";
import readerStyles from "./Reader.module.css";

interface Step {
  text: string;
  /** Valor de `data-tutorial` del control que se señala; sin él, la tarjeta va abajo */
  target?: "bookmark" | "settings" | "download";
}

const STEPS: Step[] = [
  { text: "Selecciona cualquier frase para resaltarla, guardarla como cita o copiarla." },
  { text: "Con «Compartir» conviertes una frase en una imagen para tus historias." },
  { text: "El marcador guarda el punto exacto donde vas.", target: "bookmark" },
  {
    text: "En «Aa» cambias entre páginas y lectura continua, el tamaño de letra y el interlineado.",
    target: "settings",
  },
  { text: "Descarga cada parte en PDF con la flecha.", target: "download" },
];

const CARD_WIDTH = 340;
const MARGIN = 12;

interface Placement {
  target: Step["target"];
  card: { top: number; left: number } | null;
  ring: { top: number; left: number; width: number; height: number } | null;
}

/** Calcula dónde van la tarjeta (debajo del control, sin taparlo) y el anillo */
function place(target: Step["target"]): Placement {
  const el = target ? document.querySelector<HTMLElement>(`[data-tutorial="${target}"]`) : null;
  if (!el) return { target, card: null, ring: null };
  const r = el.getBoundingClientRect();
  const width = Math.min(CARD_WIDTH, window.innerWidth - MARGIN * 2);
  const left = Math.min(Math.max(MARGIN, r.left + r.width / 2 - width / 2), window.innerWidth - width - MARGIN);
  return {
    target,
    card: { top: r.bottom + 14, left },
    ring: { top: r.top + 2, left: r.left + 2, width: r.width - 4, height: r.height - 4 },
  };
}

interface ReaderTutorialProps {
  /** Se llama al saltar o terminar la guía */
  onClose: () => void;
}

/** Guía de primera visita: tarjeta flotante no modal de 5 pasos que señala los controles de la barra */
export function ReaderTutorial({ onClose }: ReaderTutorialProps) {
  const [step, setStep] = useState(0);
  const [placement, setPlacement] = useState<Placement>({ target: undefined, card: null, ring: null });
  const nextRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  useEffect(() => {
    closeRef.current = onClose;
  });

  // Foco al abrir y, al cerrar, de vuelta a donde estaba
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    nextRef.current?.focus();
    return () => {
      if (previous && previous !== document.body && previous.isConnected) previous.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // La posición sigue al control si cambia el tamaño de la ventana o el scroll
  useEffect(() => {
    const measure = () => setPlacement(place(current.target));
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [current.target]);

  // Mientras se mide el control del paso nuevo no se usa la posición del anterior
  const fresh = placement.target === current.target ? placement : null;
  const anchored = fresh?.card ?? null;
  const cardStyle = anchored ? { top: anchored.top, left: anchored.left } : undefined;

  return (
    <>
      {fresh?.ring && (
        <span
          className={styles.ring}
          aria-hidden="true"
          style={{
            top: fresh.ring.top,
            left: fresh.ring.left,
            width: fresh.ring.width,
            height: fresh.ring.height,
          }}
        />
      )}
      <div
        role="dialog"
        aria-labelledby={titleId}
        className={`${styles.card} ${anchored ? "" : styles.floating}`}
        style={cardStyle}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            Cómo leer aquí
          </h2>
          <p className={styles.count} aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
            {step + 1} / {STEPS.length}
          </p>
        </div>
        <p className={styles.text} aria-live="polite">
          {current.text}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.skip} onClick={onClose}>
            Saltar
          </button>
          <span className={styles.spacer} />
          {step > 0 && (
            <button type="button" className={readerStyles.btnGhost} onClick={() => setStep(step - 1)}>
              Anterior
            </button>
          )}
          <button
            ref={nextRef}
            type="button"
            className={readerStyles.btn}
            onClick={() => (last ? onClose() : setStep(step + 1))}
          >
            {last ? "Empezar a leer" : "Siguiente"}
          </button>
        </div>
      </div>
    </>
  );
}
