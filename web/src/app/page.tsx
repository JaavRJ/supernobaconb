import { LatestRelease } from "@/components/home/LatestRelease";
import { Sky } from "@/components/sky/Sky";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <h1 className={styles.visuallyHidden}>Supernoba</h1>
      <div className={styles.notice}>
        <LatestRelease />
      </div>
      <section id="cielo" className={styles.sky}>
        <h2 className={styles.visuallyHidden}>El cielo</h2>
        <Sky />
      </section>
    </>
  );
}
