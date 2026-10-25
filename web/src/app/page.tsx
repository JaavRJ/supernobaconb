import { HomeHero } from "@/components/home/HomeHero";
import { LatestRelease } from "@/components/home/LatestRelease";
import { Sky } from "@/components/sky/Sky";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <HomeHero>
        <LatestRelease />
      </HomeHero>
      <section id="cielo" className={styles.sky}>
        <h2 className={styles.visuallyHidden}>El cielo</h2>
        <Sky />
      </section>
    </>
  );
}
