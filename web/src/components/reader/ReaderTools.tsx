"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SignInButton } from "@/components/auth/SignInButton";
import { useAuth, useBookmarks, useQuotes, type Bookmark, type Quote } from "@/lib/reader";
import { useHydrated } from "./useHydrated";
import { copyToClipboard, quoteWithSource } from "./clipboard";
import styles from "./Reader.module.css";

/** Un marcador cuenta como "aquí" si está a menos de este avance del capítulo */
const NEAR = 0.04;

interface ReaderToolsProps {
  partNumber: number;
  chapters: { index: number; title: string }[];
  /** Punto de lectura actual */
  where: { chapter: number; progress: number };
  pageNumber: number;
  onGoBookmark: (bookmark: Bookmark) => void;
  onGoQuote: (quote: Quote) => void;
}

/** Botones finos de la barra: marcador del punto actual y panel "Mis citas y marcadores" */
export function ReaderTools({ partNumber, chapters, where, pageNumber, onGoBookmark, onGoQuote }: ReaderToolsProps) {
  const { bookmarks, save: saveBookmark, remove: removeBookmark } = useBookmarks(partNumber);
  const { quotes, remove: removeQuote } = useQuotes(partNumber);
  const { user, configured, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const nearby = bookmarks.filter(
    (b) => b.chapterIndex === where.chapter && Math.abs((b.progress ?? 0) - where.progress) < NEAR,
  );
  const hydrated = useHydrated();
  const marked = hydrated && nearby.length > 0;

  const toggleBookmark = () => {
    if (marked) {
      nearby.forEach((b) => void removeBookmark(b.id));
      return;
    }
    void saveBookmark({
      partNumber,
      chapterIndex: where.chapter,
      pageNumber,
      progress: where.progress,
    });
  };

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

  const chapterName = (index: number | undefined) => {
    const c = chapters.find((x) => x.index === (index ?? 0));
    return c ? `${c.index + 1}. ${c.title.toLocaleLowerCase("es")}` : "";
  };

  const copyQuote = async (q: Quote) => {
    if (await copyToClipboard(quoteWithSource(q.text, q.partNumber))) {
      setCopied(q.id);
      setTimeout(() => setCopied((c) => (c === q.id ? null : c)), 1400);
    }
  };

  const go = (action: () => void) => {
    setOpen(false);
    action();
  };

  const sortedBookmarks = [...bookmarks].sort(
    (a, b) => a.chapterIndex - b.chapterIndex || (a.progress ?? 0) - (b.progress ?? 0),
  );
  const sortedQuotes = [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <button
        type="button"
        className={styles.barBtn}
        aria-pressed={marked}
        aria-label={marked ? "Quitar el marcador de este punto" : "Poner un marcador en este punto"}
        title={marked ? "Quitar marcador" : "Poner marcador"}
        onClick={toggleBookmark}
      >
        <svg viewBox="0 0 16 20" width="14" height="18" aria-hidden="true" className={styles.barIcon}>
          <path
            d="M2.5 1.5h11v17L8 14.2 2.5 18.5z"
            fill={marked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        ref={buttonRef}
        type="button"
        className={styles.barBtn}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Mis citas y marcadores"
        title="Mis citas y marcadores"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 20 16" width="18" height="14" aria-hidden="true" className={styles.barIcon}>
          <path d="M1 2h18M1 8h18M1 14h11" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Mis citas y marcadores"
          tabIndex={-1}
          className={`${styles.settings} ${styles.library}`}
        >
          <section aria-labelledby={`${panelId}-marcadores`}>
            <h3 className={styles.libraryTitle} id={`${panelId}-marcadores`}>
              Marcadores
            </h3>
            {sortedBookmarks.length === 0 ? (
              <p className={styles.libraryEmpty}>Aún no tienes marcadores en esta parte.</p>
            ) : (
              <ul className={styles.libraryList} role="list">
                {sortedBookmarks.map((b) => (
                  <li key={b.id} className={styles.libraryItem}>
                    <button type="button" className={styles.libraryGo} onClick={() => go(() => onGoBookmark(b))}>
                      <span>{chapterName(b.chapterIndex)}</span>
                      <small>{Math.round((b.progress ?? 0) * 100)} % del capítulo</small>
                    </button>
                    <button
                      type="button"
                      className={styles.libraryAct}
                      aria-label={`Borrar el marcador de ${chapterName(b.chapterIndex)}`}
                      onClick={() => void removeBookmark(b.id)}
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby={`${panelId}-citas`}>
            <h3 className={styles.libraryTitle} id={`${panelId}-citas`}>
              Citas
            </h3>
            {sortedQuotes.length === 0 ? (
              <p className={styles.libraryEmpty}>Selecciona un texto y elige “Guardar cita”.</p>
            ) : (
              <ul className={styles.libraryList} role="list">
                {sortedQuotes.map((q) => (
                  <li key={q.id} className={styles.libraryItem} data-quote>
                    <button type="button" className={styles.libraryGo} onClick={() => go(() => onGoQuote(q))}>
                      <span className={styles.quoteText}>“{q.text}”</span>
                      <small>{q.chapterTitle ? q.chapterTitle.toLocaleLowerCase("es") : chapterName(q.chapterIndex)}</small>
                    </button>
                    <div className={styles.libraryActs}>
                      <button
                        type="button"
                        className={styles.libraryAct}
                        aria-label="Copiar la cita"
                        onClick={() => void copyQuote(q)}
                      >
                        {copied === q.id ? "Copiada" : "Copiar"}
                      </button>
                      <button
                        type="button"
                        className={styles.libraryAct}
                        aria-label="Borrar la cita"
                        onClick={() => void removeQuote(q.id)}
                      >
                        Borrar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {!user && configured && !loading && (
            <div className={styles.libraryAccount}>
              <p>Inicia sesión para guardarlo en tu cuenta</p>
              <SignInButton />
            </div>
          )}
        </div>
      )}
    </>
  );
}
