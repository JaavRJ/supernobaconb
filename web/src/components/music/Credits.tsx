import type { Track } from "@/types/content";
import styles from "./Lyrics.module.css";

/** Créditos de una canción: "Nombre — Rol, Rol" */
export function Credits({ credits, title }: { credits: NonNullable<Track["credits"]>; title?: string }) {
  if (credits.length === 0) return null;
  return (
    <dl className={styles.credits} aria-label={title ? `Créditos de ${title}` : "Créditos"}>
      {credits.map((c) => (
        <div key={c.name} className={styles.credit}>
          <dt>{c.name}</dt>
          <dd>{c.roles.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
