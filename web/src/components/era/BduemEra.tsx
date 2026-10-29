import Link from "next/link";
import { Suspense } from "react";
import { StarWord } from "@/components/brand/StarWord";
import { content, type Content } from "@/lib/content";
import { getBookParts, isPartPublished, partSlug } from "@/lib/book/publication";
import { scheduledCacheLife } from "@/lib/schedule";
import type { Era, Work } from "@/types/content";
import styles from "./BduemEra.module.css";
import { EraPanel } from "./EraPanel";
import { HorizontalScroll } from "./HorizontalScroll";
import { Polaroid } from "./Polaroid";
import { VerticalLabel } from "./VerticalLabel";

/** Párrafo del InfoPanel del sitio original */
const INTRO =
  "Todas esas perlas brillantes que adornan el cielo nocturno son estrellas tan lejanas que, incluso si una persona dedicara toda su vida a intentar alcanzar una de ellas, no recorrería ni siquiera una trillonésima parte de la distancia que nos separa. Son, en esencia, inalcanzables.";

const TYPE_LABEL: Record<Work["type"], string> = {
  libro: "LIBRO",
  sencillo: "SENCILLO",
  ep: "EP",
  album: "ÁLBUM",
  video: "VIDEO",
  proyecto: "PROYECTO",
  puzzle: "PUZZLE",
  escrito: "ESCRITO",
};

/** Giros de las polaroids, repetidos en ciclo */
const TILTS = [3, -4, 2];

/** Texto del hilo que une una obra con el libro de la era (el más específico gana) */
function threadText(c: Content, work: Work, core: Work): string | null {
  const between = c.threads.filter(
    (t) =>
      (t.from === core.id && t.to === work.id) || (t.from === work.id && t.to === core.id),
  );
  const inspira = between.find((t) => t.kind === "inspira");
  if (inspira) {
    const part = core.parts?.find((p) => p.number === inspira.fromPart);
    return part ? `inspirada en la Parte ${part.number}: ${part.title}` : "inspirada en el libro";
  }
  if (between.some((t) => t.kind === "construye")) return "construido para el libro";
  if (between.some((t) => t.kind === "guino")) return "guiño al libro";
  if (between.some((t) => t.kind === "continua")) return "continúa el libro";
  if (between.some((t) => t.kind === "comparte-universo")) return "comparte universo con el libro";
  return null;
}

function yearOf(work: Work): string | null {
  return work.releaseDate ? work.releaseDate.slice(0, 4) : null;
}

/** Libro núcleo de la era si tiene partes; solo esas eras usan esta experiencia */
export function getEraBook(c: Content, era: Era): Work | undefined {
  const work = era.coreWorkId ? c.getWork(era.coreWorkId) : undefined;
  return work?.type === "libro" && work.parts?.length ? work : undefined;
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-12-22" -> "22 de diciembre" */
function formatPartDate(date: string): string {
  const [, month, day] = date.split("-").map(Number);
  return `${day} de ${MONTHS[month - 1]}`;
}

/** La hora actual se lee dentro de un caché que vence en la siguiente publicación: así la página no se renderiza en cada petición */
async function getPublishedPartNumbers(): Promise<number[]> {
  "use cache";
  await scheduledCacheLife();
  const now = new Date();
  return (await getBookParts())
    .filter((p) => isPartPublished(p, now))
    .map((p) => p.number);
}

/** Índice de partes: las publicadas enlazan al lector, las demás se ven apagadas con su fecha */
async function PartsIndex({ parts }: { parts: NonNullable<Work["parts"]> }) {
  const published = new Set(await getPublishedPartNumbers());
  return parts.map((p) => {
    const current = p.number === 1;
    const content = (
      <>
        {p.number}. {p.title.toLocaleLowerCase("es")}
        {p.subtitle && <small>{p.subtitle}</small>}
      </>
    );
    if (!published.has(p.number)) {
      return (
        <li key={p.number} className={styles.pending}>
          {content}
          <small>se publica el {formatPartDate(p.releaseDate)}</small>
        </li>
      );
    }
    return (
      <li
        key={p.number}
        className={current ? styles.on : undefined}
        aria-current={current ? "true" : undefined}
      >
        <Link href={`/libros/bduem/leer/${partSlug(p.number)}`} className={styles.partLink}>
          {content}
        </Link>
      </li>
    );
  });
}

const COUNT_WORDS = ["", "UNA", "DOS", "TRES", "CUATRO", "CINCO", "SEIS"];

/** Experiencia de la era BDUEM: título, índice del libro y obras, en recorrido horizontal */
export async function BduemEra({ era }: { era: Era }) {
  const c = await content();
  const book = getEraBook(c, era);
  if (!book) throw new Error(`La era ${era.id} no tiene un libro con partes como núcleo`);
  // Solo las obras unidas al libro por un hilo; las demás de la era no aparecen aquí
  const satellites = c.getWorksByEra(era.id).filter(
    (w) => w.id !== book.id && threadText(c, w, book) !== null,
  );
  const parts = book.parts ?? [];
  const bookYear = yearOf(book);

  return (
    <div className={styles.stage} data-era-page>
      <VerticalLabel />

      <HorizontalScroll label={`Recorrido de ${book.title}`}>
        <section className={`${styles.panel} ${styles.intro}`} aria-label="Título">
          <div>
            <StarWord
              as="h1"
              text={book.title.toLocaleUpperCase("es")}
              className={styles.title}
            />
            <p className={styles.meta}>
              <b>LIBRO</b> · {COUNT_WORDS[parts.length] ?? parts.length} PARTES{bookYear ? ` · ${bookYear}` : ""}
              {"  —  "}
              noba, el que escribe
            </p>
          </div>
          <p className={styles.hint} aria-hidden="true">
            DESLIZA →
          </p>
        </section>

        <section className={`${styles.panel} ${styles.book}`} aria-label="El libro">
          <ol className={styles.index} role="list">
            {/* Si la publicación está a menos de 5 min, el caché es de petición y Next exige Suspense */}
            <Suspense fallback={null}>
              <PartsIndex parts={parts} />
            </Suspense>
          </ol>
          <Polaroid
            src={book.photoUrl}
            alt=""
            rotate={-5}
          />
          <EraPanel title={book.title}>
            <p className={styles.lead}>{book.summary}</p>
            <p>{INTRO}</p>
            <Link href={`/libros/bduem/leer/${partSlug(1)}`} className={styles.btn}>
              Leer la Parte 1
            </Link>
          </EraPanel>
        </section>

        {satellites.length > 0 && (
          <section className={`${styles.panel} ${styles.works}`} aria-label="Obras que nacen del libro">
            {satellites.map((w, i) => {
              const thread = threadText(c, w, book);
              const year = yearOf(w);
              return (
                <Link key={w.id} href={w.href} className={styles.work}>
                  <Polaroid
                    src={w.photoUrl}
                    alt=""
                    rotate={TILTS[i % TILTS.length]}
                    size="sm"
                  />
                  <h2 className={styles.workTitle}>{w.title}</h2>
                  <span className={styles.workMeta}>
                    {TYPE_LABEL[w.type]}
                    {year ? ` · ${year}` : ""}
                  </span>
                  {thread && <span className={styles.thread}>{thread}</span>}
                </Link>
              );
            })}
          </section>
        )}
      </HorizontalScroll>
    </div>
  );
}
