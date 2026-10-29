"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { StarWord } from "@/components/brand/StarWord";
import { AdminProvider, useAdmin } from "@/lib/admin/AdminProvider";
import { adminSections } from "@/lib/admin/sections";
import { Button } from "./Button";
import { ToastProvider } from "./Toast";
import styles from "./AdminShell.module.css";

function Gate() {
  const { status, signIn, signOut, error, configured, name } = useAdmin();

  if (status === "loading") {
    return (
      <div className={styles.gate}>
        <p className={styles.muted} role="status">
          Cargando…
        </p>
      </div>
    );
  }

  return (
    <div className={styles.gate}>
      <p className={styles.gateBrand}>
        <StarWord text="SUPERNOBA" />
      </p>
      {status === "offline" ? (
        <>
          <p className={styles.gateText}>No se pudo comprobar el acceso. Revisa tu conexión y recarga la página.</p>
          <Button variant="quiet" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </>
      ) : status === "denied" ? (
        <>
          <p className={styles.gateText}>Esta cuenta no tiene acceso.</p>
          {name ? <p className={styles.muted}>{name}</p> : null}
          <Button variant="quiet" onClick={() => void signOut()}>
            Salir
          </Button>
        </>
      ) : (
        <>
          <p className={styles.gateText}>Zona privada.</p>
          <Button onClick={() => void signIn()} disabled={!configured}>
            Iniciar sesión con Google
          </Button>
          {!configured ? <p className={styles.muted}>Firebase no está configurado.</p> : null}
        </>
      )}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  const { name, signOut, error } = useAdmin();
  const pathname = usePathname();

  return (
    <>
      <header className={styles.bar}>
        <div className={styles.barTop}>
          <Link href="/admin" className={styles.brand}>
            <StarWord text="SUPERNOBA" /> <span className={styles.brandAdmin}>· Admin</span>
          </Link>
          <div className={styles.account}>
            {name ? <span className={styles.name}>{name}</span> : null}
            <Link href="/" className={styles.link}>
              Ver el sitio
            </Link>
            <Button variant="quiet" small onClick={() => void signOut()}>
              Salir
            </Button>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Secciones del admin">
          {adminSections.map((s) => {
            const active = pathname === s.href || pathname.startsWith(`${s.href}/`);
            return (
              <Link key={s.href} href={s.href} className={styles.navLink} aria-current={active ? "page" : undefined}>
                {s.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.content}>{children}</div>
    </>
  );
}

function Guard({ children }: { children: ReactNode }) {
  const { status } = useAdmin();
  return status === "admin" ? <Panel>{children}</Panel> : <Gate />;
}

/**
 * Marco de todo /admin. Va marcado con `data-admin` para que el CSS oculte el
 * header, el pie y el reproductor del sitio sin tocar el layout raíz.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell} data-admin>
      <AdminProvider>
        <ToastProvider>
          <Guard>{children}</Guard>
        </ToastProvider>
      </AdminProvider>
    </div>
  );
}
