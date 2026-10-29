"use client";

import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/admin/Button";
import { constellations } from "@/content";
import { useAdminCollection } from "@/lib/admin/useAdminCollection";
import { ObraForm } from "./ObraForm";
import { typeLabel, type WorkDoc } from "./obras";
import styles from "./Obras.module.css";

/** `null` = lista, `"new"` = obra nueva, otro valor = id de la obra que se edita */
type View = null | "new" | string;

function byOrderThenDate(a: WorkDoc, b: WorkDoc): number {
  return (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id);
}

/** Admin de obras: lista por constelación, edición y posición en el cielo. */
export function ObrasAdmin() {
  const { items, loading, error, save, remove } = useAdminCollection<WorkDoc>("works");
  const [view, setView] = useState<View>(null);
  // Copia de la obra al abrirla: así los cambios en vivo de la lista no pisan lo que se está escribiendo
  const [editing, setEditing] = useState<WorkDoc | null>(null);

  const open = (work: WorkDoc | null) => {
    setEditing(work);
    setView(work ? work.id : "new");
  };

  if (view !== null) {
    return (
      <AdminPage title="Obras" description="Datos de la obra, sus imágenes, sus links y su lugar en el cielo.">
        <ObraForm key={view} initial={editing} works={items} save={save} remove={remove} onClose={() => setView(null)} />
      </AdminPage>
    );
  }

  const empty = !loading && !error && items.length === 0;

  return (
    <AdminPage
      title="Obras"
      description="Cada obra es una estrella del cielo, dentro de su constelación."
      actions={
        empty ? null : (
          <Button onClick={() => open(null)} disabled={loading || Boolean(error)}>
            Nueva obra
          </Button>
        )
      }
    >
      {loading ? <p className={styles.meta}>Cargando…</p> : null}
      {error ? <p className={styles.alert}>{error}</p> : null}
      {empty ? <p className={styles.alert}>Primero importa el contenido (Importar): todavía no hay obras en Firestore.</p> : null}
      {constellations.map((c) => {
        const own = items.filter((w) => w.constellation === c.id).sort(byOrderThenDate);
        if (own.length === 0) return null;
        return (
          <section key={c.id} className={styles.group} aria-label={c.name}>
            <h2 className={styles.groupTitle}>
              {c.name} <span className={styles.facet}>{c.facet}</span>
            </h2>
            <ul className={styles.rows}>
              {own.map((w) => (
                <li key={w.id}>
                  <button type="button" className={styles.row} onClick={() => open(w)}>
                    {w.coverSmallUrl || w.coverUrl ? (
                      // Miniatura de Cloudinary en el admin: no necesita next/image
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.thumb} src={w.coverSmallUrl || w.coverUrl} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.thumb} aria-hidden="true" />
                    )}
                    <span className={styles.rowText}>
                      <span className={styles.rowTitle}>{w.title}</span>
                      <span className={styles.rowMeta}>
                        {typeLabel(w.type)} · {w.releaseDate ? `${w.releaseDate}${w.dateApproximate ? " (aprox.)" : ""}` : "sin fecha"}
                      </span>
                    </span>
                    <span className={styles.badges}>
                      {w.hidden ? <span className={styles.badge}>oculta</span> : null}
                      {!w.releaseDate ? <span className={styles.badge}>por publicar</span> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </AdminPage>
  );
}
