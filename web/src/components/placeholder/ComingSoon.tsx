import type { ReactNode } from "react";
import styles from "./ComingSoon.module.css";

interface ComingSoonProps {
  title: string;
  /** Línea pequeña sobre el título (constelación, tipo de obra…) */
  eyebrow?: string;
  /** Oculta el texto "Próximamente." */
  hideSoon?: boolean;
  children?: ReactNode;
}

/** Página provisional de una ruta que aún no tiene su diseño final */
export function ComingSoon({ title, eyebrow, hideSoon, children }: ComingSoonProps) {
  return (
    <section className={styles.root}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {!hideSoon && <p className={styles.text}>Próximamente.</p>}
      {children}
    </section>
  );
}
