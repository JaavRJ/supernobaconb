"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Field } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toast";
import { refreshSite } from "@/lib/admin/refresh";
import { readingMinutes } from "@/lib/book/reading";
import { readPartText, writePartText } from "./data";
import { RichEditor, type RichEditorHandle } from "./RichEditor";
import { cleanBookHtml, previewChapters } from "./richText";
import { PART_OPTIONS, partTitle } from "./parts";
import styles from "./Libro.module.css";

type Loaded =
  | { status: "loading" }
  | { status: "error" }
  | { status: "split"; ids: string[] }
  | { status: "ready"; loadId: number; baseline: string; docId: string };

/** Texto completo de una parte (`parts/{n}/chapters/0`), con vista previa de cómo se parte en capítulos. */
export function TextTab() {
  const toast = useToast();
  const [partNumber, setPartNumber] = useState(1);
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const editor = useRef<RichEditorHandle>(null);
  const loadCounter = useRef(0);

  useEffect(() => {
    let cancelled = false;
    readPartText(partNumber)
      .then((docs) => {
        if (cancelled) return;
        if (docs.ids.length > 1) {
          setLoaded({ status: "split", ids: docs.ids });
          return;
        }
        const clean = cleanBookHtml(docs.html);
        loadCounter.current += 1;
        setHtml(clean);
        setLoaded({ status: "ready", loadId: loadCounter.current, baseline: clean, docId: docs.ids[0] ?? "0" });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [partNumber]);

  const dirty = loaded.status === "ready" && html !== loaded.baseline;
  const fallbackTitle = partTitle(partNumber);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const chapters = useMemo(() => previewChapters(html, fallbackTitle), [html, fallbackTitle]);
  const minutes = useMemo(() => readingMinutes(html), [html]);

  const choosePart = (value: string) => {
    if (dirty && !window.confirm("Tienes cambios sin guardar en esta parte. ¿Descartarlos?")) return;
    setLoaded({ status: "loading" });
    setPartNumber(Number(value));
  };

  const save = async () => {
    if (loaded.status !== "ready") return;
    const clean = editor.current?.getHtml() ?? html;
    if (!clean.trim()) {
      toast.error("El texto está vacío; no se guardó.");
      return;
    }
    if (
      loaded.baseline.length > 0 &&
      clean.length < loaded.baseline.length * 0.7 &&
      !window.confirm("El texto nuevo es mucho más corto que el guardado. ¿Seguro que quieres reemplazarlo?")
    ) {
      return;
    }
    setSaving(true);
    try {
      await writePartText(partNumber, fallbackTitle, clean, loaded.docId);
    } catch {
      toast.error("No se pudo guardar. Revisa tu conexión y tus permisos.");
      setSaving(false);
      return;
    }
    // Lo tecleado durante el guardado sigue siendo un cambio pendiente
    setHtml(editor.current?.getHtml() ?? clean);
    setLoaded({ ...loaded, baseline: clean });
    const refreshed = await refreshSite(["book", "content"]);
    if (refreshed.ok) toast.success("Texto guardado");
    else toast.error(`Guardado, pero el sitio no se actualizó: ${refreshed.error}`);
    setSaving(false);
  };

  return (
    <div className={styles.stack}>
      <Field label="Parte" type="select" value={String(partNumber)} options={PART_OPTIONS} onChange={choosePart} />

      {loaded.status === "loading" ? <p className={styles.note}>Cargando…</p> : null}
      {loaded.status === "error" ? (
        <p className={styles.alert}>No se pudo leer el texto. Revisa tu conexión y tus permisos.</p>
      ) : null}
      {loaded.status === "split" ? (
        <p className={styles.alert}>
          Esta parte tiene {loaded.ids.length} documentos de texto ({loaded.ids.join(", ")}). Este editor solo maneja un
          documento por parte; únelos antes de editar para no duplicar texto.
        </p>
      ) : null}

      {loaded.status === "ready" ? (
        <>
          <p className={styles.note}>
            Los títulos de capítulo son párrafos cortos <strong>en negritas</strong>. Al pegar desde Word o Google Docs se
            limpia el formato y solo quedan párrafos, negritas y cursivas. Al guardar, el texto queda en ese formato limpio.
          </p>
          <RichEditor key={loaded.loadId} initialHtml={loaded.baseline} onChange={setHtml} handle={editor} />

          <section className={styles.card} aria-label="Vista previa de capítulos">
            <h2 className={styles.cardTitle}>
              Así se partirá: {chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"} · {minutes} min de lectura
            </h2>
            <ol className={styles.chapters}>
              {chapters.map((c, i) => (
                <li key={i}>
                  <span className={styles.chapterTitle}>{c.title}</span>
                  <span className={styles.chapterMeta}> · {c.paragraphs} párrafos</span>
                </li>
              ))}
            </ol>
            {chapters.length === 1 ? (
              <p className={styles.note}>
                Sin títulos en negritas, toda la parte es un solo capítulo con el nombre de la parte.
              </p>
            ) : null}
          </section>

          <div className={styles.row}>
            <Button onClick={save} disabled={saving || !dirty}>
              {saving ? "Guardando…" : "Guardar texto"}
            </Button>
            {dirty ? <span className={styles.note}>Cambios sin guardar</span> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
