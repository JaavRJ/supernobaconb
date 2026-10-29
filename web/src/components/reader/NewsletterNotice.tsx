"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/reader";
import { getSubscription, isSubscribed, subscribe } from "@/lib/newsletter";
import { useHydrated } from "./useHydrated";
import readerStyles from "./Reader.module.css";
import styles from "./NewsletterNotice.module.css";

const DISMISSED_KEY = "newsletterNoticeDismissed";

type Status = "idle" | "working" | "done" | "already" | "error";

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Aviso en línea al final de la parte: invita a la lista de avisos. Aparece una vez al llegar
 * al final (no antes), pide la sesión de Google si hace falta y recuerda el "Ahora no".
 */
export function NewsletterNotice() {
  const { user, configured, loading, signIn } = useAuth();
  const hydrated = useHydrated();
  const [reached, setReached] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  });

  // Aparece cuando el final de la parte entra a la pantalla (también la última página del modo páginas)
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!hydrated || !configured || reached || !anchor || wasDismissed()) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setReached(true);
        observer.disconnect();
      }
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [hydrated, configured, reached]);

  // Con sesión se revisa si ya estaba en la lista
  const uid = user?.uid ?? null;
  useEffect(() => {
    if (!reached || !uid) return;
    let cancelled = false;
    getSubscription(uid)
      .then((sub) => {
        if (cancelled || !isSubscribed(sub)) return;
        setEmail(sub?.email ?? "");
        setStatus((s) => (s === "idle" ? "already" : s));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reached, uid]);

  const save = async (who: NonNullable<typeof user>) => {
    try {
      const sub = await subscribe(who);
      setEmail(sub.email);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const onSubscribe = async () => {
    setStatus("working");
    if (user) {
      await save(user);
      return;
    }
    await signIn();
    // El cambio de sesión llega un instante después; si no llega, se cerró la ventana de Google
    setTimeout(() => {
      const current = userRef.current;
      if (current) void save(current);
      else setStatus((s) => (s === "working" ? "idle" : s));
    }, 900);
  };

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Sin almacenamiento: se oculta solo en esta visita
    }
    setHidden(true);
  };

  const visible = hydrated && configured && reached && !hidden && !wasDismissed();

  return (
    <div ref={anchorRef} className={styles.anchor}>
      {visible && (
        <section className={styles.notice} aria-label="Avisos de novedades">
          {status === "already" ? (
            <p className={styles.text} role="status">
              Ya estás en la lista.
            </p>
          ) : status === "done" ? (
            <p className={styles.text} role="status">
              Listo: te escribiremos a {email || "tu correo"}.
            </p>
          ) : (
            <>
              <p className={styles.text}>¿Quieres enterarte cuando salga algo nuevo?</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={readerStyles.btn}
                  onClick={() => void onSubscribe()}
                  disabled={status === "working" || loading}
                >
                  {status === "working" ? "Guardando…" : "Avisarme"}
                </button>
                <button type="button" className={readerStyles.btnGhost} onClick={dismiss}>
                  Ahora no
                </button>
              </div>
              {status === "error" && (
                <p className={styles.error} role="alert">
                  No se pudo guardar; intenta más tarde.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
