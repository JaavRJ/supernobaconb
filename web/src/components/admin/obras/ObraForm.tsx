"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Field } from "@/components/admin/Field";
import { ListEditor } from "@/components/admin/ListEditor";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { useToast } from "@/components/admin/Toast";
import { constellations, eras, getCurrentEra } from "@/content";
import type { ConstellationId, WorkLink, WorkType } from "@/types/content";
import {
  nextOrder,
  PLATFORM_OPTIONS,
  ROLE_OPTIONS,
  SLUG,
  smallCoverUrl,
  suggestHref,
  TYPE_OPTIONS,
  type WorkDoc,
} from "./obras";
import { SkyMap } from "./SkyMap";
import styles from "./Obras.module.css";

interface ObraFormProps {
  /** La obra a editar; `null` para crear una nueva */
  initial: WorkDoc | null;
  works: WorkDoc[];
  save: (id: string, data: WorkDoc) => Promise<void>;
  remove: (id: string) => Promise<void>;
  onClose: () => void;
}

interface References {
  threads: number;
  tracks: number;
}

/** Cuántos hilos y canciones apuntan a la obra (solo para avisar al borrar; no se borra en cascada). */
async function countReferences(workId: string): Promise<References> {
  const [{ collection, getDocs }, { getDb }] = await Promise.all([import("firebase/firestore"), import("@/lib/firebase")]);
  const db = getDb();
  const [threads, tracks] = await Promise.all([getDocs(collection(db, "threads")), getDocs(collection(db, "tracks"))]);
  return {
    threads: threads.docs.filter((d) => d.data().from === workId || d.data().to === workId).length,
    tracks: tracks.docs.filter((d) => d.data().workId === workId).length,
  };
}

const URL_START = /^https?:\/\//i;

/** Crear o editar una obra: datos, imágenes, links y posición en el cielo. */
export function ObraForm({ initial, works, save, remove, onClose }: ObraFormProps) {
  const toast = useToast();
  const isNew = initial === null;
  const [draft, setDraft] = useState<WorkDoc>(
    () =>
      initial ?? {
        id: "",
        title: "",
        constellation: "supernoba",
        type: "sencillo",
        era: getCurrentEra()?.id ?? eras[0].id,
        role: "orbita",
        summary: "",
        links: [],
        href: "",
      },
  );
  const [hrefTouched, setHrefTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [refs, setRefs] = useState<References | null>(null);
  const [refsError, setRefsError] = useState(false);

  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    countReferences(initial.id)
      .then((r) => {
        if (!cancelled) setRefs(r);
      })
      .catch(() => {
        if (!cancelled) setRefsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const set = (patch: Partial<WorkDoc>) => setDraft((d) => ({ ...d, ...patch }));

  /** Cambia id o tipo y, mientras la ruta no se haya tocado a mano, la ajusta a la sugerida. */
  const setIdentity = (patch: { id?: string; type?: WorkType }) =>
    setDraft((d) => {
      const next = { ...d, ...patch };
      return hrefTouched ? next : { ...next, href: suggestHref(next.type, next.id) };
    });

  const errors = {
    title: draft.title.trim() ? null : "Escribe el título.",
    id: !isNew
      ? null
      : !draft.id
        ? "Escribe el id."
        : !SLUG.test(draft.id)
          ? "Solo minúsculas, números y guiones."
          : works.some((w) => w.id === draft.id)
            ? "Ya existe una obra con ese id."
            : null,
    href: draft.href.startsWith("/") ? null : "La ruta empieza con /, por ejemplo /musica/mi-cancion.",
  };
  const linkInvalid = draft.links.some((l) => !URL_START.test(l.url.trim()));
  const invalid = Boolean(errors.title || errors.id || errors.href || linkInvalid);

  const submit = async () => {
    setShowErrors(true);
    if (invalid) {
      toast.error("Revisa los campos marcados.");
      return;
    }
    const data: WorkDoc = {
      ...draft,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      releaseDate: draft.releaseDate || undefined,
      dateApproximate: draft.releaseDate && draft.dateApproximate ? true : undefined,
      hidden: draft.hidden ? true : undefined,
      coverUrl: draft.coverUrl?.trim() || undefined,
      coverSmallUrl: draft.coverSmallUrl?.trim() || undefined,
      photoUrl: draft.photoUrl?.trim() || undefined,
      links: draft.links.map((l) => ({ ...l, url: l.url.trim(), label: l.label?.trim() || undefined })),
      order: isNew ? nextOrder(works) : draft.order,
    };
    setSaving(true);
    try {
      await save(draft.id, data);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const siblings = works.filter((w) => w.id !== draft.id);
  const refText =
    refs && (refs.threads > 0 || refs.tracks > 0)
      ? `Otras colecciones la usan: ${refs.threads} ${refs.threads === 1 ? "hilo" : "hilos"} y ${refs.tracks} ${refs.tracks === 1 ? "canción" : "canciones"}. No se borran con la obra: quedarían apuntando a algo que ya no existe.`
      : null;

  return (
    <div className={styles.form}>
      <div className={styles.topbar}>
        <Button variant="quiet" small onClick={onClose}>
          ← Volver a la lista
        </Button>
        <h2 className={styles.formTitle}>{isNew ? "Nueva obra" : draft.title || draft.id}</h2>
      </div>

      <section className={styles.block} aria-label="Datos">
        <Field
          label="Título"
          required
          value={draft.title}
          error={showErrors ? errors.title : null}
          onChange={(title) => set({ title })}
        />
        {isNew ? (
          <Field
            label="Id (slug)"
            required
            value={draft.id}
            hint="Es parte de la dirección y no se puede cambiar después."
            error={showErrors || draft.id ? errors.id : null}
            onChange={(id) => setIdentity({ id: id.trim() })}
          />
        ) : (
          <p className={styles.meta}>Id: {draft.id}</p>
        )}
        <div className={styles.grid}>
          <Field
            label="Constelación"
            type="select"
            value={draft.constellation}
            options={constellations.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) => set({ constellation: v as ConstellationId })}
          />
          <Field
            label="Tipo"
            type="select"
            value={draft.type}
            options={TYPE_OPTIONS}
            onChange={(v) => setIdentity({ type: v as WorkType })}
          />
          <Field
            label="Era"
            type="select"
            value={draft.era}
            options={eras.map((e) => ({ value: e.id, label: e.name ?? `${e.id} (sin nombre)` }))}
            onChange={(era) => set({ era })}
          />
          <Field
            label="Papel"
            type="select"
            value={draft.role}
            options={ROLE_OPTIONS}
            onChange={(v) => set({ role: v as "nucleo" | "orbita" })}
          />
        </div>
        <div className={styles.grid}>
          <Field
            label="Fecha de publicación"
            type="date"
            value={draft.releaseDate ?? ""}
            hint="Déjala vacía si aún no se publica."
            onChange={(releaseDate) => set({ releaseDate: releaseDate || undefined })}
          />
          <Field
            label="La fecha es aproximada"
            type="checkbox"
            value={Boolean(draft.dateApproximate)}
            disabled={!draft.releaseDate}
            onChange={(dateApproximate) => set({ dateApproximate })}
          />
        </div>
        <Field label="Resumen" type="textarea" rows={4} value={draft.summary} onChange={(summary) => set({ summary })} />
        <Field
          label="Ruta en el sitio"
          required
          value={draft.href}
          hint={isNew ? "Se sugiere según el tipo y el id; puedes editarla." : undefined}
          error={showErrors ? errors.href : null}
          onChange={(href) => {
            setHrefTouched(true);
            set({ href });
          }}
        />
        <Field
          label="Oculta (estrella secreta: no aparece en el cielo)"
          type="checkbox"
          value={Boolean(draft.hidden)}
          onChange={(hidden) => set({ hidden })}
        />
      </section>

      <section className={styles.block} aria-label="Imágenes">
        <h3 className={styles.blockTitle}>Imágenes</h3>
        <MediaUpload
          kind="image"
          label="Portada"
          folder="obras"
          value={draft.coverUrl}
          onUploaded={(m) => set({ coverUrl: m.url, coverSmallUrl: smallCoverUrl(m.url) })}
        />
        <Field
          label="Portada chica (512 px)"
          type="url"
          value={draft.coverSmallUrl ?? ""}
          hint="Se genera sola al subir la portada; solo cámbiala si usas otra imagen."
          onChange={(coverSmallUrl) => set({ coverSmallUrl: coverSmallUrl || undefined })}
        />
        <MediaUpload
          kind="image"
          label="Foto en blanco y negro (polaroid de la era)"
          folder="obras"
          value={draft.photoUrl}
          onUploaded={(m) => set({ photoUrl: m.url })}
        />
        {draft.coverUrl || draft.photoUrl ? (
          <div>
            <Button
              variant="quiet"
              small
              onClick={() => set({ coverUrl: undefined, coverSmallUrl: undefined, photoUrl: undefined })}
            >
              Quitar imágenes
            </Button>
          </div>
        ) : null}
      </section>

      <section className={styles.block} aria-label="Links">
        <h3 className={styles.blockTitle}>Links por plataforma</h3>
        <ListEditor<WorkLink>
          items={draft.links}
          onChange={(links) => set({ links })}
          newItem={() => ({ platform: "spotify", url: "" })}
          addLabel="Agregar link"
          itemName="link"
          emptyText="Sin links todavía."
          renderItem={(link, _i, update) => (
            <div className={styles.linkRow}>
              <Field
                label="Plataforma"
                type="select"
                value={link.platform}
                options={PLATFORM_OPTIONS}
                onChange={(platform) => update({ ...link, platform: platform as WorkLink["platform"] })}
              />
              <Field
                label="URL"
                type="url"
                value={link.url}
                placeholder="https://"
                error={showErrors && !URL_START.test(link.url.trim()) ? "Escribe una URL que empiece con http." : null}
                onChange={(url) => update({ ...link, url })}
              />
              <Field
                label="Etiqueta (opcional)"
                value={link.label ?? ""}
                onChange={(label) => update({ ...link, label: label || undefined })}
              />
            </div>
          )}
        />
      </section>

      <section className={styles.block} aria-label="Posición en el cielo">
        <h3 className={styles.blockTitle}>Posición en el cielo</h3>
        <SkyMap work={draft} others={siblings} onChange={(skyPosition) => set({ skyPosition })} />
      </section>

      {draft.parts && draft.parts.length > 0 ? (
        <p className={styles.meta}>Las partes del libro se editan en la sección Libro; aquí se conservan tal cual.</p>
      ) : null}

      <div className={styles.actions}>
        <Button onClick={submit} disabled={saving}>
          {saving ? "Guardando…" : isNew ? "Crear obra" : "Guardar cambios"}
        </Button>
        <Button variant="quiet" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        {!isNew ? (
          <ConfirmButton
            question={refText ? "¿Borrar aunque hilos o canciones la usan?" : "¿Borrar la obra de forma definitiva?"}
            disabled={saving}
            onConfirm={async () => {
              try {
                await remove(draft.id);
                onClose();
              } catch {
                // useAdminCollection ya avisó del error
              }
            }}
          >
            Borrar obra
          </ConfirmButton>
        ) : null}
      </div>
      {!isNew && refText ? <p className={styles.warn}>{refText}</p> : null}
      {!isNew && refsError ? (
        <p className={styles.meta}>No se pudo comprobar si hilos o canciones usan esta obra.</p>
      ) : null}
    </div>
  );
}
