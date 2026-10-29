"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { useAdminCollection, type WithId } from "@/lib/admin/useAdminCollection";
import { TrackForm } from "./TrackForm";
import { VideosSection } from "./VideosSection";
import { TRACK_WORK_TYPES, TYPE_LABEL, formatDuration, type TrackDoc, type WorkDoc } from "./helpers";
import styles from "./Canciones.module.css";

/** `workId: null` = canción nueva; si no, id de la canción que se edita */
type Editing = { trackId: string; workId: string } | { trackId: null; workId: string };

interface Group {
  key: string;
  title: string;
  meta: string;
  /** Obra a la que se agregan canciones nuevas; las huérfanas no tienen */
  workId: string | null;
  tracks: WithId<TrackDoc>[];
}

/** Admin de canciones por sencillo, EP o álbum, y de los videos extra. */
export function CancionesAdmin() {
  const works = useAdminCollection<WorkDoc>("works");
  const tracks = useAdminCollection<TrackDoc>("tracks");
  const [editing, setEditing] = useState<Editing | null>(null);

  const musicWorks = useMemo(
    () =>
      works.items
        .filter((w) => TRACK_WORK_TYPES.includes(w.type))
        .sort((a, b) => (b.releaseDate ?? "9999").localeCompare(a.releaseDate ?? "9999") || a.title.localeCompare(b.title)),
    [works.items],
  );

  const groups = useMemo<Group[]>(() => {
    const byNumber = (list: WithId<TrackDoc>[]) => [...list].sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
    const result: Group[] = musicWorks.map((w) => ({
      key: w.id,
      title: w.title,
      meta: `${TYPE_LABEL[w.type] ?? w.type}${w.hidden ? " · oculta" : ""}`,
      workId: w.id,
      tracks: byNumber(tracks.items.filter((t) => t.workId === w.id)),
    }));
    const known = new Set(musicWorks.map((w) => w.id));
    const orphans = tracks.items.filter((t) => !known.has(t.workId));
    if (orphans.length) {
      result.push({
        key: "otras",
        title: "Otras canciones",
        meta: "Su obra no es un sencillo, EP ni álbum, o ya no existe",
        workId: null,
        tracks: byNumber(orphans),
      });
    }
    return result;
  }, [musicWorks, tracks.items]);

  const loading = works.loading || tracks.loading;
  const error = works.error ?? tracks.error;
  const empty = !loading && !error && tracks.items.length === 0;

  const formFor = (track: WithId<TrackDoc> | null, defaultWorkId: string) => (
    <TrackForm
      key={track?.id ?? `new-${defaultWorkId}`}
      track={track}
      defaultWorkId={defaultWorkId}
      works={musicWorks}
      allTracks={tracks.items}
      onSave={tracks.save}
      onCancel={() => setEditing(null)}
    />
  );

  return (
    <AdminPage
      title="Canciones"
      description="Las canciones de cada sencillo, EP o álbum: datos, audio, letra por estrofas y créditos. También los videos extra."
    >
      {loading ? <p className={styles.note}>Cargando…</p> : null}
      {error ? <p className={styles.alert}>{error}</p> : null}
      {empty ? (
        <p className={styles.alert}>
          Todavía no hay canciones en Firestore. Primero importa el contenido (<Link href="/admin/importar">Importar</Link>).
        </p>
      ) : null}
      {!loading && !error && !empty && musicWorks.length === 0 ? (
        <p className={styles.alert}>
          No hay obras de tipo sencillo, EP o álbum. Importa el contenido (<Link href="/admin/importar">Importar</Link>) o crea la obra primero.
        </p>
      ) : null}

      <div className={styles.stack}>
        {groups.map((group) => (
          <section key={group.key} className={styles.group} aria-label={group.title}>
            <div className={styles.groupHead}>
              <div>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                <p className={styles.meta}>{group.meta}</p>
              </div>
              {group.workId ? (
                <Button
                  small
                  disabled={Boolean(editing)}
                  onClick={() => setEditing({ trackId: null, workId: group.workId as string })}
                >
                  Nueva canción
                </Button>
              ) : null}
            </div>

            {group.tracks.length === 0 ? <p className={styles.note}>Esta obra todavía no tiene canciones.</p> : null}
            <ul className={styles.tracks}>
              {group.tracks.map((track) =>
                editing?.trackId === track.id ? (
                  <li key={track.id}>{formFor(track, track.workId)}</li>
                ) : (
                  <li key={track.id} className={styles.track}>
                    <div className={styles.trackInfo}>
                      <span className={styles.trackTitle}>
                        {track.number}. {track.title}
                        {track.explicit ? " (E)" : ""}
                      </span>
                      <span className={styles.meta}>
                        {formatDuration(track.durationSec)} · {track.audioUrl ? "con audio" : "sin audio"} ·{" "}
                        {track.lyrics ? "con letra" : "sin letra"} · id: {track.id}
                      </span>
                    </div>
                    <div className={styles.row}>
                      <Button
                        variant="quiet"
                        small
                        disabled={Boolean(editing)}
                        onClick={() => setEditing({ trackId: track.id, workId: track.workId })}
                      >
                        Editar
                      </Button>
                      <ConfirmButton
                        small
                        disabled={Boolean(editing)}
                        question="¿Borrar esta canción?"
                        onConfirm={() => tracks.remove(track.id).catch(() => undefined)}
                      />
                    </div>
                  </li>
                ),
              )}
            </ul>
            {editing?.trackId === null && editing.workId === group.workId ? formFor(null, editing.workId) : null}
          </section>
        ))}
      </div>

      <VideosSection works={works.items} tracks={tracks.items} ready={!loading && !error} />
    </AdminPage>
  );
}
