import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/content";
import { Sky } from "@/components/sky/Sky";
import styles from "./ProjectList.module.css";

/** Captura más alta que ancha (como las de AURA): se muestra más angosta */
const TALL_RATIO = 1.5;

/** Constelación de Jabi y lista de sus proyectos, del más nuevo al más viejo */
export function ProjectList() {
  const projects = getProjects();

  return (
    <div className={styles.projects}>
      <section className={styles.sky} aria-label="Constelación de Jabi">
        <Sky only="jabi" />
      </section>

      <section className={styles.list} aria-label="Proyectos">
        {projects.length > 0 ? (
          <ol className={styles.rows}>
            {projects.map((work, index) => {
              const { detail } = work;
              const shot = detail.screenshots[0];
              const year = work.releaseDate?.slice(0, 4);
              const meta = [year, detail.role].filter(Boolean);
              const tall = shot ? shot.height > shot.width * TALL_RATIO : false;

              return (
                <li key={work.id} className={styles.row}>
                  <div className={styles.text}>
                    <p className={styles.number}>{String(index + 1).padStart(2, "0")}</p>
                    <h2 className={styles.name}>
                      <Link href={work.href} className={styles.nameLink}>
                        {work.title}
                      </Link>
                    </h2>
                    <p className={styles.tagline}>{detail.tagline}</p>
                    {meta.length > 0 && <p className={styles.meta}>{meta.join(" · ")}</p>}
                    {detail.recognition ? (
                      <p className={styles.recognition}>
                        <span aria-hidden="true">✦ </span>
                        {detail.recognition}
                      </p>
                    ) : (
                      detail.context && <p className={styles.context}>{detail.context}</p>
                    )}
                    {detail.stack.length > 0 && (
                      <p className={styles.stack}>{detail.stack.slice(0, 4).join(" · ")}</p>
                    )}
                  </div>

                  {shot && (
                    <div className={`${styles.thumb} ${tall ? styles.tall : ""}`}>
                      <Image
                        src={shot.src}
                        alt=""
                        width={shot.width}
                        height={shot.height}
                        sizes="240px"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className={styles.empty}>Todavía no hay proyectos publicados.</p>
        )}
      </section>
    </div>
  );
}
