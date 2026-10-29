"use client";

import { useEffect, useImperativeHandle, useRef, type ClipboardEvent, type MouseEvent, type Ref } from "react";
import { Button } from "@/components/admin/Button";
import { cleanBookHtml, plainTextToHtml } from "./richText";
import styles from "./RichEditor.module.css";

export interface RichEditorHandle {
  /** HTML ya limpio de lo que hay en el editor ahora mismo */
  getHtml: () => string;
}

interface RichEditorProps {
  /** HTML limpio con el que arranca; para cargar otro texto, cambia la `key` del componente. */
  initialHtml: string;
  /** Se llama (con un pequeño retraso) con el HTML limpio cada vez que se edita. */
  onChange: (html: string) => void;
  handle: Ref<RichEditorHandle>;
}

const DEBOUNCE_MS = 250;

/** Editor de texto enriquecido mínimo (`contentEditable`): negritas, cursivas, párrafo y pegado limpio. */
export function RichEditor({ initialHtml, onChange, handle }: RichEditorProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const area = areaRef.current;
    if (area) area.innerHTML = initialHtml;
    // Solo al montar: el texto vivo es el del navegador, no el de React
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useImperativeHandle(handle, () => ({ getHtml: () => cleanBookHtml(areaRef.current?.innerHTML ?? "") }), []);

  const schedule = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      onChangeRef.current(cleanBookHtml(areaRef.current?.innerHTML ?? ""));
    }, DEBOUNCE_MS);
  };

  const run = (command: string, value?: string) => {
    areaRef.current?.focus();
    document.execCommand(command, false, value);
    schedule();
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    const clean = html ? cleanBookHtml(html) : plainTextToHtml(text);
    if (clean) document.execCommand("insertHTML", false, clean);
    schedule();
  };

  // `onMouseDown` evita que el botón le quite la selección al texto
  const keepSelection = (event: MouseEvent) => event.preventDefault();

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formato del texto">
        <Button variant="quiet" small onMouseDown={keepSelection} onClick={() => run("bold")}>
          Negritas (título)
        </Button>
        <Button variant="quiet" small onMouseDown={keepSelection} onClick={() => run("italic")}>
          Cursivas
        </Button>
        <Button variant="quiet" small onMouseDown={keepSelection} onClick={() => run("formatBlock", "p")}>
          Párrafo
        </Button>
        <Button variant="quiet" small onMouseDown={keepSelection} onClick={() => run("undo")}>
          Deshacer
        </Button>
        <Button variant="quiet" small onMouseDown={keepSelection} onClick={() => run("redo")}>
          Rehacer
        </Button>
      </div>
      <div
        ref={areaRef}
        className={styles.area}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Texto de la parte"
        spellCheck
        onFocus={() => document.execCommand("defaultParagraphSeparator", false, "p")}
        onInput={schedule}
        onPaste={onPaste}
      />
    </div>
  );
}
