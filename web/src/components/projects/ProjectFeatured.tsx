import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/content";
import { Sky } from "@/components/sky/Sky";
import styles from "./ProjectFeatured.module.css";

/** Constelación de Jabi y, destacada, la web: lo único de software que se queda */
export function ProjectFeatured() {
  const featured = getProjects()[0];
  const shot = featured?.detail.screenshots[0];

  return (
    <div className={styles.projects}>
      <section className={styles.sky} aria-label="Constelación de Jabi">
        <Sky only="jabi" />
      </section>

      {featured && (
        <section className={styles.list} aria-label="La web">
          <div className={styles.row}>
            <div className={styles.text}>
              <h2 className={styles.name}>
                <Link href={featured.href} className={styles.nameLink}>
                  {featured.title}
                </Link>
              </h2>
              <p className={styles.tagline}>{featured.detail.tagline}</p>
            </div>

            {shot && (
              <div className={styles.thumb}>
                <Image src={shot.src} alt="" width={shot.width} height={shot.height} sizes="240px" />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
