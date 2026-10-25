import { Discography } from "@/components/music/Discography";
import styles from "./page.module.css";

export const metadata = {
  title: "Música",
  description: "Los sencillos de Supernoba: la constelación y la lista, con dónde escucharlos.",
};

export default function MusicaPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Música</h1>
        <p className={styles.tagline}>el que canta</p>
      </header>
      <Discography />
    </div>
  );
}
