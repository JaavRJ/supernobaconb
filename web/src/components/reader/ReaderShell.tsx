"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { usePreferences, useReadingProgress, type Bookmark, type Quote } from "@/lib/reader";
import { buildIndex, findRange } from "./anchoring";
import { ReaderAnnotations } from "./ReaderAnnotations";
import { ReaderBar } from "./ReaderBar";
import { ReaderTools } from "./ReaderTools";
import { useHydrated } from "./useHydrated";
import { FONT_STEPS, LINE_STEPS, ReaderSettings, type ReadMode } from "./ReaderSettings";
import styles from "./Reader.module.css";

/** Espacio entre páginas en el modo páginas (px) */
const GAP = 40;
const DEFAULT_LINE_HEIGHT = 1.7;

/** Punto de lectura: capítulo y posición 0–1 dentro de él */
interface Position {
  chapter: number;
  progress: number;
  /** Aún no se entra al primer capítulo (portada, o primera página) */
  start?: boolean;
}

interface ReaderShellProps {
  partNumber: number;
  partTitle: string;
  totalMinutes: number;
  /** Capítulos para el índice del panel de configuración */
  chapters: { index: number; title: string }[];
  /** Notas del autor marcadas en el texto (título y contenido en texto plano) */
  notes: { id: string; title: string; content: string }[];
  /** Portada de la parte; en modo páginas queda fuera del marco */
  heading: ReactNode;
  /** Antesala de fragmentos y polaroids; como la portada, solo en modo continuo */
  prelude?: ReactNode;
  /** `<article>` con las secciones de cada capítulo (HTML de servidor) */
  text: ReactNode;
  /** Cierre de la parte; en modo páginas es la última página */
  end: ReactNode;
}

function nearest(steps: number[], value: number): number {
  return steps.reduce((best, s) => (Math.abs(s - value) < Math.abs(best - value) ? s : best), steps[0]);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Envoltura cliente del lector: configuración, modo continuo o páginas, punto de lectura
 * y progreso guardado. El texto llega ya renderizado desde el servidor.
 */
export function ReaderShell({
  partNumber,
  partTitle,
  totalMinutes,
  chapters,
  notes,
  heading,
  prelude,
  text,
  end,
}: ReaderShellProps) {
  const { preferences, ready: prefsReady, update: updatePreferences } = usePreferences();
  const { progress: saved, ready, update: saveProgress } = useReadingProgress(partNumber);

  // Las preferencias vienen del navegador: hasta hidratar se usa lo mismo que el servidor
  const hydrated = useHydrated();
  const mode: ReadMode = hydrated && prefsReady && preferences.readingMode === "horizontal" ? "pages" : "continuous";
  const fontSize = nearest(FONT_STEPS, hydrated ? preferences.fontSize : 20);
  const lineHeight = nearest(LINE_STEPS, hydrated ? (preferences.lineHeight ?? DEFAULT_LINE_HEIGHT) : DEFAULT_LINE_HEIGHT);

  const [overall, setOverall] = useState(0);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [dismissed, setDismissed] = useState(false);
  /** Capítulo y avance (a 1 %) del punto de lectura, para el marcador de la barra */
  const [where, setWhere] = useState({ chapter: 0, progress: 0 });

  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const modeRef = useRef<ReadMode>(mode);
  const posRef = useRef<Position | null>(null);
  const pageRef = useRef(0);
  const countRef = useRef(1);
  const strideRef = useRef(1);
  const metricsRef = useRef<{ start: number; size: number }[]>([]);
  const restoringRef = useRef(false);
  const restoreTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingSave = useRef<{ pos: Position; overall: number } | null>(null);
  const saveRef = useRef(saveProgress);
  const completedRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const advanced =
    saved !== null && ((saved.chapterIndex ?? 0) > 0 || (saved.progress ?? 0) > 0.02);
  // El progreso guardado solo existe en el navegador: el aviso espera a la hidratación
  const showNotice = hydrated && ready && !dismissed && advanced;
  const noticeRef = useRef(false);
  const canSaveRef = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
    saveRef.current = saveProgress;
    completedRef.current = saved?.completed ?? false;
    noticeRef.current = showNotice;
    canSaveRef.current = ready;
  });

  const sections = useCallback(
    () => Array.from(flowRef.current?.querySelectorAll<HTMLElement>("section") ?? []),
    [],
  );

  /** Línea de lectura en modo continuo: justo debajo de la barra fija */
  const anchor = useCallback(() => {
    const bar = shellRef.current?.querySelector('[role="progressbar"]');
    return (bar ? bar.getBoundingClientRect().bottom : 90) + 24;
  }, []);

  const readPosition = useCallback((): Position => {
    if (modeRef.current === "pages") {
      const left = pageRef.current * strideRef.current;
      const metrics = metricsRef.current;
      let chapter = 0;
      metrics.forEach((m, i) => {
        if (m.start <= left + 1) chapter = i;
      });
      const m = metrics[chapter];
      return {
        chapter,
        progress: m && m.size > 0 ? clamp01((left - m.start) / m.size) : 0,
        start: pageRef.current === 0,
      };
    }
    const list = sections();
    const y = window.scrollY + anchor();
    let chapter = 0;
    let top = 0;
    let height = 1;
    list.forEach((s, i) => {
      const t = s.getBoundingClientRect().top + window.scrollY;
      if (t <= y) {
        chapter = i;
        top = t;
        height = s.offsetHeight;
      }
    });
    const first = list[0];
    if (!first || first.getBoundingClientRect().top + window.scrollY > y) {
      return { chapter: 0, progress: 0, start: true };
    }
    return { chapter, progress: clamp01((y - top) / Math.max(1, height)) };
  }, [anchor, sections]);

  /** Guarda el punto de lectura como mucho una vez por segundo */
  const queueSave = useCallback((pos: Position, total: number) => {
    pendingSave.current = { pos, overall: total };
    if (saveTimer.current) return;
    saveTimer.current = setTimeout(() => {
      saveTimer.current = undefined;
      const p = pendingSave.current;
      pendingSave.current = null;
      if (!p) return;
      saveRef.current({
        chapterIndex: p.pos.chapter,
        progress: p.pos.progress,
        completed: completedRef.current || p.overall >= 0.995,
      });
    }, 1000);
  }, []);

  const report = useCallback(() => {
    if (restoringRef.current) return;
    const pos = readPosition();
    posRef.current = pos;

    let total = 0;
    if (modeRef.current === "pages") {
      total = countRef.current > 1 ? pageRef.current / (countRef.current - 1) : 0;
    } else {
      const article = flowRef.current?.querySelector("article");
      if (article) {
        const top = article.getBoundingClientRect().top + window.scrollY;
        const span = article.offsetHeight - window.innerHeight;
        total = span > 0 ? clamp01((window.scrollY - top) / span) : 0;
      }
    }
    setOverall(total);
    const rounded = Math.round(pos.progress * 100) / 100;
    setWhere((w) => (w.chapter === pos.chapter && w.progress === rounded ? w : { chapter: pos.chapter, progress: rounded }));

    if (noticeRef.current) {
      if (!pos.start) setDismissed(true);
      return;
    }
    if (!canSaveRef.current || pos.start) return;
    setDismissed(true);
    queueSave(pos, total);
  }, [queueSave, readPosition]);

  const goPage = useCallback(
    (target: number) => {
      const flow = flowRef.current;
      if (!flow) return;
      const next = Math.min(countRef.current - 1, Math.max(0, target));
      pageRef.current = next;
      flow.style.transform = `translate3d(${-next * strideRef.current}px, 0, 0)`;
      setPage(next);
      report();
    },
    [report],
  );

  /** Lleva la vista a un punto de lectura en el modo actual */
  const restore = useCallback(
    (pos: Position) => {
      restoringRef.current = true;
      clearTimeout(restoreTimer.current);
      if (modeRef.current === "pages") {
        if (window.scrollY > 0) window.scrollTo(0, 0);
        const m = metricsRef.current[pos.chapter];
        goPage(pos.start || !m ? 0 : Math.floor((m.start + pos.progress * m.size) / strideRef.current));
      } else {
        const s = sections()[pos.chapter];
        if (pos.start || !s) {
          window.scrollTo({ top: 0, behavior: "instant" });
        } else {
          const top = s.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: top + pos.progress * s.offsetHeight - anchor(), behavior: "instant" });
        }
      }
      restoreTimer.current = setTimeout(() => {
        restoringRef.current = false;
        report();
      }, 150);
    },
    [anchor, goPage, report, sections],
  );

  /** Mide el marco y las páginas (modo páginas) o limpia los estilos (modo continuo) */
  const relayout = useCallback(() => {
    const viewport = viewportRef.current;
    const flow = flowRef.current;
    if (!viewport || !flow) return;
    if (modeRef.current !== "pages") {
      flow.style.width = "";
      flow.style.columnWidth = "";
      flow.style.columnGap = "";
      flow.style.transform = "";
      countRef.current = 1;
      pageRef.current = 0;
      metricsRef.current = [];
      setPageCount(1);
      return;
    }
    const width = Math.floor(viewport.clientWidth);
    flow.style.width = `${width}px`;
    flow.style.columnWidth = `${width}px`;
    flow.style.columnGap = `${GAP}px`;
    const stride = width + GAP;
    strideRef.current = stride;
    const count = Math.max(1, Math.round((flow.scrollWidth + GAP) / stride));
    countRef.current = count;
    const flowLeft = flow.getBoundingClientRect().left;
    metricsRef.current = sections().map((s) => {
      const r = s.getBoundingClientRect();
      return { start: r.left - flowLeft, size: r.width };
    });
    setPageCount(count);
  }, [sections]);

  const reflow = useCallback(() => {
    const pos = posRef.current;
    relayout();
    if (pos) restore(pos);
    else if (modeRef.current === "pages") goPage(0);
    else report();
  }, [goPage, relayout, report, restore]);

  // Al cambiar modo, tamaño o interlineado: se recalcula y se vuelve al mismo punto
  useEffect(() => {
    const id = requestAnimationFrame(reflow);
    return () => cancelAnimationFrame(id);
  }, [mode, fontSize, lineHeight, reflow]);

  // Modo continuo: el avance sale del scroll
  useEffect(() => {
    if (mode !== "continuous") return;
    let frame = 0;
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          report();
        });
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode, report]);

  // Modo páginas: recalcular si cambia el marco o terminan de cargar las fuentes
  useEffect(() => {
    if (mode !== "pages") return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    let id = 0;
    const again = () => {
      cancelAnimationFrame(id);
      id = requestAnimationFrame(reflow);
    };
    const observer = new ResizeObserver(again);
    observer.observe(viewport);
    void document.fonts?.ready.then(again);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(id);
    };
  }, [mode, reflow]);

  // Modo páginas: teclado
  useEffect(() => {
    if (mode !== "pages") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goPage(pageRef.current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPage(pageRef.current - 1);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [mode, goPage]);

  // Modo páginas: si el foco entra a algo de otra página, se pasa a esa página
  useEffect(() => {
    if (mode !== "pages") return;
    const flow = flowRef.current;
    if (!flow) return;
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      const left = el.getBoundingClientRect().left - flow.getBoundingClientRect().left;
      const target = Math.floor((left + 1) / strideRef.current);
      if (target !== pageRef.current) goPage(target);
    };
    flow.addEventListener("focusin", onFocus);
    return () => flow.removeEventListener("focusin", onFocus);
  }, [mode, goPage]);

  // Al desmontar se escribe lo pendiente
  useEffect(
    () => () => {
      clearTimeout(restoreTimer.current);
      clearTimeout(saveTimer.current);
      const p = pendingSave.current;
      if (p) {
        saveRef.current({
          chapterIndex: p.pos.chapter,
          progress: p.pos.progress,
          completed: completedRef.current || p.overall >= 0.995,
        });
      }
    },
    [],
  );

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    const t = e.changedTouches[0];
    touchStart.current = null;
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goPage(pageRef.current + (dx < 0 ? 1 : -1));
  };

  const onViewportClick = (e: MouseEvent<HTMLDivElement>) => {
    if (mode !== "pages") return;
    if (!window.getSelection()?.isCollapsed) return;
    if ((e.target as HTMLElement).closest("a, button, [data-note-id], [data-reader-interactive]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (x < 1 / 3) goPage(pageRef.current - 1);
    else if (x > 2 / 3) goPage(pageRef.current + 1);
  };

  const resume = () => {
    if (!saved) return;
    setDismissed(true);
    restore({ chapter: saved.chapterIndex ?? 0, progress: saved.progress ?? 0 });
  };

  const fromStart = () => {
    setDismissed(true);
    saveRef.current({ chapterIndex: 0, progress: 0, completed: completedRef.current });
    restore({ chapter: 0, progress: 0, start: true });
  };

  const goChapter = (index: number) => {
    setDismissed(true);
    restore({ chapter: index, progress: 0, start: index === 0 });
  };

  /** Lleva la vista a un fragmento de texto (cita) en el modo actual */
  const goToRange = (range: Range) => {
    setDismissed(true);
    restoringRef.current = true;
    clearTimeout(restoreTimer.current);
    const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
    if (modeRef.current === "pages") {
      if (window.scrollY > 0) window.scrollTo(0, 0);
      const flowLeft = flowRef.current?.getBoundingClientRect().left ?? 0;
      goPage(Math.floor((rect.left - flowLeft + 1) / strideRef.current));
    } else {
      window.scrollTo({ top: rect.top + window.scrollY - anchor() - 40, behavior: "instant" });
    }
    restoreTimer.current = setTimeout(() => {
      restoringRef.current = false;
      report();
    }, 150);
  };

  const goBookmark = (b: Bookmark) => {
    setDismissed(true);
    restore({ chapter: b.chapterIndex, progress: b.progress ?? 0, start: b.chapterIndex === 0 && (b.progress ?? 0) === 0 });
  };

  const goQuote = (q: Quote) => {
    const article = flowRef.current?.querySelector("article");
    const range = article ? findRange(buildIndex(article), q) : null;
    if (range) goToRange(range);
    else goChapter(q.chapterIndex ?? 0);
  };

  const style = {
    "--reader-font-size": `${fontSize}px`,
    "--reader-line-height": lineHeight,
  } as CSSProperties;
  const pages = mode === "pages";
  const progress = pages ? (pageCount > 1 ? page / (pageCount - 1) : 0) : overall;

  return (
    <div ref={shellRef} className={styles.shell} data-mode={mode} style={style}>
      <ReaderBar partNumber={partNumber} partTitle={partTitle} totalMinutes={totalMinutes} progress={progress}>
        <ReaderSettings
          mode={mode}
          fontSize={fontSize}
          lineHeight={lineHeight}
          chapters={chapters}
          onChapter={goChapter}
          onChange={(patch) => void updatePreferences(patch)}
        />
        <div id="controles-de-lectura" className={styles.controls}>
          <ReaderTools
            partNumber={partNumber}
            partTitle={partTitle}
            chapters={chapters}
            where={where}
            pageNumber={pages ? page + 1 : 1}
            onGoBookmark={goBookmark}
            onGoQuote={goQuote}
          />
        </div>
      </ReaderBar>

      {!pages && heading}
      {!pages && prelude}

      {showNotice && (
        <div className={styles.resume} role="region" aria-label="Continuar lectura">
          <p>Tienes una lectura a medias en esta parte.</p>
          <div className={styles.resumeActions}>
            <button type="button" className={styles.btn} onClick={resume}>
              Continuar donde te quedaste
            </button>
            <button type="button" className={styles.btnGhost} onClick={fromStart}>
              Desde el inicio
            </button>
          </div>
        </div>
      )}

      <div
        ref={viewportRef}
        className={pages ? styles.viewportPages : undefined}
        onClick={onViewportClick}
        onTouchStart={pages ? onTouchStart : undefined}
        onTouchEnd={pages ? onTouchEnd : undefined}
      >
        <div ref={flowRef} className={pages ? styles.flowPages : undefined}>
          {text}
          {end}
        </div>
      </div>

      <ReaderAnnotations
        partNumber={partNumber}
        partTitle={partTitle}
        chapters={chapters}
        notes={notes}
        flowRef={flowRef}
        mode={mode}
        page={page}
      />

      {pages && (
        <p className={styles.pageNo} aria-live="polite">
          pág. {page + 1} de {pageCount}
        </p>
      )}
    </div>
  );
}
