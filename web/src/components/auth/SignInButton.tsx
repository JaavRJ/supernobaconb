"use client";

import { useAuth } from "@/lib/reader";
import styles from "./SignInButton.module.css";

/** Botón discreto de sesión; debe ir dentro de `ReaderDataProvider`. */
export function SignInButton() {
  const { configured, user, loading, error, signIn, signOut } = useAuth();

  if (!configured) return null;

  if (user) {
    const name = user.displayName ?? user.email ?? "Lector";
    return (
      <div className={styles.root}>
        <span className={styles.name} title={name}>
          {name}
        </span>
        <button type="button" className={styles.button} onClick={() => void signOut()}>
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.button}
        onClick={() => void signIn()}
        disabled={loading}
        aria-busy={loading}
      >
        Iniciar sesión
      </button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
