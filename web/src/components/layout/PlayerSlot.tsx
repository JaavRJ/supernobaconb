import styles from "./PlayerSlot.module.css";

/** Espacio reservado para el reproductor persistente (F1-12) */
export function PlayerSlot() {
  return <div id="reproductor" role="region" className={styles.slot} aria-label="Reproductor" />;
}
