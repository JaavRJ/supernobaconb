import { ProjectList } from "@/components/projects/ProjectList";
import styles from "./page.module.css";

export const metadata = {
  title: "Proyectos",
  description:
    "Los proyectos de software de Jabi, el que piensa: herramientas, experimentos y el sitio donde vive todo.",
};

export default function ProyectosPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Proyectos</h1>
        <p className={styles.tagline}>el que piensa</p>
      </header>
      <ProjectList />
    </div>
  );
}
