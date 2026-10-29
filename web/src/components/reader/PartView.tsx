import Link from "next/link";
import type { ReactNode } from "react";
import { StarWord } from "@/components/brand/StarWord";
import { EraPanel } from "@/components/era/EraPanel";
import { VerticalLabel } from "@/components/era/VerticalLabel";
import { scheduledCacheLife } from "@/lib/schedule";
import { getBookPart, getBookParts, getPartMeta, isPartPublished, partSlug } from "@/lib/book";
import { PartCountdown } from "./PartCountdown";
import { PartPrelude } from "./PartPrelude";
import { ReaderShell } from "./ReaderShell";
import styles from "./Reader.module.css";
import { formatReleaseDate } from "./format";

const TEXT_ID = "texto-de-la-parte";

type Meta = NonNullable<ReturnType<typeof getPartMeta>>;

/** La hora actual se lee dentro de un caché que vence en la siguiente publicación: así la página no se vuelve dinámica */
async function isPublishedNow(partNumber: number): Promise<boolean> {
  "use cache";
  scheduledCacheLife();
  const meta = getPartMeta(partNumber);
  return meta ? isPartPublished(meta, new Date()) : false;
}

/** Primera pantalla: "PARTE N", título en Uncial con la estrella en la "O", subtítulo y extras */
/**
 * El HTML de cada capítulo abre con su `<h2>` (puede traer la marca de una nota del autor):
 * se separa para dibujarlo en el encabezado del capítulo y no repetir el título.
 */
function splitChapterHtml(html: string, title: string): { titleHtml: string; bodyHtml: string } {
  const match = /^<h2>([\s\S]*?)<\/h2>/.exec(html);
  if (!match) return { titleHtml: escapeHtml(title), bodyHtml: html };
  return { titleHtml: match[1], bodyHtml: html.slice(match[0].length) };
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function PartHeading({ meta, minutes, children }: { meta: Meta; minutes?: number; children?: ReactNode }) {
  return (
    <header className={styles.heading}>
      <p className={styles.eyebrow}>PARTE {meta.number}</p>
      <StarWord as="h1" text={meta.title.toLocaleUpperCase("es")} className={styles.title} />
      {meta.subtitle && <p className={styles.subtitle}>{meta.subtitle}</p>}
      {minutes !== undefined && <p className={styles.minutes}>{minutes} min de lectura</p>}
      {children}
    </header>
  );
}

/** Escenario común: negro de la era, etiqueta vertical y columna centrada */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage} data-era-page>
      <div className={styles.labelRail}>
        <VerticalLabel />
      </div>
      {children}
    </div>
  );
}

/** Lo que se ve mientras se resuelve la parte: solo el encabezado */
export function PartFallback({ partNumber }: { partNumber: number }) {
  const meta = getPartMeta(partNumber);
  if (!meta) return null;
  return (
    <Stage>
      <PartHeading meta={meta} />
    </Stage>
  );
}

/** Estrella de cuatro puntas entre dos líneas finas */
function Ornament() {
  return (
    <svg className={styles.ornament} viewBox="0 0 120 12" aria-hidden="true">
      <path d="M0 6h50M70 6h50" stroke="currentColor" strokeWidth="0.6" />
      <path
        d="M60 0c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export async function PartView({ partNumber }: { partNumber: number }) {
  const meta = getPartMeta(partNumber);
  if (!meta) return null;

  if (!(await isPublishedNow(partNumber))) {
    return (
      <Stage>
        <PartHeading meta={meta}>
          <p className={styles.release}>Se publica el {formatReleaseDate(meta.releaseDate)}</p>
          <PartCountdown releaseDate={meta.releaseDate} />
          <Link href="/libros/bduem" className={styles.btnGhost}>
            Volver al libro
          </Link>
        </PartHeading>
      </Stage>
    );
  }

  const part = await getBookPart(partNumber);
  if (!part) {
    return (
      <Stage>
        <PartHeading meta={meta}>
          <EraPanel>
            <p>El texto no está disponible en este momento.</p>
            <Link href="/libros/bduem" className={styles.btnGhost}>
              Volver al libro
            </Link>
          </EraPanel>
        </PartHeading>
      </Stage>
    );
  }

  const prev = partNumber > 1 ? getPartMeta(partNumber - 1) : undefined;
  const next = partNumber < getBookParts().length ? getPartMeta(partNumber + 1) : undefined;

  return (
    <Stage>
      <ReaderShell
        partNumber={part.number}
        partTitle={part.title}
        totalMinutes={part.minutes}
        chapters={part.chapters.map((c) => ({ index: c.index, title: c.title }))}
        notes={part.notes.map((n) => ({ id: n.id, title: n.title, content: n.content }))}
        heading={
          <PartHeading meta={meta} minutes={part.minutes}>
            <nav className={styles.toc} aria-label="Capítulos">
              <ol role="list">
                {part.chapters.map((c) => (
                  <li key={c.index}>
                    <a href={`#capitulo-${c.index + 1}`}>
                      {c.index + 1}. {c.title.toLocaleLowerCase("es")}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </PartHeading>
        }
        prelude={<PartPrelude partNumber={part.number} startHref="#capitulo-1" showTitle={false} />}
        text={
          <article id={TEXT_ID} className={styles.text} aria-label={`Texto de la Parte ${part.number}`}>
            {part.chapters.map((c) => {
              const { titleHtml, bodyHtml } = splitChapterHtml(c.html, c.title);
              return (
                <section key={c.index} className={styles.chapter} aria-labelledby={`capitulo-${c.index + 1}`}>
                  <header className={styles.chapterHead}>
                    <p className={styles.chapterNo}>{c.index + 1}</p>
                    <h2
                      id={`capitulo-${c.index + 1}`}
                      className={styles.chapterTitle}
                      dangerouslySetInnerHTML={{ __html: titleHtml }}
                    />
                    <Ornament />
                  </header>
                  <div className={styles.body} data-chapter-body dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                </section>
              );
            })}
          </article>
        }
        end={
          <footer className={styles.end}>
            <Ornament />
            <p className={styles.endTitle}>Fin de la Parte {part.number}</p>
            <div className={styles.endLinks}>
              {prev && (
                <Link href={`/libros/bduem/leer/${partSlug(prev.number)}`} className={styles.btnGhost}>
                  ← Parte {prev.number}
                </Link>
              )}
              {next ? (
                <Link href={`/libros/bduem/leer/${partSlug(next.number)}`} className={styles.btn}>
                  Parte {next.number} →
                </Link>
              ) : (
                <Link href="/libros/bduem" className={styles.btn}>
                  Volver al libro
                </Link>
              )}
            </div>
          </footer>
        }
      />
    </Stage>
  );
}
