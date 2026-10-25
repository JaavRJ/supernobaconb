import styles from "./VerticalLabel.module.css";

/** "SUPERNOBA" girado sobre el borde izquierdo; decorativo y solo en escritorio */
export function VerticalLabel({ text = "SUPERNOBA" }: { text?: string }) {
  return (
    <span className={styles.label} aria-hidden="true">
      {text}
    </span>
  );
}
