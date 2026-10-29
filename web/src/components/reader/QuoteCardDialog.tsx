"use client";

import { useEffect, useRef, useState } from "react";
import { QUOTE_CARD_VARIANTS, renderQuoteCard, type QuoteCardVariant } from "@/lib/reader/quoteCard";
import styles from "./QuoteCardDialog.module.css";

export interface QuoteCardTarget {
  text: string;
  partNumber: number;
  partTitle: string;
}

interface QuoteCardDialogProps extends QuoteCardTarget {
  onClose: () => void;
}

interface Rendered {
  key: string;
  url?: string;
  blob?: Blob;
  canShare?: boolean;
  failed?: boolean;
}

const SHARE_TITLE = "Brillo de una Estrella Muerta";
const FILE_NAME = "cita-bduem.png";

/** Vista previa modal de la tarjeta de cita: elegir variante, compartir como archivo o descargar */
export function QuoteCardDialog({ text, partNumber, partTitle, onClose }: QuoteCardDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [variant, setVariant] = useState<QuoteCardVariant>("noche");
  const [rendered, setRendered] = useState<Rendered | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  const key = `${variant}|${text}|${partNumber}|${partTitle}`;

  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    renderQuoteCard({ text, partNumber, partTitle, variant })
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        const file = new File([blob], FILE_NAME, { type: "image/png" });
        const canShare = typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
        setRendered({ key, url, blob, canShare });
      })
      .catch(() => {
        if (!cancelled) setRendered({ key, failed: true });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [key, text, partNumber, partTitle, variant]);

  const ready = rendered && rendered.key === key ? rendered : null;

  const share = async () => {
    if (!ready?.blob) return;
    try {
      await navigator.share({
        title: SHARE_TITLE,
        files: [new File([ready.blob], FILE_NAME, { type: "image/png" })],
      });
    } catch {
      // Compartir cancelado por la persona lectora
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Tarjeta de la cita"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.stage}>
        {ready?.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagen generada en el navegador (blob)
          <img className={styles.preview} src={ready.url} alt={`Tarjeta con la cita: ${text}`} width={1080} height={1920} />
        ) : (
          <p className={styles.placeholder} role="status">
            {ready?.failed ? "No se pudo preparar la imagen" : "Preparando la tarjeta…"}
          </p>
        )}
      </div>

      <div className={styles.variants} role="group" aria-label="Variante de la tarjeta">
        {QUOTE_CARD_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={styles.variant}
            aria-pressed={variant === v.id}
            onClick={() => setVariant(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        {ready?.canShare && (
          <button type="button" className={styles.action} onClick={() => void share()}>
            Compartir
          </button>
        )}
        {ready?.url && (
          <a className={styles.action} href={ready.url} download={FILE_NAME}>
            Descargar
          </a>
        )}
        <button type="button" className={styles.close} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </dialog>
  );
}
