import type { ReactNode } from "react";
import { EclipseArt } from "./EclipseArt";
import styles from "./HomeHero.module.css";

interface HomeHeroProps {
  /** Franja "Lo último", al pie del hero */
  children?: ReactNode;
}

/** Primera sección de la portada: el nombre sobre la ilustración del eclipse */
export function HomeHero({ children }: HomeHeroProps) {
  return (
    <section className={styles.hero}>
      <EclipseArt />
      <h1 className={styles.title}>Supernoba</h1>
      <div className={styles.strip}>{children}</div>
    </section>
  );
}
