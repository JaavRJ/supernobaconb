import type { Track } from "@/types/content";
import { Credits } from "./Credits";
import styles from "./Lyrics.module.css";

/** Letras de las canciones, con sus créditos debajo; va en el HTML para poder leerse y copiarse */
export function Lyrics({ tracks }: { tracks: Track[] }) {
  const withLyrics = tracks.filter((t) => t.lyrics?.length);
  if (withLyrics.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="release-lyrics">
      <h2 id="release-lyrics" className={styles.heading}>
        Letras
      </h2>
      {withLyrics.map((t) => (
        <article key={t.id} id={`letra-${t.id}`} className={styles.song} aria-labelledby={`letra-titulo-${t.id}`}>
          <h3 id={`letra-titulo-${t.id}`} className={styles.title}>
            {t.title}
          </h3>
          <div className={styles.text}>
            {t.lyrics?.map((stanza, i) => (
              <p key={i} className={styles.stanza}>
                {stanza.map((line, j) => (
                  <span key={j} className={styles.line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            ))}
          </div>
          <Credits credits={t.credits ?? []} title={t.title} />
        </article>
      ))}
    </section>
  );
}
