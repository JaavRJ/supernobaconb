import Link from "next/link";
import { Connections } from "@/components/works/Connections";
import type { ProjectDetail, Work } from "@/types/content";
import { ProjectScreenshots } from "./ProjectScreenshots";
import styles from "./ProjectView.module.css";

const NEW_TAB = <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>;

/** Página de un proyecto: encabezado, acciones, capturas, descripción y conexiones */
export function ProjectView({ work, detail }: { work: Work; detail: ProjectDetail }) {
  const year = work.releaseDate?.slice(0, 4);
  const eyebrow = ["Jabi", "Proceso", year].filter(Boolean).join(" · ");
  const facts = [detail.role, detail.context].filter(Boolean).join(" · ");

  return (
    <article className={styles.page}>
      <Link href="/proceso" className={styles.back}>
        <span aria-hidden="true">← </span>Proceso
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{work.title}</h1>
        <p className={styles.tagline}>{detail.tagline}</p>
        {facts ? <p className={styles.facts}>{facts}</p> : null}
        {detail.recognition ? (
          <p className={styles.recognition}>
            <span aria-hidden="true">✦ </span>
            {detail.recognition}
          </p>
        ) : null}

        <div className={styles.actions}>
          {detail.demo ? (
            <a
              className={styles.primary}
              href={detail.demo.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {detail.demo.label}
              {NEW_TAB}
            </a>
          ) : null}
          {detail.video ? (
            <a
              className={styles.secondary}
              href={detail.video}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver video
              {NEW_TAB}
            </a>
          ) : null}
          {"url" in detail.repo ? (
            <a
              className={styles.secondary}
              href={detail.repo.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Repositorio
              {NEW_TAB}
            </a>
          ) : (
            <span className={styles.privateCode}>Código privado</span>
          )}
        </div>
      </header>

      <ProjectScreenshots screenshots={detail.screenshots} />

      <div className={styles.body}>
        <div className={styles.prose}>
          {detail.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <aside className={styles.side}>
          <section aria-labelledby="project-highlights">
            <h2 id="project-highlights" className={styles.heading}>
              Puntos clave
            </h2>
            <ul className={styles.highlights}>
              {detail.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="project-stack">
            <h2 id="project-stack" className={styles.heading}>
              Stack
            </h2>
            <p className={styles.stack}>{detail.stack.join(" · ")}</p>
          </section>
        </aside>
      </div>

      <Connections work={work} />
    </article>
  );
}
