"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { useHighlights, useQuotes } from "@/lib/reader";
import { anchorFromRange, buildIndex, locate, rangeFromGlobal, type Anchor } from "./anchoring";
import { copyToClipboard } from "./clipboard";
import { QuoteCardDialog, type QuoteCardTarget } from "./QuoteCardDialog";
import type { ReadMode } from "./ReaderSettings";
import styles from "./Reader.module.css";

const NARROW_QUERY = "(max-width: 600px)";

interface ReaderAnnotationsProps {
  partNumber: number;
  partTitle: string;
  chapters: { index: number; title: string }[];
  /** Notas del autor de la parte; título y texto se muestran como texto plano */
  notes: { id: string; title: string; content: string }[];
  flowRef: RefObject<HTMLDivElement | null>;
  mode: ReadMode;
  page: number;
}

type MenuState =
  | { kind: "selection"; anchor: Anchor; copyText: string; focus: boolean }
  | { kind: "highlight"; id: string; x: number; y: number };

interface NoteState {
  id: string;
  el: HTMLElement;
  page: number;
  mode: ReadMode;
}

function subscribeNarrow(onChange: () => void) {
  const query = window.matchMedia(NARROW_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

function supportsHighlights(): boolean {
  return typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";
}

function unwrapMarks(root: HTMLElement) {
  const parents = new Set<Node>();
  root.querySelectorAll("mark[data-hl-id]").forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    parents.add(parent);
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  });
  parents.forEach((p) => p.normalize());
}

/** Altura inferior de la barra fija: lo que queda por debajo es zona de texto */
function barBottom(): number {
  return document.querySelector('[role="progressbar"]')?.getBoundingClientRect().bottom ?? 0;
}

/**
 * Capa de anotaciones sobre el texto del servidor: menú de selección, resaltados
 * (CSS Custom Highlight API, con `<mark>` si el navegador no la tiene) y tarjetas
 * de notas del autor. No toca el HTML salvo `tabindex`/`role` de las marcas de nota.
 */
export function ReaderAnnotations({
  partNumber,
  partTitle,
  chapters,
  notes,
  flowRef,
  mode,
  page,
}: ReaderAnnotationsProps) {
  const { highlights, save: saveHighlight, remove: removeHighlight } = useHighlights(partNumber);
  const { save: saveQuote } = useQuotes(partNumber);

  const narrow = useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );

  const [menu, setMenu] = useState<MenuState | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [note, setNote] = useState<NoteState | null>(null);
  const [card, setCard] = useState<QuoteCardTarget | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const selectionRange = useRef<Range | null>(null);
  const rangesRef = useRef<{ id: string; range: Range }[]>([]);
  const pointerDown = useRef(false);
  const holdUntil = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const article = useCallback(() => flowRef.current?.querySelector("article") ?? null, [flowRef]);

  const activeNote = note && note.page === page && note.mode === mode ? note : null;
  const noteData = activeNote ? notes.find((n) => n.id === activeNote.id) : undefined;

  // ----- Resaltados guardados: se anclan por texto y se dibujan sin tocar el HTML -----
  useEffect(() => {
    const root = article();
    if (!root) return;
    const native = supportsHighlights();
    if (!native) unwrapMarks(root);
    const index = buildIndex(root);

    const hits = highlights
      .map((h) => ({ id: h.id, hit: locate(index, h) }))
      .filter((h): h is { id: string; hit: { start: number; end: number } } => h.hit !== null)
      .sort((a, b) => a.hit.start - b.hit.start);

    if (native) {
      const found = hits.flatMap(({ id, hit }) => {
        const range = rangeFromGlobal(index, hit.start, hit.end);
        return range ? [{ id, range }] : [];
      });
      rangesRef.current = found;
      CSS.highlights.set(styles.resaltado, new Highlight(...found.map((f) => f.range)));
      return () => {
        CSS.highlights.delete(styles.resaltado);
        rangesRef.current = [];
      };
    }

    // Sin la API: se envuelve cada trozo de texto en <mark>, de atrás hacia adelante
    let limit = Infinity;
    const accepted = [...hits].reverse().filter(({ hit }) => {
      if (hit.end > limit) return false;
      limit = hit.start;
      return true;
    });
    for (const { id, hit } of accepted) {
      for (const n of index.nodes) {
        if (n.end <= hit.start || n.start >= hit.end) continue;
        const part = document.createRange();
        part.setStart(n.node, Math.max(0, hit.start - n.start));
        part.setEnd(n.node, Math.min(n.node.length, hit.end - n.start));
        const mark = document.createElement("mark");
        mark.dataset.hlId = id;
        part.surroundContents(mark);
      }
    }
    return () => unwrapMarks(root);
    // Solo depende de la lista: el texto lo pinta el servidor y el contenedor es el mismo en
    // ambos modos, así que los rangos siguen vivos al cambiar letra, interlineado o modo
  }, [highlights, article]);

  // ----- Menú de selección -----
  const closeMenu = useCallback(() => {
    clearTimeout(closeTimer.current);
    setMenu(null);
    setStatus(null);
  }, []);

  const evaluate = useCallback(
    (focus: boolean) => {
      if (Date.now() < holdUntil.current) return;
      const root = article();
      const sel = window.getSelection();
      const close = () => setMenu((m) => (m && m.kind === "selection" ? null : m));
      if (!root || !sel || sel.rangeCount === 0 || sel.isCollapsed) return close();
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return close();
      const anchor = anchorFromRange(buildIndex(root), range);
      if (!anchor) return close();
      selectionRange.current = range.cloneRange();
      setStatus(null);
      setMenu({ kind: "selection", anchor, copyText: sel.toString().trim() || anchor.text, focus });
    },
    [article],
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!pointerDown.current) evaluate(false);
      }, 220);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && article()?.contains(e.target as Node)) pointerDown.current = true;
    };
    const onUp = () => {
      if (!pointerDown.current) return;
      pointerDown.current = false;
      clearTimeout(timer);
      timer = setTimeout(() => evaluate(false), 0);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.startsWith("Arrow") && e.shiftKey) {
        clearTimeout(timer);
        timer = setTimeout(() => evaluate(true), 120);
      }
    };
    document.addEventListener("selectionchange", onChange);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("selectionchange", onChange);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [article, evaluate]);

  const placeMenu = useCallback(() => {
    const el = menuRef.current;
    if (!el || !menu) return;
    let rect: { left: number; right: number; top: number; bottom: number };
    if (menu.kind === "selection") {
      const range = selectionRange.current;
      if (!range) return;
      rect = range.getBoundingClientRect();
    } else {
      rect = { left: menu.x, right: menu.x, top: menu.y, bottom: menu.y };
    }
    const bar = barBottom();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = clamp((rect.left + rect.right) / 2 - w / 2, 8, window.innerWidth - w - 8);
    let top: number;
    if (narrow || menu.kind === "highlight") {
      top = rect.bottom + (narrow && menu.kind === "selection" ? 28 : 12);
    } else {
      top = rect.top - h - 10;
      if (top < bar + 6) top = rect.bottom + 12;
    }
    top = clamp(top, bar + 6, window.innerHeight - h - 8);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [menu, narrow]);

  useLayoutEffect(() => {
    placeMenu();
    if (menu?.kind === "selection" && menu.focus) menuRef.current?.querySelector("button")?.focus({ preventScroll: true });
  }, [menu, status, placeMenu]);

  useEffect(() => {
    if (!menu) return;
    const onScroll = () => {
      if (menu.kind === "highlight") closeMenu();
      else placeMenu();
    };
    const onDown = (e: PointerEvent) => {
      if (menu.kind === "highlight" && !menuRef.current?.contains(e.target as Node)) closeMenu();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menu, placeMenu, closeMenu]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /** Muestra un mensaje breve en el menú y lo cierra */
  const finish = useCallback(
    (message: string) => {
      holdUntil.current = Date.now() + 1500;
      window.getSelection()?.removeAllRanges();
      setStatus(message);
      clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(closeMenu, 1100);
    },
    [closeMenu],
  );

  const pageNumber = mode === "pages" ? page + 1 : 1;

  const doHighlight = async () => {
    if (menu?.kind !== "selection") return;
    const a = menu.anchor;
    try {
      const exists = highlights.some((h) => h.chapterIndex === a.chapterIndex && h.offset === a.offset && h.text === a.text);
      if (!exists) {
        await saveHighlight({
          text: a.text,
          color: "yellow",
          partNumber,
          chapterIndex: a.chapterIndex,
          pageNumber,
          offset: a.offset,
          prefix: a.prefix,
          suffix: a.suffix,
        });
      }
      finish("Resaltado");
    } catch {
      finish("No se pudo guardar");
    }
  };

  const doQuote = async () => {
    if (menu?.kind !== "selection") return;
    const a = menu.anchor;
    try {
      await saveQuote({
        text: a.text,
        partNumber,
        partTitle,
        chapterTitle: chapters.find((c) => c.index === a.chapterIndex)?.title ?? "",
        pageNumber,
        chapterIndex: a.chapterIndex,
        offset: a.offset,
        prefix: a.prefix,
        suffix: a.suffix,
      });
      finish("Cita guardada");
    } catch {
      finish("No se pudo guardar");
    }
  };

  const doCopy = async () => {
    if (menu?.kind !== "selection") return;
    finish((await copyToClipboard(menu.copyText)) ? "Copiado" : "No se pudo copiar");
  };

  const doShare = () => {
    if (menu?.kind !== "selection") return;
    holdUntil.current = Date.now() + 1500;
    setCard({ text: menu.copyText, partNumber, partTitle });
    window.getSelection()?.removeAllRanges();
    closeMenu();
  };

  const doRemove = async () => {
    if (menu?.kind !== "highlight") return;
    try {
      await removeHighlight(menu.id);
      finish("Resaltado quitado");
    } catch {
      finish("No se pudo quitar");
    }
  };

  // ----- Clic en un resaltado: ofrece quitarlo -----
  useEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-note-id]")) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      let id: string | undefined = target.closest<HTMLElement>("mark[data-hl-id]")?.dataset.hlId;
      if (!id && sel?.anchorNode) {
        for (const r of rangesRef.current) {
          try {
            if (r.range.isPointInRange(sel.anchorNode, sel.anchorOffset)) {
              id = r.id;
              break;
            }
          } catch {
            // El rango ya no está en el documento
          }
        }
      }
      if (!id) return;
      // Evita que el clic gire la página en el modo páginas
      e.stopPropagation();
      setStatus(null);
      setMenu({ kind: "highlight", id, x: e.clientX, y: e.clientY });
    };
    flow.addEventListener("click", onClick);
    return () => flow.removeEventListener("click", onClick);
  }, [flowRef]);

  // ----- Notas del autor: marcas enfocables y tarjeta -----
  const noteIds = notes.map((n) => n.id).join("|");
  useEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;
    const known = new Set(noteIds.split("|"));
    flow.querySelectorAll<HTMLElement>("[data-note-id]").forEach((el) => {
      if (!known.has(el.dataset.noteId ?? "")) return;
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-haspopup", "dialog");
    });
    const open = (el: HTMLElement) => {
      const id = el.dataset.noteId;
      if (!id || !known.has(id)) return;
      setMenu(null);
      setNote((prev) => (prev && prev.id === id && prev.el === el ? null : { id, el, page, mode }));
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-note-id]");
      if (el) open(el);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = (e.target as Element).closest<HTMLElement>("[data-note-id]");
      if (!el || e.target !== el) return;
      e.preventDefault();
      open(el);
    };
    flow.addEventListener("click", onClick);
    flow.addEventListener("keydown", onKey);
    return () => {
      flow.removeEventListener("click", onClick);
      flow.removeEventListener("keydown", onKey);
    };
  }, [flowRef, noteIds, page, mode]);

  const placeCard = useCallback(() => {
    const card = cardRef.current;
    if (!card || !activeNote || narrow) return;
    const rects = activeNote.el.getClientRects();
    const rect = rects[0] ?? activeNote.el.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const bar = barBottom();
    const left = clamp(rect.left, 12, window.innerWidth - w - 12);
    let top = rect.bottom + 10;
    if (top + h > window.innerHeight - 12) top = rect.top - h - 10;
    top = clamp(top, bar + 8, window.innerHeight - h - 12);
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }, [activeNote, narrow]);

  useLayoutEffect(() => {
    placeCard();
  }, [placeCard, noteData]);

  const closeNote = useCallback(
    (returnFocus: boolean) => {
      if (returnFocus) note?.el.focus({ preventScroll: true });
      setNote(null);
    },
    [note],
  );

  useEffect(() => {
    if (!activeNote) return;
    cardRef.current?.focus({ preventScroll: true });
    const onScroll = () => placeCard();
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (cardRef.current?.contains(target) || target.closest("[data-note-id]")) return;
      setNote(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [activeNote, placeCard]);

  // ----- Escape cierra lo que esté abierto -----
  useEffect(() => {
    if (!menu && !activeNote) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeNote) closeNote(true);
      if (menu) closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu, activeNote, closeNote, closeMenu]);

  return (
    <>
      {card && <QuoteCardDialog {...card} onClose={() => setCard(null)} />}
      {menu && (
        <div
          ref={menuRef}
          role="group"
          aria-label={menu.kind === "selection" ? "Acciones para el texto seleccionado" : "Acciones del resaltado"}
          className={styles.selMenu}
          data-reader-interactive
          onMouseDown={(e) => e.preventDefault()}
          onPointerDown={() => {
            holdUntil.current = Date.now() + 900;
          }}
        >
          {status ? (
            <p className={styles.selStatus} role="status">
              {status}
            </p>
          ) : menu.kind === "selection" ? (
            <>
              <button type="button" className={styles.selBtn} onClick={() => void doHighlight()}>
                Resaltar
              </button>
              <button type="button" className={styles.selBtn} onClick={() => void doQuote()}>
                Guardar cita
              </button>
              <button type="button" className={styles.selBtn} onClick={() => void doCopy()}>
                Copiar
              </button>
              <button type="button" className={styles.selBtn} onClick={doShare}>
                Compartir
              </button>
            </>
          ) : (
            <button type="button" className={styles.selBtn} onClick={() => void doRemove()}>
              Quitar resaltado
            </button>
          )}
        </div>
      )}

      {activeNote && noteData && (
        <div
          ref={cardRef}
          role="dialog"
          aria-label={`Nota del autor: ${noteData.title}`}
          tabIndex={-1}
          className={styles.noteCard}
          data-sheet={narrow ? "" : undefined}
          data-reader-interactive
        >
          <p className={styles.noteEyebrow}>
            <span aria-hidden="true">✦ </span>Nota del autor
          </p>
          <h3 className={styles.noteTitle}>{noteData.title}</h3>
          <p className={styles.noteText}>{noteData.content}</p>
          <button type="button" className={styles.noteClose} onClick={() => closeNote(true)}>
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
