import { LatestRelease } from "@/components/home/LatestRelease";
import { Sky } from "@/components/sky/Sky";
import { site } from "@/content/site";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <div className={styles.intro}>
        <h1 className={styles.title}>Supernoba</h1>
        <p className={styles.tagline}>{site.description}</p>
      </div>
      <LatestRelease />
      <section id="cielo" className={styles.sky}>
        <h2 className={styles.visuallyHidden}>El cielo</h2>
        <Sky />
      </section>
    </>
  );
}
