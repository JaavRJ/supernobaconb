"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/Button";
import { Field } from "@/components/admin/Field";
import { ListEditor } from "@/components/admin/ListEditor";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { useToast } from "@/components/admin/Toast";
import type { WithId } from "@/lib/admin/useAdminCollection";
import { stanzasToText, textToStanzas } from "@/lib/content/stanzas";
import type { WorkLink } from "@/types/content";
import {
  ID_PATTERN,
  PLATFORM_OPTIONS,
  TYPE_LABEL,
  formatDuration,
  isHttpUrl,
  nextOrder,
  parseDuration,
  type TrackDoc,
  type WorkDoc,
} from "./helpers";
import styles from "./Canciones.module.css";

interface CreditRow {
  name: string;
  /** Roles separados por coma */
  roles: string;
}

interface FormState {
  id: string;
  workId: string;
  number: number | null;
  title: string;
  duration: string;
  explicit: boolean;
  links: WorkLink[];
  audioUrl: string;
  lyrics: string;
  credits: CreditRow[];
}

/** La letra puede venir como texto (Firestore) o, por si acaso, como estrofas */
function lyricsText(lyrics: unknown): string {
  if (typeof lyrics === "string") return lyrics;
  if (Array.isArray(lyrics)) return stanzasToText(lyrics as string[][]);
  return "";
}

interface TrackFormProps {
  /** `null` = canción nueva */
  track: WithId<TrackDoc> | null;
  defaultWorkId: string;
  works: WithId<WorkDoc>[];
  allTracks: WithId<TrackDoc>[];
  onSave: (id: string, doc: TrackDoc) => Promise<void>;
  onCancel: () => void;
}

/** Formulario de una canción: datos, links, audio, letra por estrofas y créditos. */
export function TrackForm({ track, defaultWorkId, works, allTracks, onSave, onCancel }: TrackFormProps) {
  const toast = useToast();
  const [state, setState] = useState<FormState>(() => {
    if (track) {
      return {
        id: track.id,
        workId: track.workId,
        number: track.number,
        title: track.title,
        duration: formatDuration(track.durationSec),
        explicit: track.explicit === true,
        links: Array.isArray(track.links) ? track.links : [],
        audioUrl: track.audioUrl ?? "",
        lyrics: lyricsText(track.lyrics),
        credits: (Array.isArray(track.credits) ? track.credits : []).map((c) => ({
          name: c.name,
          roles: (c.roles ?? []).join(", "),
        })),
      };
    }
    const siblings = allTracks.filter((t) => t.workId === defaultWorkId);
    return {
      id: "",
      workId: defaultWorkId,
      number: siblings.length ? Math.max(...siblings.map((t) => t.number)) + 1 : 1,
      title: "",
      duration: "",
      explicit: false,
      links: [],
      audioUrl: "",
      lyrics: "",
      credits: [],
    };
  });
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  /** Duración que reportó Cloudinary al subir el audio, si difiere de la escrita */
  const [suggested, setSuggested] = useState<number | null>(null);

  const patch = (next: Partial<FormState>) => setState((s) => ({ ...s, ...next }));
  const isNew = track === null;
  const stanzas = useMemo(() => textToStanzas(state.lyrics), [state.lyrics]);
  const verses = stanzas.reduce((n, s) => n + s.length, 0);

  const idError = !isNew
    ? null
    : !state.id
      ? "Escribe el id."
      : !ID_PATTERN.test(state.id)
        ? "Solo minúsculas, números y guiones."
        : allTracks.some((t) => t.id === state.id)
          ? "Ya existe una canción con ese id."
          : null;
  const titleError = state.title.trim() ? null : "Escribe el título.";
  const numberError =
    state.number === null || !Number.isInteger(state.number) || state.number < 1 ? "Escribe un número entero desde 1." : null;
  const durationError = parseDuration(state.duration) === null ? "Usa el formato mm:ss, por ejemplo 2:47." : null;
  const linkErrors = state.links.map((l) => (isHttpUrl(l.url) ? null : "Escribe la URL completa (https://…)."));
  const creditErrors = state.credits.map((c) => (c.name.trim() ? null : "Escribe el nombre."));
  const invalid =
    Boolean(idError || titleError || numberError || durationError) ||
    linkErrors.some(Boolean) ||
    creditErrors.some(Boolean);

  const submit = async () => {
    setShowErrors(true);
    if (invalid) {
      toast.error("Revisa los campos marcados.");
      return;
    }
    const durationSec = parseDuration(state.duration) as number;
    const credits = state.credits.map((c) => ({
      name: c.name.trim(),
      roles: c.roles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
    }));
    const lyrics = stanzasToText(textToStanzas(state.lyrics));
    // Se parte del documento original para conservar `order` y cualquier campo que este formulario no toque
    // (el hook quita el `id` del documento al guardar)
    const doc: TrackDoc = {
      ...track,
      workId: state.workId,
      number: state.number as number,
      title: state.title.trim(),
      durationSec,
      explicit: state.explicit,
      links: state.links.map((l) => ({ ...l, url: l.url.trim() })),
      audioUrl: state.audioUrl.trim() || undefined,
      lyrics: lyrics || undefined,
      credits: credits.length ? credits : undefined,
      order: track?.order ?? nextOrder(allTracks),
    };
    setSaving(true);
    try {
      await onSave(track?.id ?? state.id, doc);
      onCancel();
    } catch {
      // useAdminCollection ya avisó del error; se deja el formulario abierto
      setSaving(false);
    }
  };

  const workOptions = works.map((w) => ({
    value: w.id,
    label: `${w.title} (${TYPE_LABEL[w.type] ?? w.type})`,
  }));
  if (!workOptions.some((o) => o.value === state.workId)) {
    workOptions.unshift({ value: state.workId, label: `${state.workId} (obra no encontrada)` });
  }

  return (
    <section className={styles.form} aria-label={isNew ? "Nueva canción" : `Editar ${track.title}`}>
      <h3 className={styles.formTitle}>{isNew ? "Nueva canción" : `Editar «${track.title}»`}</h3>

      <div className={styles.grid}>
        {isNew ? (
          <Field
            label="Id"
            required
            value={state.id}
            hint="Se usa en el link y no se puede cambiar después. Solo a-z, 0-9 y guiones."
            error={showErrors ? idError : null}
            onChange={(id) => patch({ id: id.toLowerCase() })}
          />
        ) : null}
        <Field
          label="Obra"
          type="select"
          value={state.workId}
          options={workOptions}
          onChange={(workId) => patch({ workId })}
        />
        <Field
          label="Número"
          type="number"
          required
          min={1}
          step={1}
          value={state.number}
          error={showErrors ? numberError : null}
          onChange={(number) => patch({ number })}
        />
        <Field
          label="Duración (mm:ss)"
          required
          placeholder="2:47"
          value={state.duration}
          error={showErrors ? durationError : null}
          onChange={(duration) => patch({ duration })}
        />
      </div>
      <Field label="Título" required value={state.title} error={showErrors ? titleError : null} onChange={(title) => patch({ title })} />
      <Field label="Letra explícita" type="checkbox" value={state.explicit} onChange={(explicit) => patch({ explicit })} />

      <div className={styles.block}>
        <p className={styles.legend}>Links por plataforma</p>
        <ListEditor<WorkLink>
          items={state.links}
          onChange={(links) => patch({ links })}
          newItem={() => ({ platform: "spotify", url: "" })}
          addLabel="Agregar link"
          itemName="link"
          emptyText="Sin links."
          renderItem={(link, index, update) => (
            <div className={styles.platformRow}>
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
                placeholder="https://…"
                error={showErrors ? linkErrors[index] : null}
                onChange={(url) => update({ ...link, url })}
              />
            </div>
          )}
        />
      </div>

      <div className={styles.block}>
        <MediaUpload
          kind="audio"
          label="Audio (MP3)"
          folder="audios"
          value={state.audioUrl || undefined}
          onUploaded={(media) => {
            patch({ audioUrl: media.url });
            const sec = media.duration ? Math.round(media.duration) : null;
            setSuggested(sec && sec !== parseDuration(state.duration) ? sec : null);
          }}
        />
        {suggested !== null ? (
          <p className={styles.suggest}>
            El audio dura {formatDuration(suggested)}.
            <Button
              variant="quiet"
              small
              onClick={() => {
                patch({ duration: formatDuration(suggested) });
                setSuggested(null);
              }}
            >
              Usar como duración
            </Button>
          </p>
        ) : null}
        {state.audioUrl ? (
          <div>
            <Button variant="quiet" small onClick={() => patch({ audioUrl: "" })}>
              Quitar audio
            </Button>
          </div>
        ) : null}
      </div>

      <div className={`${styles.block} ${styles.lyrics}`}>
        <Field
          label="Letra"
          type="textarea"
          rows={16}
          value={state.lyrics}
          hint="Un verso por línea. Deja una línea en blanco entre estrofas."
          onChange={(lyrics) => patch({ lyrics })}
        />
        {stanzas.length > 0 ? (
          <div className={styles.preview} aria-label="Vista previa de la letra">
            <p className={styles.meta}>
              Vista previa: {stanzas.length} {stanzas.length === 1 ? "estrofa" : "estrofas"}, {verses}{" "}
              {verses === 1 ? "verso" : "versos"}
            </p>
            {stanzas.map((stanza, i) => (
              <p key={i} className={styles.stanza}>
                {stanza.map((line, j) => (
                  <span key={j}>{line}</span>
                ))}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.block}>
        <p className={styles.legend}>Créditos</p>
        <ListEditor<CreditRow>
          items={state.credits}
          onChange={(credits) => patch({ credits })}
          newItem={() => ({ name: "", roles: "" })}
          addLabel="Agregar persona"
          itemName="crédito"
          emptyText="Sin créditos."
          renderItem={(credit, index, update) => (
            <div className={styles.creditRow}>
              <Field
                label="Persona"
                value={credit.name}
                error={showErrors ? creditErrors[index] : null}
                onChange={(name) => update({ ...credit, name })}
              />
              <Field
                label="Roles"
                value={credit.roles}
                placeholder="Composición, Letra, Producción"
                hint="Separados por coma."
                onChange={(roles) => update({ ...credit, roles })}
              />
            </div>
          )}
        />
      </div>

      <div className={styles.row}>
        <Button onClick={submit} disabled={saving}>
          {saving ? "Guardando…" : "Guardar canción"}
        </Button>
        <Button variant="quiet" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </section>
  );
}
