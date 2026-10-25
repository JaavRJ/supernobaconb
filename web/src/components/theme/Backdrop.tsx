import styles from "./Backdrop.module.css";

interface BackdropProps {
  variant: "stars" | "grain";
}

/** Fondo decorativo fijo detrás del contenido; lo renderiza <EraTheme> según el tema */
export function Backdrop({ variant }: BackdropProps) {
  return <div className={`${styles.backdrop} ${styles[variant]}`} aria-hidden="true" />;
}
