import type { ReactNode } from "react";
import styles from "./AdminPage.module.css";

interface AdminPageProps {
  title: string;
  description?: string;
  /** Botones de la parte alta (p. ej. "Nueva obra"). */
  actions?: ReactNode;
  children: ReactNode;
}

/** Marco de cada sección del admin: título, descripción y acciones. */
export function AdminPage({ title, description, actions, children }: AdminPageProps) {
  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
