"use client";

import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import Image from "next/image";
import styles from "./Lightbox.module.css";

export interface LightboxImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  /** Posición de la imagen abierta; `null` con el visor cerrado */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  /** Muestra las imágenes en blanco y negro */
  monochrome?: boolean;
}

/** Distancias mínimas del gesto táctil: más corto que esto se ignora */
const SWIPE_X = 50;
const SWIPE_Y = 80;
/** Un clic que viene de un arrastre mayor a esto no cierra el visor */
const CLICK_SLOP = 10;

/** Visor de imágenes en un `<dialog>` modal: Escape, flechas, gesto táctil y foco devuelto */
export function Lightbox({ images, index, onClose, onIndexChange, monochrome }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const press = useRef<{ x: number; y: number; onBackground: boolean; moved: boolean } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = index !== null && index >= 0 && index < images.length;
  const count = images.length;

  // Abre o cierra el diálogo nativo; al cerrar, el navegador devuelve el foco a quien lo abrió
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    }
    if (!open && dialog.open) {
      opener.current = null;
      dialog.close();
    }
  }, [open]);

  // Si se desmonta abierto, el foco vuelve a quien lo abrió
  useEffect(() => {
    return () => {
      const target = opener.current;
      if (target?.isConnected) target.focus();
    };
  }, []);

  // Bloquea el scroll del fondo mientras esté abierto
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const go = useCallback(
    (step: number) => {
      if (index === null || count < 2) return;
      onIndexChange((index + step + count) % count);
    },
    [index, count, onIndexChange],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    press.current = {
      x: event.clientX,
      y: event.clientY,
      onBackground: event.target === event.currentTarget,
      moved: false,
    };
    if (event.pointerType === "mouse") return;
    start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (press.current) {
      const moved = Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y);
      press.current.moved = moved > CLICK_SLOP;
    }
    const origin = start.current;
    start.current = null;
    if (!origin || origin.id !== event.pointerId) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.abs(dx) >= SWIPE_X && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    } else if (dy >= SWIPE_Y && dy > Math.abs(dx)) {
      onClose();
    }
  }

  // Cierra con un clic en el fondo, pero no si empezó sobre la imagen o fue un arrastre
  function handleBackgroundClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const origin = press.current;
    press.current = null;
    if (origin?.onBackground && !origin.moved) onClose();
  }

  const image = open ? images[index] : null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Visor de imágenes"
      onCancel={(event) => {
        // Escape: deja que el estado del padre cierre el diálogo
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        // Cierre nativo que no vino del estado del padre
        if (open) onClose();
      }}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {image && (
        <div className={styles.layout}>
          <div className={styles.top}>
            <p className={styles.counter} aria-live="polite">
              {count > 1 ? `${(index ?? 0) + 1} / ${count}` : ""}
            </p>
            <button type="button" className={styles.control} onClick={onClose}>
              Cerrar
            </button>
          </div>

          <div
            className={styles.stage}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              start.current = null;
            }}
            onClick={handleBackgroundClick}
          >
            <Image
              key={image.src}
              className={`${styles.image} ${monochrome ? styles.mono : ""}`}
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              sizes="90vw"
              loading="eager"
              draggable={false}
            />
          </div>

          <div className={styles.bottom}>
            {count > 1 && (
              <button type="button" className={styles.control} onClick={() => go(-1)}>
                Anterior
              </button>
            )}
            {image.caption ? (
              <p className={styles.caption}>{image.caption}</p>
            ) : (
              // El alt ya lo lee la imagen; el pie visible no se repite al lector de pantalla
              <p className={styles.caption} aria-hidden="true">
                {image.alt}
              </p>
            )}
            {count > 1 && (
              <button type="button" className={styles.control} onClick={() => go(1)}>
                Siguiente
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
