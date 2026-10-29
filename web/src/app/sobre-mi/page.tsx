import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { content } from "@/lib/content";
import { StarWord } from "@/components/brand/StarWord";
import { AboutPhotos } from "@/components/about/AboutPhotos";
import styles from "./page.module.css";

export async function generateMetadata() {
  return { title: "Sobre mí", description: (await content()).bio.es.medium };
}

const FACETS = [
  { name: "Jabi", role: "el que piensa", href: "/proceso" },
  { name: "noba", role: "el que escribe", href: "/libros" },
  { name: "Supernoba", role: "el que canta", href: "/musica" },
];

interface Download {
  file: string;
  label: string;
  detail: string;
  lang?: string;
  primary?: boolean;
}

const DOWNLOADS: Download[] = [
  {
    file: "supernoba-kit-de-prensa.pdf",
    label: "Kit de prensa",
    detail: "Español · PDF",
    primary: true,
  },
  {
    file: "supernoba-press-kit.pdf",
    label: "Press kit",
    detail: "English · PDF",
    lang: "en",
  },
  { file: "supernoba-fotos-prensa.zip", label: "Fotos y portadas en alta", detail: "ZIP" },
];

/** Tamaño legible del archivo en `public/prensa`; vacío si no existe */
function fileSize(file: string): string {
  try {
    const bytes = fs.statSync(path.join(process.cwd(), "public", "prensa", file)).size;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  } catch {
    return "";
  }
}

export default async function SobreMiPage() {
  const { about, bio, contact, photos } = await content();
  const kitPhotos = photos
    .filter((p) => p.source === "kit" && p.id !== "retrato")
    .slice(0, 4);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.portrait}>
          <div className={styles.polaroid}>
            <Image
              className={styles.portraitImg}
              src="/fotos/retrato.webp"
              width={1076}
              height={1434}
              alt="Retrato de Javier, Supernoba, en blanco y negro, con una estrella dibujada en la mejilla"
              sizes="(max-width: 700px) 72vw, 360px"
              priority
            />
          </div>
        </div>
        <div className={styles.intro}>
          <StarWord text="SUPERNOBA" as="h1" className={styles.title} />
          <p className={styles.names}>Javier · Jabi</p>
          <p className={styles.phrase}>{bio.es.short}</p>
        </div>
      </header>

      <nav className={styles.facets} aria-label="Las tres facetas">
        {FACETS.map((f) => (
          <Link key={f.href} href={f.href} className={styles.facet}>
            <span className={styles.facetName}>{f.name}</span>
            <span className={styles.facetRole}>{f.role}</span>
          </Link>
        ))}
      </nav>

      <section className={styles.bio} aria-label="Biografía">
        <p className={styles.lead}>{about.intro}</p>
        <dl className={styles.parts}>
          {about.parts.map((part) => (
            <div key={part.label} className={styles.part}>
              <dt className={styles.partLabel}>{part.label}</dt>
              <dd className={styles.partText}>{part.text}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.closing}>{about.closing}</p>
      </section>

      {kitPhotos.length > 0 && (
        <section className={styles.section} aria-labelledby="fotos">
          <h2 id="fotos" className={styles.heading}>
            Fotos
          </h2>
          <AboutPhotos photos={kitPhotos} />
          <p className={styles.more}>
            <Link href="/videos#fotos" className={styles.textLink}>
              Ver todas las fotos →
            </Link>
          </p>
        </section>
      )}

      <section className={styles.section} aria-labelledby="kit">
        <h2 id="kit" className={styles.heading}>
          Kit de prensa
        </h2>
        <p className={styles.note}>
          Biografía, lanzamientos, fotos y contacto, listos para notas de prensa.
        </p>
        <ul className={styles.downloads}>
          {DOWNLOADS.map((d) => {
            const size = fileSize(d.file);
            return (
              <li key={d.file}>
                <a
                  href={`/prensa/${d.file}`}
                  download
                  className={`${styles.download} ${d.primary ? styles.primary : ""}`}
                >
                  <span className={styles.dlLabel} lang={d.lang}>
                    {d.label}
                  </span>
                  <span className={styles.dlMeta}>
                    {d.detail}
                    {size ? ` · ${size}` : ""}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="contacto">
        <h2 id="contacto" className={styles.heading}>
          Contacto
        </h2>
        <dl className={styles.contact}>
          <div>
            <dt>Instagram</dt>
            <dd>
              <a
                href={contact.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLink}
              >
                {contact.instagram.handle}
                <span className={styles.sr}> (se abre en una pestaña nueva)</span>
              </a>
            </dd>
          </div>
          <div>
            <dt>TikTok</dt>
            <dd>
              <a
                href={contact.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLink}
              >
                {contact.tiktok.handle}
                <span className={styles.sr}> (se abre en una pestaña nueva)</span>
              </a>
            </dd>
          </div>
          {contact.pressEmail && (
            <div>
              <dt>Prensa</dt>
              <dd>
                <a href={`mailto:${contact.pressEmail}`} className={styles.textLink}>
                  {contact.pressEmail}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
