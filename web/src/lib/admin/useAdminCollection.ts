"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { withoutUndefined } from "./clean";
import { refreshSite } from "./refresh";

export type WithId<T> = T & { id: string };

/**
 * Lista en vivo de una colección de Firestore (SDK del cliente) con guardar y borrar.
 * Tras guardar o borrar pide al servidor que el sitio se actualice y avisa del resultado.
 */
export function useAdminCollection<T extends object>(name: string) {
  const toast = useToast();
  const [items, setItems] = useState<WithId<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      try {
        const [{ collection, onSnapshot }, { getDb }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);
        if (cancelled) return;
        unsubscribe = onSnapshot(
          collection(getDb(), name),
          (snap) => {
            setItems(snap.docs.map((d) => ({ ...(d.data() as T), id: d.id })));
            setError(null);
            setLoading(false);
          },
          () => {
            setError("No se pudo leer la lista. Revisa tu conexión y tus permisos.");
            setLoading(false);
          },
        );
      } catch {
        if (!cancelled) {
          setError("No se pudo conectar con Firestore.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [name]);

  const afterWrite = useCallback(
    async (done: string) => {
      const refreshed = await refreshSite();
      if (refreshed.ok) toast.success(done);
      else toast.error(`${done}, pero el sitio no se actualizó: ${refreshed.error}`);
    },
    [toast],
  );

  /** Crea o reemplaza el documento `id`. Si falla avisa y lanza el error. */
  const save = useCallback(
    async (id: string, data: T) => {
      try {
        const [{ doc, setDoc }, { getDb }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);
        const rest: Record<string, unknown> = { ...(data as Record<string, unknown>) };
        delete rest.id;
        await setDoc(doc(getDb(), name, id), withoutUndefined(rest));
      } catch {
        toast.error("No se pudo guardar. Revisa tu conexión y tus permisos.");
        throw new Error("No se pudo guardar.");
      }
      await afterWrite("Guardado");
    },
    [name, toast, afterWrite],
  );

  /** Borra el documento `id`. Si falla avisa y lanza el error. */
  const remove = useCallback(
    async (id: string) => {
      try {
        const [{ doc, deleteDoc }, { getDb }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);
        await deleteDoc(doc(getDb(), name, id));
      } catch {
        toast.error("No se pudo borrar. Revisa tu conexión y tus permisos.");
        throw new Error("No se pudo borrar.");
      }
      await afterWrite("Borrado");
    },
    [name, toast, afterWrite],
  );

  return { items, loading, error, save, remove };
}
