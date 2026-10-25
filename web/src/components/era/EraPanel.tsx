import type { ReactNode } from "react";
import styles from "./EraPanel.module.css";

interface EraPanelProps {
  title?: string;
  children: ReactNode;
}

/** Panel oscuro con borde fino y texto centrado, como el InfoPanel del sitio original */
export function EraPanel({ title, children }: EraPanelProps) {
  return (
    <div className={styles.panel}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </div>
  );
}
