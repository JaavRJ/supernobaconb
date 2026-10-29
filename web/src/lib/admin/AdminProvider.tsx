"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** `offline`: no se pudo comprobar el permiso (red), distinto de no tenerlo */
export type AdminStatus = "loading" | "signed-out" | "denied" | "offline" | "admin";

export interface AdminValue {
  status: AdminStatus;
  uid: string | null;
  /** Nombre o correo de la cuenta. */
  name: string | null;
  /** Falso si faltan las variables NEXT_PUBLIC_FIREBASE_*. */
  configured: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminValue | null>(null);

function hasFirebaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
}

/**
 * Sesión del admin: Google + `adminUsers/{uid}` con `role === "admin"`.
 * Firebase se importa solo en el navegador. Lo que protege los datos son las reglas de
 * Firestore; esto solo decide qué pantalla mostrar.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const configured = hasFirebaseConfig();
  const [status, setStatus] = useState<AdminStatus>(configured ? "loading" : "signed-out");
  const [uid, setUid] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      try {
        const [{ onAuthStateChanged }, { doc, getDoc }, { getDb, getFirebaseAuth }] = await Promise.all([
          import("firebase/auth"),
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
          if (!user) {
            setUid(null);
            setName(null);
            setStatus("signed-out");
            return;
          }
          setStatus("loading");
          setUid(user.uid);
          setName(user.displayName || user.email);
          void getDoc(doc(getDb(), "adminUsers", user.uid))
            .then((snap) => {
              if (cancelled) return;
              setStatus(snap.exists() && snap.data().role === "admin" ? "admin" : "denied");
            })
            .catch((err: { code?: string }) => {
              if (cancelled) return;
              setStatus(err?.code === "permission-denied" ? "denied" : "offline");
            });
        });
      } catch {
        if (!cancelled) setStatus("signed-out");
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [configured]);

  const signIn = useCallback(async () => {
    setError(null);
    if (!configured) {
      setError("Firebase no está configurado.");
      return;
    }
    try {
      const [{ signInWithPopup }, { getFirebaseAuth, getGoogleProvider }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase"),
      ]);
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      setError(
        code === "auth/popup-blocked"
          ? "El navegador bloqueó la ventana. Permite las ventanas emergentes e inténtalo de nuevo."
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    }
  }, [configured]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      const [{ signOut: fbSignOut }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase"),
      ]);
      await fbSignOut(getFirebaseAuth());
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }, []);

  const value = useMemo<AdminValue>(
    () => ({ status, uid, name, configured, error, signIn, signOut }),
    [status, uid, name, configured, error, signIn, signOut],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

/** Estado de acceso del admin: cargando, sin sesión, sin permiso o admin. */
export function useAdmin(): AdminValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("Falta <AdminProvider> arriba de este componente.");
  return ctx;
}
