"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/admin/Button";
import { useToast } from "@/components/admin/Toast";
import { refreshSite } from "@/lib/admin/refresh";
import type { SeedDoc } from "@/lib/content/seed";
import styles from "./Importar.module.css";

/** Máximo de escrituras por lote (Firestore admite 500) */
const BATCH_SIZE = 400;

const LABELS: Record<string, string> = {
  works: "Obras",
  threads: "Hilos",
  tracks: "Canciones",
  signals: "Señales de la nebulosa",
  videos: "Videos extra",
  photos: "Fotos",
  products: "Productos",
  diary: "Diario del proceso",
  writings: "Escritos",
  projectDetails: "Fichas de proyecto",
  site: "Sobre mí y redes (site/about)",
};

/** Una colección de Firestore con los documentos que la semilla local le pondría */
interface Target {
  collection: string;
  label: string;
  docs: SeedDoc[];
}

/** Ids que ya hay en Firestore por colección, o el error al leerla */
type Remote = Record<string, { ids: Set<string> } | { error: string }>;

type Outcome = { written: number; error?: string };

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; targets: Target[]; remote: Remote };

function errorMessage(error: unknown, action: string): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === "permission-denied") {
    return `Firestore no te dejó ${action}. Revisa que tu cuenta sea admin y que las reglas estén publicadas.`;
  }
  return `No se pudo ${action}. Revisa tu conexión e inténtalo de nuevo.`;
}

async function fetchState(): Promise<State> {
  try {
    const targets = await loadTargets();
    const remote = await loadRemote(targets);
    return { status: "ready", targets, remote };
  } catch {
    return { status: "error", message: "No se pudo conectar con Firestore. Revisa tu conexión e inténtalo de nuevo." };
  }
}

async function loadTargets(): Promise<Target[]> {
  const { getLocalSeed, CONTENT_COLLECTIONS } = await import("@/lib/content/seed");
  const seed = getLocalSeed();
  return [
    ...CONTENT_COLLECTIONS.map((name) => ({
      collection: name,
      label: LABELS[name] ?? name,
      docs: seed.collections[name],
    })),
    { collection: "site", label: LABELS.site, docs: [seed.about] },
  ];
}

async function loadRemote(targets: Target[]): Promise<Remote> {
  const [{ collection, getDocs }, { getDb }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase"),
  ]);
  const db = getDb();
  const entries = await Promise.all(
    targets.map(async (t): Promise<[string, Remote[string]]> => {
      try {
        const snap = await getDocs(collection(db, t.collection));
        return [t.collection, { ids: new Set(snap.docs.map((d) => d.id)) }];
      } catch (error) {
        return [t.collection, { error: errorMessage(error, "leer esta colección") }];
      }
    }),
  );
  return Object.fromEntries(entries);
}

/** Importa la semilla local a Firestore: lo que falta, o todo reemplazando lo que ya hay. */
export function Importar() {
  const toast = useToast();
  const [state, setState] = useState<State>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [confirmingReplace, setConfirmingReplace] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await fetchState();
      if (!cancelled) setState(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (state.status !== "ready") return [];
    return state.targets.map((t) => {
      const r = state.remote[t.collection];
      const ids = r && "ids" in r ? r.ids : null;
      return {
        target: t,
        local: t.docs.length,
        remoteCount: ids ? ids.size : null,
        missing: ids ? t.docs.filter((d) => !ids.has(d.id)).length : null,
        readError: r && "error" in r ? r.error : null,
      };
    });
  }, [state]);

  const totalMissing = rows.reduce((sum, r) => sum + (r.missing ?? 0), 0);
  const totalLocal = rows.reduce((sum, r) => sum + r.local, 0);

  async function run(mode: "missing" | "all") {
    if (state.status !== "ready") return;
    setBusy(true);
    setConfirmingReplace(false);
    setOutcomes({});

    const jobs = state.targets.map((t) => {
      const r = state.remote[t.collection];
      const ids = r && "ids" in r ? r.ids : new Set<string>();
      return { target: t, docs: mode === "all" ? t.docs : t.docs.filter((d) => !ids.has(d.id)) };
    });
    const total = jobs.reduce((sum, j) => sum + j.docs.length, 0);
    let done = 0;
    setProgress({ done, total });

    const result: Record<string, Outcome> = {};
    try {
      const [{ doc, writeBatch }, { getDb }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase"),
      ]);
      const db = getDb();
      for (const job of jobs) {
        if (job.docs.length === 0) continue;
        let written = 0;
        try {
          for (let i = 0; i < job.docs.length; i += BATCH_SIZE) {
            const chunk = job.docs.slice(i, i + BATCH_SIZE);
            const batch = writeBatch(db);
            for (const item of chunk) batch.set(doc(db, job.target.collection, item.id), item.data);
            await batch.commit();
            written += chunk.length;
            done += chunk.length;
            setProgress({ done, total });
          }
          result[job.target.collection] = { written };
        } catch (error) {
          result[job.target.collection] = { written, error: errorMessage(error, "escribir esta colección") };
        }
      }
    } catch {
      toast.error("No se pudo conectar con Firestore.");
    }

    setOutcomes(result);
    setProgress(null);

    const failed = Object.values(result).some((o) => o.error);
    const written = Object.values(result).reduce((sum, o) => sum + o.written, 0);
    if (written > 0) {
      const refreshed = await refreshSite();
      if (failed) toast.error("Se importó solo una parte; revisa los avisos de la tabla.");
      else if (refreshed.ok) toast.success(`Listo: ${written} documentos importados y el sitio se actualizó.`);
      else toast.error(`Se importaron ${written} documentos, pero el sitio no se actualizó: ${refreshed.error}`);
    } else if (failed) {
      toast.error("No se pudo importar. Revisa los avisos de la tabla.");
    } else {
      toast.success("No había nada que importar.");
    }

    setState(await fetchState());
    setBusy(false);
  }

  function status(row: (typeof rows)[number]) {
    const outcome = outcomes[row.target.collection];
    if (outcome?.error) return <span className={styles.bad}>{outcome.error}</span>;
    if (outcome) return <span className={styles.ok}>Importados {outcome.written}</span>;
    if (row.readError) return <span className={styles.bad}>{row.readError}</span>;
    if (row.missing === 0) return <span className={styles.ok}>Al día</span>;
    return <span className={styles.missing}>Faltan {row.missing}</span>;
  }

  return (
    <AdminPage
      title="Importar"
      description="Copia el contenido que viene con el sitio (obras, canciones, fotos, textos…) a Firestore para poder editarlo aquí. Solo agrega lo que falta, así que es seguro repetirlo."
      actions={
        <Button onClick={() => void run("missing")} disabled={busy || state.status !== "ready" || totalMissing === 0}>
          {busy ? "Importando…" : "Importar lo que falta"}
        </Button>
      }
    >
      {state.status === "loading" ? <p className={styles.message}>Comparando con Firestore…</p> : null}
      {state.status === "error" ? (
        <p className={styles.message} role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === "ready" ? (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Colección</th>
                  <th scope="col">En la semilla local</th>
                  <th scope="col">En Firestore</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.target.collection}>
                    <td>{r.target.label}</td>
                    <td className={styles.num}>{r.local}</td>
                    <td className={styles.num}>{r.remoteCount ?? "—"}</td>
                    <td>{status(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className={styles.cards}>
            {rows.map((r) => (
              <li key={r.target.collection} className={styles.card}>
                <span className={styles.cardName}>{r.target.label}</span>
                <span className={styles.cardMeta}>
                  Local {r.local} · Firestore {r.remoteCount ?? "—"}
                </span>
                {status(r)}
              </li>
            ))}
          </ul>

          <p className={styles.progress} aria-live="polite">
            {progress
              ? `Importando… ${progress.done} de ${progress.total} documentos`
              : totalMissing === 0
                ? "Todo lo local ya está en Firestore."
                : `Faltan ${totalMissing} de ${totalLocal} documentos.`}
          </p>

          <div className={styles.danger}>
            <p>
              <strong>Reemplazar todo con la versión local.</strong> Vuelve a escribir los {totalLocal} documentos de la
              semilla aunque ya existan. Esto reemplaza lo que ya editaste en el admin. No borra documentos que hayas
              creado tú.
            </p>
            {confirmingReplace ? (
              <div className={styles.actions}>
                <Button variant="danger" disabled={busy} onClick={() => void run("all")}>
                  Sí, reemplazar lo que ya editaste
                </Button>
                <Button variant="quiet" disabled={busy} onClick={() => setConfirmingReplace(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className={styles.actions}>
                <Button variant="danger" disabled={busy} onClick={() => setConfirmingReplace(true)}>
                  Reemplazar todo con la versión local
                </Button>
              </div>
            )}
          </div>
        </>
      ) : null}
    </AdminPage>
  );
}
