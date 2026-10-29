"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./Toast.module.css";

type ToastKind = "ok" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastApi {
  /** Aviso breve de éxito, p. ej. "Guardado". */
  success: (text?: string) => void;
  /** Aviso de error; dura más para poder leerlo. */
  error: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-3), { id, kind, text }]);
    const timer = window.setTimeout(
      () => setItems((list) => list.filter((t) => t.id !== id)),
      kind === "ok" ? 2800 : 7000,
    );
    timers.current.push(timer);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (text = "Guardado") => push("ok", text),
      error: (text) => push("error", text),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.stack} role="status" aria-live="polite">
        {items.map((t) => (
          <p key={t.id} className={`${styles.toast} ${t.kind === "error" ? styles.error : ""}`}>
            {t.text}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("Falta <ToastProvider> arriba de este componente.");
  return ctx;
}
