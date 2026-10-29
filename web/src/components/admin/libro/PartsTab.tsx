"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Field } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toast";
import { refreshSite } from "@/lib/admin/refresh";
import { readWorkParts, writeWorkParts, type BookPartMeta } from "./data";
import styles from "./Libro.module.css";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Títulos, subtítulos y fechas de publicación de las partes (campo `parts` de `works/bduem`). */
export function PartsTab() {
  const toast = useToast();
  const [parts, setParts] = useState<BookPartMeta[] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readWorkParts()
      .then((loaded) => {
        if (cancelled) return;
        if (loaded === null || loaded.length === 0) setState("missing");
        else {
          setParts(loaded);
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") return <p className={styles.note}>Cargando…</p>;
  if (state === "error") return <p className={styles.alert}>No se pudieron leer las partes. Revisa tu conexión y tus permisos.</p>;
  if (state === "missing" || !parts) {
    return <p className={styles.alert}>Primero importa el contenido (Importar): todavía no existe la obra del libro en Firestore.</p>;
  }

  const update = (index: number, patch: Partial<BookPartMeta>) =>
    setParts(parts.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const invalid = parts.some((p) => !p.title.trim() || !DATE.test(p.releaseDate));

  const save = async () => {
    setShowErrors(true);
    if (invalid) {
      toast.error("Cada parte necesita título y fecha.");
      return;
    }
    setSaving(true);
    try {
      await writeWorkParts(
        parts.map((p) => ({
          number: p.number,
          title: p.title.trim(),
          subtitle: p.subtitle?.trim() || undefined,
          releaseDate: p.releaseDate,
        })),
      );
    } catch {
      toast.error("No se pudo guardar. Revisa tu conexión y tus permisos.");
      setSaving(false);
      return;
    }
    const refreshed = await refreshSite(["book", "content"]);
    if (refreshed.ok) toast.success("Partes guardadas");
    else toast.error(`Guardado, pero el sitio no se actualizó: ${refreshed.error}`);
    setSaving(false);
  };

  return (
    <div className={styles.stack}>
      <p className={styles.note}>
        Una parte se abre en el sitio al llegar su fecha (día de México). Puede tardar hasta una hora en abrirse si nadie la ha visitado.
      </p>
      <ul className={styles.cards}>
        {parts.map((part, index) => (
          <li key={part.number} className={styles.card}>
            <h2 className={styles.cardTitle}>Parte {part.number}</h2>
            <Field
              label="Título"
              required
              value={part.title}
              error={showErrors && !part.title.trim() ? "Escribe el título." : null}
              onChange={(title) => update(index, { title })}
            />
            <Field label="Subtítulo" value={part.subtitle ?? ""} onChange={(subtitle) => update(index, { subtitle })} />
            <Field
              label="Fecha de publicación"
              type="date"
              required
              value={part.releaseDate}
              error={showErrors && !DATE.test(part.releaseDate) ? "Elige la fecha." : null}
              onChange={(releaseDate) => update(index, { releaseDate })}
            />
          </li>
        ))}
      </ul>
      <div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar partes"}
        </Button>
      </div>
    </div>
  );
}
