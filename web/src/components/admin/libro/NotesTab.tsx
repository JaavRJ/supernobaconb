"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Field } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toast";
import { refreshSite } from "@/lib/admin/refresh";
import { useAdminCollection } from "@/lib/admin/useAdminCollection";
import { deleteAuthorNote, freeNoteId, readPartText, writeAuthorNote, type AuthorNoteDoc } from "./data";
import { PART_OPTIONS } from "./parts";
import { visibleText, cleanBookHtml } from "./richText";
import styles from "./Libro.module.css";

type NoteFields = Omit<AuthorNoteDoc, "id">;

const TYPE_OPTIONS = [
  { value: "tooltip", label: "Breve (tarjeta al tocar la frase)" },
  { value: "modal", label: "Extensa (ventana)" },
];

const emptyNote = (partNumber: number): NoteFields => ({
  partNumber,
  chapterIndex: 0,
  triggerText: "",
  noteTitle: "",
  noteContent: "",
  type: "tooltip",
});

const normalize = (s: string) => s.replace(/[\s ]+/g, " ").trim();

/** Notas del autor (`authorNotes`): se disparan al tocar la primera aparición de su frase en la parte. */
export function NotesTab() {
  const toast = useToast();
  const { items, loading, error } = useAdminCollection<NoteFields>("authorNotes");
  const [filter, setFilter] = useState("all");
  /** `null` = sin formulario; `id: null` = nota nueva */
  const [editing, setEditing] = useState<{ id: string | null; fields: NoteFields } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [texts, setTexts] = useState<Record<number, string | null>>({});
  const requested = useRef(new Set<number>());

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => (a.partNumber ?? 0) - (b.partNumber ?? 0) || Number(a.id) - Number(b.id) || a.id.localeCompare(b.id),
      ),
    [items],
  );
  const visible = filter === "all" ? sorted : sorted.filter((n) => n.partNumber === Number(filter));

  const editingPart = editing?.fields.partNumber;
  useEffect(() => {
    if (editingPart === undefined || requested.current.has(editingPart)) return;
    requested.current.add(editingPart);
    readPartText(editingPart)
      .then((docs) => setTexts((t) => ({ ...t, [editingPart]: visibleText(cleanBookHtml(docs.html)) })))
      .catch(() => {
        requested.current.delete(editingPart);
        setTexts((t) => ({ ...t, [editingPart]: null }));
      });
  }, [editingPart]);

  const trigger = editing ? normalize(editing.fields.triggerText) : "";
  const partText = editingPart === undefined ? undefined : texts[editingPart];
  const missingInText = Boolean(trigger) && typeof partText === "string" && partText.length > 0 && !partText.includes(trigger);

  const nextId = () => {
    const numeric = items.map((n) => Number(n.id)).filter((n) => Number.isInteger(n));
    return (numeric.length ? Math.max(...numeric) : 0) + 1;
  };

  const startNew = () => {
    setShowErrors(false);
    setEditing({ id: null, fields: emptyNote(filter === "all" ? 1 : Number(filter)) });
  };

  const startEdit = (id: string) => {
    const note = items.find((n) => n.id === id);
    if (!note) return;
    setShowErrors(false);
    setEditing({
      id,
      fields: {
        partNumber: note.partNumber,
        chapterIndex: note.chapterIndex ?? 0,
        triggerText: note.triggerText ?? "",
        noteTitle: note.noteTitle ?? "",
        noteContent: note.noteContent ?? "",
        type: note.type === "modal" ? "modal" : "tooltip",
      },
    });
  };

  const patch = (next: Partial<NoteFields>) => setEditing((e) => (e ? { ...e, fields: { ...e.fields, ...next } } : e));

  const afterWrite = async (done: string) => {
    const refreshed = await refreshSite(["book", "content"]);
    if (refreshed.ok) toast.success(done);
    else toast.error(`${done}, pero el sitio no se actualizó: ${refreshed.error}`);
  };

  const save = async () => {
    if (!editing) return;
    setShowErrors(true);
    const f = editing.fields;
    if (!normalize(f.triggerText) || !f.noteTitle.trim() || !f.noteContent.trim()) {
      toast.error("Completa la frase, el título y el texto de la nota.");
      return;
    }
    setSaving(true);
    try {
      await writeAuthorNote({
        id: editing.id ?? (await freeNoteId(nextId())),
        ...f,
        triggerText: normalize(f.triggerText),
        noteTitle: f.noteTitle.trim(),
        noteContent: f.noteContent.trim(),
      });
    } catch {
      toast.error("No se pudo guardar. Revisa tu conexión y tus permisos.");
      setSaving(false);
      return;
    }
    setEditing(null);
    setSaving(false);
    await afterWrite("Nota guardada");
  };

  const remove = async (id: string) => {
    try {
      await deleteAuthorNote(id);
    } catch {
      toast.error("No se pudo borrar. Revisa tu conexión y tus permisos.");
      return;
    }
    if (editing?.id === id) setEditing(null);
    await afterWrite("Nota borrada");
  };

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Field
          label="Mostrar"
          type="select"
          value={filter}
          options={[{ value: "all", label: "Todas las partes" }, ...PART_OPTIONS]}
          onChange={setFilter}
        />
        <Button onClick={startNew} disabled={loading || Boolean(error)}>
          Nueva nota
        </Button>
      </div>

      {editing ? (
        <section className={styles.card} aria-label={editing.id ? "Editar nota" : "Nueva nota"}>
          <h2 className={styles.cardTitle}>{editing.id ? `Editar nota ${editing.id}` : "Nueva nota"}</h2>
          <Field
            label="Parte"
            type="select"
            value={String(editing.fields.partNumber)}
            options={PART_OPTIONS}
            onChange={(v) => patch({ partNumber: Number(v) })}
          />
          <Field
            label="Frase que la dispara"
            required
            value={editing.fields.triggerText}
            hint="Debe aparecer tal cual en el texto de la parte; la nota se ancla a su primera aparición."
            error={
              showErrors && !normalize(editing.fields.triggerText)
                ? "Escribe la frase."
                : missingInText
                  ? "Esa frase no aparece en el texto de esta parte; la nota no se mostrará."
                  : null
            }
            onChange={(triggerText) => patch({ triggerText })}
          />
          <Field
            label="Título"
            required
            value={editing.fields.noteTitle}
            error={showErrors && !editing.fields.noteTitle.trim() ? "Escribe el título." : null}
            onChange={(noteTitle) => patch({ noteTitle })}
          />
          <Field
            label="Texto"
            type="textarea"
            rows={6}
            required
            value={editing.fields.noteContent}
            error={showErrors && !editing.fields.noteContent.trim() ? "Escribe el texto." : null}
            onChange={(noteContent) => patch({ noteContent })}
          />
          <Field
            label="Tipo"
            type="select"
            value={editing.fields.type}
            options={TYPE_OPTIONS}
            onChange={(v) => patch({ type: v === "modal" ? "modal" : "tooltip" })}
          />
          <div className={styles.row}>
            <Button onClick={save} disabled={saving || loading || Boolean(error)}>
              {saving ? "Guardando…" : "Guardar nota"}
            </Button>
            <Button variant="quiet" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </section>
      ) : null}

      {loading ? <p className={styles.note}>Cargando…</p> : null}
      {error ? <p className={styles.alert}>{error}</p> : null}
      {!loading && !error && visible.length === 0 ? <p className={styles.note}>No hay notas para mostrar.</p> : null}

      <ul className={styles.cards}>
        {visible.map((note) => (
          <li key={note.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{note.noteTitle}</h3>
            <p className={styles.meta}>
              Parte {note.partNumber} · {note.type === "modal" ? "extensa" : "breve"} · frase: «{note.triggerText}»
            </p>
            <p className={styles.noteText}>{note.noteContent}</p>
            <div className={styles.row}>
              <Button variant="quiet" small onClick={() => startEdit(note.id)}>
                Editar
              </Button>
              <ConfirmButton small question="¿Borrar esta nota?" onConfirm={() => remove(note.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
