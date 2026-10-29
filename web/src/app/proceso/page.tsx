import { DiaryList } from "@/components/diary/DiaryList";
import { ProjectFeatured } from "@/components/projects/ProjectFeatured";
import styles from "./page.module.css";

export const metadata = {
  title: "Proceso",
  description: "El proceso de Supernoba: notas, demos y detrás de cámaras de cómo nacen las obras.",
};

export default function ProcesoPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Proceso</h1>
        <p className={styles.tagline}>el que piensa</p>
      </header>
      <ProjectFeatured />
      <div className={styles.diary}>
        <DiaryList />
      </div>
    </div>
  );
}
