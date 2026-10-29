"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Field } from "@/components/admin/Field";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { useToast } from "@/components/admin/Toast";
import { withoutUndefined } from "@/lib/admin/clean";
import { refreshSite } from "@/lib/admin/refresh";
import { useAdminCollection } from "@/lib/admin/useAdminCollection";
import { eras } from "@/content/eras";
import type { Signal, SignalKind } from "@/types/content";
import styles from "./Hilos.module.css";

type SignalDoc = Signal & { order?: number };

const KIND_LABELS: Record<SignalKind, string> = { frase: "Frase", imagen: "Imagen", video: "Video" };
const KIND_OPTIONS = (Object.keys(KIND_LABELS) as SignalKind[]).map((value) => ({ value, label: KIND_LABELS[value] }));

/** Las señales viven en las nebulosas: las eras que todavía no se muestran */
const NEBULAS = eras.filter((e) => e.phase === "nebulosa");
const ERA_OPTIONS = NEBULAS.map((e) => ({ value: e.id, label: e.name ?? `Nebulosa (${e.id})` }));

interface Draft {
  id: string;
  era: string;
  kind: SignalKind;
  content: string;
  alt: string;
  date: string;
  active: boolean;
  order?: number;
}

const today = () => new Date().toISOString().slice(0, 10);

function slugId(era: string, kind: SignalKind, date: string, taken: Set<string>): string {
  const base = `${era}-${kind}-${date}`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function SignalView({ kind, content, alt }: { kind: SignalKind; content: string; alt: string }) {
  return (
    <div className={styles.signal} aria-label="Vista previa de la señal">
      {!content ? (
        <p className={styles.meta}>Todavía no hay contenido.</p>
      ) : kind === "frase" ? (
        <p className={styles.signalPhrase}>{content}</p>
      ) : kind === "imagen" ? (
        // Vista previa de un archivo de Cloudinary: no necesita optimización de next/image
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.signalMedia} src={content} alt={alt} />
      ) : (
        <video className={styles.signalMedia} src={content} controls muted preload="metadata" aria-label={alt || undefined} />
      )}
    </div>
  );
}

/** Señales de la nebulosa: lista, editor con vista previa y una sola activa por era. */
export function SignalsTab() {
  const { items, loading, error, remove } = useAdminCollection<SignalDoc>("signals");
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.date.localeCompare(a.date)),
    [items],
  );

  const open = (next: Draft) => {
    setTouched(false);
    setDraft(next);
  };
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const submit = async () => {
    if (!draft) return;
    setTouched(true);
    const content = draft.content.trim();
    if (!content || !draft.date || !draft.era) return;
    if (draft.kind === "imagen" && !draft.alt.trim()) return;
    const id = draft.id || slugId(draft.era, draft.kind, draft.date, new Set(items.map((s) => s.id)));
    const order = draft.order ?? Math.max(-1, ...items.map((s) => s.order ?? -1)) + 1;
    setSaving(true);
    try {
      const [{ doc, writeBatch }, { getDb }] = await Promise.all([import("firebase/firestore"), import("@/lib/firebase")]);
      const db = getDb();
      const batch = writeBatch(db);
      batch.set(
        doc(db, "signals", id),
        withoutUndefined({
          era: draft.era,
          kind: draft.kind,
          content,
          alt: draft.alt.trim() || undefined,
          date: draft.date,
          active: draft.active,
          order,
        }),
      );
      if (draft.active) {
        for (const other of items) {
          if (other.id !== id && other.era === draft.era && other.active) batch.update(doc(db, "signals", other.id), { active: false });
        }
      }
      await batch.commit();
    } catch {
      toast.error("No se pudo guardar. Revisa tu conexión y tus permisos.");
      setSaving(false);
      return;
    }
    const refreshed = await refreshSite();
    if (refreshed.ok) toast.success("Guardado");
    else toast.error(`Guardado, pero el sitio no se actualizó: ${refreshed.error}`);
    setSaving(false);
    setDraft(null);
  };

  if (loading) return <p className={styles.message}>Cargando señales…</p>;
  if (error) return <p className={styles.message}>{error}</p>;

  const contentMissing = touched && !draft?.content.trim();

  return (
    <div className={styles.stack}>
      {!draft ? (
        <div>
          <Button
            onClick={() =>
              open({ id: "", era: NEBULAS[0]?.id ?? "", kind: "frase", content: "", alt: "", date: today(), active: false })
            }
          >
            Nueva señal
          </Button>
        </div>
      ) : null}

      {draft ? (
        <div className={styles.editor}>
          <h2 className={styles.editorTitle}>{draft.id ? "Editar señal" : "Nueva señal"}</h2>
          <div className={styles.grid2}>
            <Field label="Nebulosa (era)" type="select" options={ERA_OPTIONS} value={draft.era} onChange={(era) => set({ era })} />
            <Field
              label="Tipo"
              type="select"
              options={KIND_OPTIONS}
              value={draft.kind}
              onChange={(kind) => set({ kind: kind as SignalKind, content: "" })}
              hint="Cambiar el tipo vacía el contenido."
            />
          </div>
          {draft.kind === "frase" ? (
            <Field
              label="Frase"
              type="textarea"
              rows={4}
              required
              value={draft.content}
              onChange={(content) => set({ content })}
              error={contentMissing ? "Escribe la frase." : null}
            />
          ) : (
            <>
              <MediaUpload
                kind={draft.kind === "imagen" ? "image" : "video"}
                label={draft.kind === "imagen" ? "Imagen" : "Video"}
                folder="senales"
                value={draft.content || undefined}
                onUploaded={(media) => set({ content: media.url })}
              />
              {contentMissing ? <p className={styles.meta}>Sube un archivo.</p> : null}
              <Field
                label="Texto alternativo"
                required={draft.kind === "imagen"}
                value={draft.alt}
                onChange={(alt) => set({ alt })}
                hint="Describe lo que se ve, para lectores de pantalla."
                error={touched && draft.kind === "imagen" && !draft.alt.trim() ? "Describe la imagen." : null}
              />
            </>
          )}
          <Field label="Fecha" type="date" required value={draft.date} onChange={(date) => set({ date })} error={touched && !draft.date ? "Elige la fecha." : null} />
          <Field
            label="Activa"
            type="checkbox"
            value={draft.active}
            onChange={(active) => set({ active })}
            hint="Solo una señal está activa por nebulosa: al activar esta, se desactivan las demás de la misma era."
          />

          <div className={styles.preview}>
            <p className={styles.previewTitle}>Vista previa · transmisión</p>
            <SignalView kind={draft.kind} content={draft.content} alt={draft.alt} />
          </div>

          <div className={styles.formActions}>
            <Button onClick={() => void submit()} disabled={saving}>
              {saving ? "Guardando…" : "Guardar señal"}
            </Button>
            <Button variant="quiet" onClick={() => setDraft(null)} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <p className={styles.message}>Todavía no hay señales. Si esperabas verlas, primero importa el contenido (Importar).</p>
      ) : (
        <ul className={styles.cards}>
          {sorted.map((s) => (
            <li key={s.id} className={styles.card}>
              <p className={styles.cardTitle}>
                <span className={`${styles.badge} ${s.active ? styles.badgeOn : ""}`}>{s.active ? "Activa" : "Inactiva"}</span>{" "}
                {KIND_LABELS[s.kind]} · {s.date}
              </p>
              <p className={styles.meta}>{s.kind === "frase" ? s.content : (s.alt ?? s.content)}</p>
              <div className={styles.actions}>
                <Button
                  variant="quiet"
                  small
                  onClick={() =>
                    open({
                      id: s.id,
                      era: s.era,
                      kind: s.kind,
                      content: s.content,
                      alt: s.alt ?? "",
                      date: s.date,
                      active: s.active,
                      order: s.order,
                    })
                  }
                >
                  Editar
                </Button>
                <ConfirmButton small question="¿Borrar esta señal?" onConfirm={() => remove(s.id).catch(() => undefined)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
