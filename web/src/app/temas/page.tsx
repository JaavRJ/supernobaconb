import { EraTheme } from "@/components/theme/EraTheme";
import { eras } from "@/content";
import styles from "./page.module.css";

/** Página temporal de prueba del sistema de temas; se borra en F1-13 */
export default function TemasPage() {
  return (
    <main>
      <EraTheme era={null} className={styles.section}>
        <Sample title="Cielo base" />
      </EraTheme>
      {eras.map((era) => (
        <EraTheme key={era.id} era={era} className={styles.section}>
          <Sample title={era.name ?? "Nebulosa"} />
        </EraTheme>
      ))}
    </main>
  );
}

function Sample({ title }: { title: string }) {
  return (
    <div className={styles.content}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>
        Un párrafo de prueba para ver el color del texto, la tipografía y el fondo de este tema.
      </p>
      <button type="button" className={styles.button}>
        Botón de acento
      </button>
      <p className={styles.muted}>Texto secundario de ejemplo.</p>
      <hr className={styles.line} />
    </div>
  );
}
