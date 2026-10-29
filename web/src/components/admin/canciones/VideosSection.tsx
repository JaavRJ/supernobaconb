"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Field } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toast";
import { useAdminCollection, type WithId } from "@/lib/admin/useAdminCollection";
import { isYoutubeUrl, nextOrder, slugify, type TrackDoc, type VideoDoc, type WorkDoc } from "./helpers";
import styles from "./Canciones.module.css";

interface VideosSectionProps {
  works: WithId<WorkDoc>[];
  tracks: WithId<TrackDoc>[];
  /** Las obras y canciones ya cargaron */
  ready: boolean;
}

interface Draft {
  /** `null` = video nuevo */
  id: string | null;
  title: string;
  url: string;
  workId: string;
  date: string;
  base: VideoDoc | null;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Videos extra (colección `videos`) y, de solo lectura, los que se derivan de los links de YouTube de las canciones. */
export function VideosSection({ works, tracks, ready }: VideosSectionProps) {
  const toast = useToast();
  const { items, loading, error, save, remove } = useAdminCollection<VideoDoc>("videos");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const workTitle = (id: string) => works.find((w) => w.id === id)?.title ?? id;
  const sorted = [...items].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const workOptions = [...works].sort((a, b) => a.title.localeCompare(b.title)).map((w) => ({ value: w.id, label: w.title }));

  const derived = tracks
    .map((t) => ({ track: t, url: t.links?.find((l) => l.platform === "youtube")?.url }))
    .filter((d): d is { track: WithId<TrackDoc>; url: string } => Boolean(d.url));

  const startNew = () => {
    setShowErrors(false);
    setDraft({ id: null, title: "", url: "", workId: workOptions[0]?.value ?? "", date: today(), base: null });
  };

  const startEdit = (video: WithId<VideoDoc>) => {
    setShowErrors(false);
    setDraft({ id: video.id, title: video.title, url: video.url, workId: video.workId, date: video.date, base: video });
  };

  const patch = (next: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...next } : d));

  const titleError = draft && !draft.title.trim() ? "Escribe el título." : null;
  const urlError = draft && !isYoutubeUrl(draft.url) ? "Escribe un link de YouTube (youtube.com/watch?v=… o youtu.be/…)." : null;
  const workError = draft && !draft.workId ? "Elige la obra." : null;
  const dateError = draft && !/^\d{4}-\d{2}-\d{2}$/.test(draft.date) ? "Elige la fecha." : null;

  /** Id libre a partir del título; no choca con otros videos ni con ids de canciones (que el sitio prefiere) */
  const freeId = (title: string) => {
    const taken = new Set([...items.map((v) => v.id), ...tracks.map((t) => t.id)]);
    const base = slugify(title) || "video";
    let id = base;
    for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
    return id;
  };

  const submit = async () => {
    if (!draft) return;
    setShowErrors(true);
    if (titleError || urlError || workError || dateError) {
      toast.error("Revisa los campos marcados.");
      return;
    }
    const doc: VideoDoc = {
      ...draft.base,
      title: draft.title.trim(),
      url: draft.url.trim(),
      workId: draft.workId,
      date: draft.date,
      order: draft.base?.order ?? nextOrder(items),
    };
    setSaving(true);
    try {
      await save(draft.id ?? freeId(draft.title), doc);
      setDraft(null);
    } catch {
      // useAdminCollection ya avisó del error
    }
    setSaving(false);
  };

  return (
    <section className={styles.section} aria-labelledby="videos-title">
      <h2 className={styles.sectionTitle} id="videos-title">
        Videos
      </h2>
      <p className={styles.note}>
        La página de videos junta los de las canciones (salen solos de sus links de YouTube) y los extra que agregues aquí.
      </p>

      <div className={styles.row}>
        <Button onClick={startNew} disabled={loading || Boolean(error) || !ready || works.length === 0}>
          Nuevo video extra
        </Button>
      </div>

      {draft ? (
        <section className={styles.form} aria-label={draft.id ? "Editar video" : "Nuevo video"}>
          <h3 className={styles.formTitle}>{draft.id ? "Editar video" : "Nuevo video extra"}</h3>
          <Field label="Título" required value={draft.title} error={showErrors ? titleError : null} onChange={(title) => patch({ title })} />
          <Field
            label="URL de YouTube"
            type="url"
            required
            value={draft.url}
            placeholder="https://www.youtube.com/watch?v=…"
            error={showErrors ? urlError : null}
            onChange={(url) => patch({ url })}
          />
          <div className={styles.grid}>
            <Field
              label="Obra ligada"
              type="select"
              value={draft.workId}
              options={workOptions}
              error={showErrors ? workError : null}
              onChange={(workId) => patch({ workId })}
            />
            <Field label="Fecha" type="date" required value={draft.date} error={showErrors ? dateError : null} onChange={(date) => patch({ date })} />
          </div>
          <div className={styles.row}>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Guardando…" : "Guardar video"}
            </Button>
            <Button variant="quiet" onClick={() => setDraft(null)} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </section>
      ) : null}

      {loading ? <p className={styles.note}>Cargando…</p> : null}
      {error ? <p className={styles.alert}>{error}</p> : null}
      {!loading && !error && sorted.length === 0 ? <p className={styles.note}>Todavía no hay videos extra.</p> : null}

      <ul className={styles.tracks}>
        {sorted.map((video) => (
          <li key={video.id} className={styles.track}>
            <div className={styles.trackInfo}>
              <span className={styles.trackTitle}>{video.title}</span>
              <span className={styles.meta}>
                {workTitle(video.workId)} · {video.date} · {video.url}
              </span>
            </div>
            <div className={styles.row}>
              <Button variant="quiet" small onClick={() => startEdit(video)}>
                Editar
              </Button>
              <ConfirmButton small question="¿Borrar este video?" onConfirm={() => remove(video.id).catch(() => undefined)} />
            </div>
          </li>
        ))}
      </ul>

      <h3 className={styles.groupTitle}>Videos de las canciones</h3>
      <p className={styles.note}>
        Solo lectura. Para cambiarlos, edita el link de YouTube de la canción. Una canción sin link de YouTube no aparece en
        /videos.
      </p>
      {derived.length === 0 ? (
        <p className={styles.note}>Ninguna canción tiene link de YouTube.</p>
      ) : (
        <ul className={styles.derived}>
          {derived.map(({ track, url }) => (
            <li key={track.id}>
              <span>{track.title}</span>
              <span className={styles.meta}>
                {workTitle(track.workId)} · {url}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
