"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/admin/Button";
import { Field } from "@/components/admin/Field";
import {
  buildCsv,
  formatDate,
  interestLabel,
  isoDay,
  matches,
  toRow,
  type InterestFilter,
  type SubscriberRow,
} from "./csv";
import styles from "./Newsletter.module.css";

const FILTERS: { value: InterestFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "libro", label: "Libro" },
  { value: "musica", label: "Música" },
  { value: "novedades", label: "Novedades" },
];

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; rows: SubscriberRow[] };

function Tags({ row }: { row: SubscriberRow }) {
  return (
    <span className={styles.tags}>
      {row.interests.map((i) => (
        <span key={i} className={styles.tag}>
          {interestLabel(i)}
        </span>
      ))}
      {row.legacy ? <span className={`${styles.tag} ${styles.legacy}`}>sitio viejo</span> : null}
    </span>
  );
}

/** Lista de suscriptores (solo lectura) con filtros y descarga en CSV. */
export function Newsletter() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [filter, setFilter] = useState<InterestFilter>("todos");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [{ collection, getDocs }, { getDb }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);
        const snap = await getDocs(collection(getDb(), "subscribers"));
        if (cancelled) return;
        const rows = snap.docs
          .map((d) => toRow(d.id, d.data()))
          .sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt));
        setState({ status: "ready", rows });
      } catch (error) {
        if (cancelled) return;
        const code = (error as { code?: string } | null)?.code;
        setState({
          status: "error",
          message:
            code === "permission-denied"
              ? "Firestore no te deja leer la lista de suscriptores. Revisa que tu cuenta sea admin y que las reglas de Firestore estén publicadas."
              : "No se pudo leer la lista. Revisa tu conexión e inténtalo de nuevo.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => (state.status === "ready" ? state.rows : []), [state]);
  const visible = useMemo(() => rows.filter((r) => matches(r, filter, query)), [rows, filter, query]);
  const counts = useMemo(
    () =>
      FILTERS.filter((f) => f.value !== "todos").map((f) => ({
        ...f,
        total: rows.filter((r) => r.interests.includes(f.value)).length,
      })),
    [rows],
  );

  function download() {
    const blob = new Blob([buildCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `supernoba-suscriptores-${isoDay(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminPage
      title="Newsletter"
      description="Personas que pidieron avisos. Es solo lectura: aquí no se edita ni se borra a nadie."
      actions={
        <Button onClick={download} disabled={state.status !== "ready" || visible.length === 0}>
          Descargar CSV
        </Button>
      }
    >
      {state.status === "loading" ? <p className={styles.message}>Cargando suscriptores…</p> : null}
      {state.status === "error" ? (
        <p className={styles.message} role="alert">
          {state.message}
        </p>
      ) : null}
      {state.status === "ready" ? (
        <>
          <ul className={styles.stats}>
            <li className={styles.stat}>
              <span className={styles.statValue}>{rows.length}</span>
              <span className={styles.statLabel}>Suscriptores</span>
            </li>
            {counts.map((c) => (
              <li key={c.value} className={styles.stat}>
                <span className={styles.statValue}>{c.total}</span>
                <span className={styles.statLabel}>{c.label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.filters}>
            <Field
              type="select"
              label="Interés"
              value={filter}
              options={FILTERS}
              onChange={(v) => setFilter(v as InterestFilter)}
            />
            <Field label="Buscar" placeholder="Correo o nombre" value={query} onChange={setQuery} />
          </div>

          <p className={styles.count} aria-live="polite">
            {visible.length} de {rows.length} {rows.length === 1 ? "suscriptor" : "suscriptores"}
          </p>

          {visible.length === 0 ? (
            <p className={styles.message}>
              {rows.length === 0 ? "Todavía no hay suscriptores." : "Nadie coincide con ese filtro."}
            </p>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Correo</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Suscrito</th>
                      <th scope="col">Intereses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => (
                      <tr key={r.id}>
                        <td className={styles.email}>{r.email || "—"}</td>
                        <td>{r.name || "—"}</td>
                        <td>{formatDate(r.subscribedAt)}</td>
                        <td>
                          <Tags row={r} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className={styles.cards}>
                {visible.map((r) => (
                  <li key={r.id} className={styles.card}>
                    <span className={styles.email}>{r.email || "—"}</span>
                    <span className={styles.cardMeta}>
                      {r.name || "Sin nombre"} · {formatDate(r.subscribedAt)}
                    </span>
                    <Tags row={r} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : null}
    </AdminPage>
  );
}
