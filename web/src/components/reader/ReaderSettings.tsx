"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./Reader.module.css";

export const FONT_STEPS = [16, 18, 20, 22, 24];
export const LINE_STEPS = [1.5, 1.7, 1.9];
const LINE_LABELS = ["Compacto", "Normal", "Amplio"];

export type ReadMode = "continuous" | "pages";

interface ReaderSettingsProps {
  mode: ReadMode;
  fontSize: number;
  lineHeight: number;
  chapters: { index: number; title: string }[];
  onChapter: (index: number) => void;
  /** Reabre la guía de primera visita */
  onGuide: () => void;
  onChange: (patch: { readingMode?: "vertical" | "horizontal"; fontSize?: number; lineHeight?: number }) => void;
}

/** Botón "Aa" y panel pequeño con modo, tamaño de letra e interlineado */
export function ReaderSettings({ mode, fontSize, lineHeight, chapters, onChapter, onGuide, onChange }: ReaderSettingsProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.barBtn}
        data-tutorial="settings"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Configuración de lectura"
        onClick={() => setOpen((v) => !v)}
      >
        Aa
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Configuración de lectura"
          tabIndex={-1}
          className={styles.settings}
        >
          <p className={styles.settingsLabel} id={`${panelId}-modo`}>
            Modo
          </p>
          <div className={styles.settingsRow} role="group" aria-labelledby={`${panelId}-modo`}>
            <button
              type="button"
              className={styles.choice}
              aria-pressed={mode === "continuous"}
              onClick={() => onChange({ readingMode: "vertical" })}
            >
              Continuo
            </button>
            <button
              type="button"
              className={styles.choice}
              aria-pressed={mode === "pages"}
              onClick={() => onChange({ readingMode: "horizontal" })}
            >
              Páginas
            </button>
          </div>

          <p className={styles.settingsLabel} id={`${panelId}-letra`}>
            Tamaño de letra
          </p>
          <div className={styles.settingsRow} role="group" aria-labelledby={`${panelId}-letra`}>
            {FONT_STEPS.map((size, i) => (
              <button
                key={size}
                type="button"
                className={styles.choice}
                aria-pressed={fontSize === size}
                aria-label={`${size} píxeles`}
                onClick={() => onChange({ fontSize: size })}
              >
                <span style={{ fontSize: 12 + i * 2 }} aria-hidden="true">
                  A
                </span>
              </button>
            ))}
          </div>

          <p className={styles.settingsLabel} id={`${panelId}-interlineado`}>
            Interlineado
          </p>
          <div className={styles.settingsRow} role="group" aria-labelledby={`${panelId}-interlineado`}>
            {LINE_STEPS.map((value, i) => (
              <button
                key={value}
                type="button"
                className={styles.choice}
                aria-pressed={lineHeight === value}
                onClick={() => onChange({ lineHeight: value })}
              >
                {LINE_LABELS[i]}
              </button>
            ))}
          </div>

          <p className={styles.settingsLabel} id={`${panelId}-capitulos`}>
            Capítulos
          </p>
          <ol className={styles.settingsChapters} aria-labelledby={`${panelId}-capitulos`}>
            {chapters.map((c) => (
              <li key={c.index}>
                <button
                  type="button"
                  className={styles.chapterLink}
                  onClick={() => {
                    onChapter(c.index);
                    setOpen(false);
                  }}
                >
                  {c.index + 1}. {c.title.toLocaleLowerCase("es")}
                </button>
              </li>
            ))}
          </ol>

          <button
            type="button"
            className={styles.guideLink}
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
              onGuide();
            }}
          >
            Ver la guía otra vez
          </button>
        </div>
      )}
    </>
  );
}
