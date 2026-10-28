import { StarWord } from "@/components/brand/StarWord";
import { HeroMotion } from "@/components/home/HeroMotion";
import { LatestRelease } from "@/components/home/LatestRelease";
import { Sky } from "@/components/sky/Sky";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <HeroMotion />
      <section className={styles.hero} data-hero>
        <StarWord text="SUPERNOBA" as="h1" className={styles.name} letters />
        <p className={styles.tagline}>el que piensa · el que escribe · el que canta</p>
        <LatestRelease />
        <a href="#cielo" className={styles.down}>
          el cielo ↓
        </a>
      </section>
      <section id="cielo" className={styles.sky}>
        <h2 className={styles.visuallyHidden}>El cielo</h2>
        <Sky />
      </section>
    </>
  );
}
