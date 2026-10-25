import Link from "next/link";
import { StarWord } from "@/components/brand/StarWord";
import { getWork, getWorksByEra, threads } from "@/content";
import type { Era, Work } from "@/types/content";
import styles from "./BduemEra.module.css";
import { EraPanel } from "./EraPanel";
import { HorizontalScroll } from "./HorizontalScroll";
import { Polaroid } from "./Polaroid";
import { VerticalLabel } from "./VerticalLabel";

/** Párrafo del InfoPanel del sitio original */
const INTRO =
  "Todas esas perlas brillantes que adornan el cielo nocturno son estrellas tan lejanas que, incluso si una persona dedicara toda su vida a intentar alcanzar una de ellas, no recorrería ni siquiera una trillonésima parte de la distancia que nos separa. Son, en esencia, inalcanzables.";

const PHASE_LABEL: Record<Era["phase"], string> = {
  nebulosa: "NEBULOSA",
  encendida: "ENCENDIDA",
  orbita: "EN ÓRBITA",
  cerrada: "CERRADA",
};

const TYPE_LABEL: Record<Work["type"], string> = {
  libro: "LIBRO",
  sencillo: "SENCILLO",
  ep: "EP",
  album: "ÁLBUM",
  video: "VIDEO",
  proyecto: "PROYECTO",
  puzzle: "PUZZLE",
};

/** Giros de las polaroids, repetidos en ciclo */
const TILTS = [3, -4, 2];

/** Texto del hilo que une una obra con el libro de la era (el más específico gana) */
function threadText(work: Work, core: Work): string | null {
  const between = threads.filter(
    (t) =>
      (t.from === core.id && t.to === work.id) || (t.from === work.id && t.to === core.id),
  );
  const inspira = between.find((t) => t.kind === "inspira");
  if (inspira) {
    const part = core.parts?.find((p) => p.number === inspira.fromPart);
    return part ? `inspirada en la Parte ${part.number}: ${part.title}` : "inspirada en el libro";
  }
  if (between.some((t) => t.kind === "construye")) return "construido para el libro";
  if (between.some((t) => t.kind === "guino")) return "guiño a la era";
  if (between.some((t) => t.kind === "continua")) return "continúa el libro";
  if (between.some((t) => t.kind === "comparte-universo")) return "comparte universo con el libro";
  return null;
}

function yearOf(work: Work): string | null {
  return work.releaseDate ? work.releaseDate.slice(0, 4) : null;
}

/** Libro núcleo de la era si tiene partes; solo esas eras usan esta experiencia */
export function getEraBook(era: Era): Work | undefined {
  const work = era.coreWorkId ? getWork(era.coreWorkId) : undefined;
  return work?.type === "libro" && work.parts?.length ? work : undefined;
}

const COUNT_WORDS = ["", "UNA", "DOS", "TRES", "CUATRO", "CINCO", "SEIS"];

/** Experiencia de la era BDUEM: título, índice del libro y obras, en recorrido horizontal */
export function BduemEra({ era }: { era: Era }) {
  const book = getEraBook(era);
  if (!book) throw new Error(`La era ${era.id} no tiene un libro con partes como núcleo`);
  const satellites = getWorksByEra(era.id).filter((w) => w.id !== book.id);
  const parts = book.parts ?? [];
  const bookYear = yearOf(book);

  return (
    <div className={styles.stage} data-era-page>
      <VerticalLabel />
      <p className={styles.back}>
        ERA · <b>{(era.name ?? "").toLocaleUpperCase("es")}</b> · {PHASE_LABEL[era.phase]}
      </p>

      <HorizontalScroll label={`Recorrido de la era ${era.name ?? ""}`}>
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
            {parts.map((p) => (
              <li
                key={p.number}
                className={p.number === 1 ? styles.on : undefined}
                aria-current={p.number === 1 ? "true" : undefined}
              >
                {p.number}. {p.title.toLocaleLowerCase("es")}
                {p.subtitle && <small>{p.subtitle}</small>}
              </li>
            ))}
          </ol>
          <Polaroid
            src={book.photoUrl}
            alt=""
            rotate={-5}
          />
          <EraPanel title={book.title}>
            <p className={styles.lead}>{book.summary}</p>
            <p>{INTRO}</p>
            {/* El lector aún no existe en el sitio nuevo: el botón lo dice con honestidad */}
            <button
              type="button"
              className={styles.btn}
              disabled
              aria-disabled="true"
              aria-describedby="bduem-pronto"
            >
              Leer la Parte 1
            </button>
            <span id="bduem-pronto" className={styles.soon}>
              Próximamente
            </span>
          </EraPanel>
        </section>

        {satellites.length > 0 && (
          <section className={`${styles.panel} ${styles.works}`} aria-label="Obras de la era">
            {satellites.map((w, i) => {
              const thread = threadText(w, book);
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
