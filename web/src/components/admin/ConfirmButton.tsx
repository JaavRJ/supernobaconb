"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./Button";
import styles from "./ConfirmButton.module.css";

interface ConfirmButtonProps {
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
  /** Pregunta que se muestra al pedir confirmación. */
  question?: string;
  small?: boolean;
  disabled?: boolean;
}

/** Botón de borrar que pide confirmar antes de actuar (se desarma solo a los 6 s). */
export function ConfirmButton({
  onConfirm,
  children = "Borrar",
  question = "¿Borrar de forma definitiva?",
  small,
  disabled,
}: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!asking) return;
    const timer = window.setTimeout(() => setAsking(false), 6000);
    return () => window.clearTimeout(timer);
  }, [asking]);

  if (!asking) {
    return (
      <Button variant="danger" small={small} disabled={disabled} onClick={() => setAsking(true)}>
        {children}
      </Button>
    );
  }

  return (
    <span className={styles.ask} role="group" aria-label={question}>
      <span className={styles.question}>{question}</span>
      <Button
        variant="danger"
        small={small}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onConfirm();
          } finally {
            setBusy(false);
            setAsking(false);
          }
        }}
      >
        {busy ? "Borrando…" : "Sí, borrar"}
      </Button>
      <Button variant="quiet" small={small} disabled={busy} onClick={() => setAsking(false)}>
        Cancelar
      </Button>
    </span>
  );
}
