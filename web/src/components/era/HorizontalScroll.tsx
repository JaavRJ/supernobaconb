"use client";

import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import styles from "./HorizontalScroll.module.css";

/** Recorrido horizontal solo en escritorio y sin preferencia de menos movimiento */
const HORIZONTAL_QUERY = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";
/** Cuánto avanzan las flechas, como fracción del ancho visible */
const KEY_STEP = 0.6;
/** Margen para considerar que se llegó al extremo (subpíxeles) */
const EDGE = 2;
/** Píxeles que debe moverse el mouse para que cuente como arrastre */
const DRAG_THRESHOLD = 5;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(HORIZONTAL_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

interface HorizontalScrollProps {
  /** Nombre accesible del recorrido */
  label: string;
  children: ReactNode;
}

/**
 * Contenedor que en escritorio convierte la rueda vertical en avance horizontal.
 * El desplazamiento es el nativo (`overflow-x`), así que teclado, trackpad y barra funcionan solos.
 * En los extremos deja pasar la rueda para que la página siga con su scroll vertical.
 * En celular o con menos movimiento es un flujo vertical normal.
 */
export function HorizontalScroll({ label, children }: HorizontalScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const horizontal = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(HORIZONTAL_QUERY).matches,
    () => false,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !horizontal) return;

    function onWheel(e: WheelEvent) {
      if (!el || e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= EDGE;
      const atEnd = el.scrollLeft >= max - EDGE;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd) || max <= 0) return;
      e.preventDefault();
      // Firefox puede reportar líneas (1) o páginas (2) en lugar de píxeles
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1;
      el.scrollLeft += e.deltaY * unit;
    }

    // No pasivo: hay que poder cancelar el scroll vertical mientras el recorrido avanza
    el.addEventListener("wheel", onWheel, { passive: false });

    // Arrastre con el mouse; el touch y el trackpad ya desplazan de forma nativa
    let startX = 0;
    let startLeft = 0;
    let pressed = false;
    let dragging = false;
    function onDown(e: PointerEvent) {
      if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
      if ((e.target as HTMLElement).closest("a, button, input, textarea")) return;
      pressed = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    }
    function onMove(e: PointerEvent) {
      if (!el || !pressed) return;
      const dx = e.clientX - startX;
      // Hasta superar el umbral es un clic o una selección de texto, no un arrastre
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "true";
      }
      el.scrollLeft = startLeft - dx;
    }
    function onUp() {
      pressed = false;
      dragging = false;
      if (el) delete el.dataset.dragging;
    }
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [horizontal]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Solo si el foco está en el propio recorrido; en un enlace o botón las flechas no se tocan
    if (!horizontal || e.target !== e.currentTarget) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    e.currentTarget.scrollBy({ left: dir * e.currentTarget.clientWidth * KEY_STEP, behavior: "smooth" });
  }

  return (
    <div
      ref={ref}
      className={styles.scroller}
      // Región con nombre y foco solo cuando de verdad se desplaza en horizontal
      {...(horizontal ? { role: "region", "aria-label": label, tabIndex: 0 } : {})}
      onKeyDown={onKeyDown}
    >
      <div className={styles.track}>{children}</div>
    </div>
  );
}
