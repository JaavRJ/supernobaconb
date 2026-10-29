"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Field } from "@/components/admin/Field";
import { useAdminCollection } from "@/lib/admin/useAdminCollection";
import type { ThreadKind, Track, Work } from "@/types/content";
import styles from "./Hilos.module.css";
import { endpointName, KINDS, kindLabel, previewThread, threadId, type ThreadDoc } from "./threads";

interface Draft {
  /** Id del documento; vacío mientras es un hilo nuevo */
  id: string;
  from: string;
  to: string;
  kind: ThreadKind;
  fromPart: number | null;
  note: string;
  order?: number;
}

const emptyDraft = (): Draft => ({ id: "", from: "", to: "", kind: "inspira", fromPart: null, note: "" });

interface Props {
  works: Work[];
  tracks: Track[];
}

/** Hilos entre obras: lista, editor con vista previa de "Conectado con" y borrado. */
export function ThreadsTab({ works, tracks }: Props) {
  const { items, loading, error, save, remove } = useAdminCollection<ThreadDoc>("threads");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY)),
    [items],
  );

  const options = useMemo(
    () => [
      { value: "", label: "Elige una obra o canción" },
      ...works.map((w) => ({ value: w.id, label: `Obra · ${w.title}` })),
      ...tracks.map((t) => ({
        value: t.id,
        label: `Canción · ${t.title} (${works.find((w) => w.id === t.workId)?.title ?? t.workId})`,
      })),
    ],
    [works, tracks],
  );

  const originWork = draft ? works.find((w) => w.id === draft.from) : undefined;
  const parts = originWork?.type === "libro" ? (originWork.parts ?? []) : [];
  const preview = draft && draft.from && draft.to ? previewThread({ id: draft.id, from: draft.from, to: draft.to, kind: draft.kind, fromPart: draft.fromPart ?? undefined }, works, tracks) : [];

  const open = (next: Draft) => {
    setTouched(false);
    setDraft(next);
  };

  const submit = async () => {
    if (!draft) return;
    setTouched(true);
    if (!draft.from || !draft.to || draft.from === draft.to) return;
    const id = draft.id || threadId(draft.from, draft.kind, draft.to, new Set(items.map((t) => t.id)));
    const order = draft.order ?? Math.max(-1, ...items.map((t) => t.order ?? -1)) + 1;
    const fromPart = parts.some((p) => p.number === draft.fromPart) ? (draft.fromPart ?? undefined) : undefined;
    setSaving(true);
    try {
      await save(id, {
        id,
        from: draft.from,
        to: draft.to,
        kind: draft.kind,
        fromPart,
        note: draft.note.trim() || undefined,
        order,
      });
      setDraft(null);
    } catch {
      // el aviso de error ya lo mostró el hook; el borrador se queda para reintentar
    } finally {
      setSaving(false);
    }
  };

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const kind = KINDS.find((k) => k.value === draft?.kind);

  if (loading) return <p className={styles.message}>Cargando hilos…</p>;
  if (error) return <p className={styles.message}>{error}</p>;
  if (works.length === 0) return <p className={styles.message}>Primero importa el contenido (Importar).</p>;

  return (
    <div className={styles.stack}>
      {!draft ? (
        <div>
          <Button onClick={() => open(emptyDraft())}>Nuevo hilo</Button>
        </div>
      ) : null}

      {draft ? (
        <div className={styles.editor}>
          <h2 className={styles.editorTitle}>{draft.id ? "Editar hilo" : "Nuevo hilo"}</h2>
          <div className={styles.grid2}>
            <Field
              label="Origen"
              type="select"
              required
              options={options}
              value={draft.from}
              onChange={(from) => set({ from, fromPart: null })}
              error={touched && !draft.from ? "Elige el origen." : null}
            />
            <Field
              label="Destino"
              type="select"
              required
              options={options}
              value={draft.to}
              onChange={(to) => set({ to })}
              error={touched && !draft.to ? "Elige el destino." : touched && draft.from === draft.to ? "El origen y el destino deben ser distintos." : null}
            />
          </div>
          <Field
            label="Tipo"
            type="select"
            options={KINDS.map((k) => ({ value: k.value, label: k.label }))}
            value={draft.kind}
            onChange={(value) => set({ kind: value as ThreadKind })}
            hint={kind?.help}
          />
          {parts.length > 0 ? (
            <Field
              label="Parte del libro (opcional)"
              type="select"
              options={[
                { value: "", label: "Sin parte concreta" },
                ...parts.map((p) => ({ value: String(p.number), label: `Parte ${p.number} · ${p.title}` })),
              ]}
              value={draft.fromPart === null ? "" : String(draft.fromPart)}
              onChange={(value) => set({ fromPart: value === "" ? null : Number(value) })}
              hint="Se usa en los hilos de tipo Inspira: la frase menciona la parte y enlaza a su lectura."
            />
          ) : null}
          <Field label="Nota (opcional)" type="textarea" rows={3} value={draft.note} onChange={(note) => set({ note })} />
          {draft.id ? null : (
            <p className={styles.meta}>
              Id:{" "}
              {draft.from && draft.to
                ? threadId(draft.from, draft.kind, draft.to, new Set(items.map((t) => t.id)))
                : "se genera al elegir origen y destino"}
            </p>
          )}

          <div className={styles.preview} aria-live="polite">
            <p className={styles.previewTitle}>Vista previa · Conectado con</p>
            {preview.length === 0 ? <p className={styles.meta}>Elige origen y destino para ver cómo se lee.</p> : null}
            {preview.map((line) => (
              <p key={line.viewer} className={styles.previewLine}>
                {line.text ? (
                  <>
                    <span>En {line.viewer}: </span>
                    {line.text}
                  </>
                ) : (
                  <span>
                    En {line.viewer}: no aparece ({line.reason}).
                  </span>
                )}
              </p>
            ))}
          </div>

          <div className={styles.formActions}>
            <Button onClick={() => void submit()} disabled={saving}>
              {saving ? "Guardando…" : "Guardar hilo"}
            </Button>
            <Button variant="quiet" onClick={() => setDraft(null)} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <p className={styles.message}>Todavía no hay hilos. Si esperabas verlos, primero importa el contenido (Importar).</p>
      ) : (
        <ul className={styles.cards}>
          {sorted.map((t) => (
            <li key={t.id} className={styles.card}>
              <p className={styles.cardTitle}>
                {endpointName(t.from, works, tracks)}
                {t.fromPart ? ` · Parte ${t.fromPart}` : ""} <span className={styles.arrow}>→ {kindLabel(t.kind).toLowerCase()} →</span>{" "}
                {endpointName(t.to, works, tracks)} <span className={styles.meta}>({t.to})</span>
              </p>
              {t.note ? <p className={styles.meta}>{t.note}</p> : null}
              <div className={styles.actions}>
                <Button
                  variant="quiet"
                  small
                  onClick={() =>
                    open({ id: t.id, from: t.from, to: t.to, kind: t.kind, fromPart: t.fromPart ?? null, note: t.note ?? "", order: t.order })
                  }
                >
                  Editar
                </Button>
                <ConfirmButton small question="¿Borrar este hilo?" onConfirm={() => remove(t.id).catch(() => undefined)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
