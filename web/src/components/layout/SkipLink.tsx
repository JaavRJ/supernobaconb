import styles from "./SkipLink.module.css";

/** Enlace para saltar la navegación; solo se ve con foco */
export function SkipLink() {
  return (
    <a className={styles.link} href="#contenido">
      Saltar al contenido
    </a>
  );
}
