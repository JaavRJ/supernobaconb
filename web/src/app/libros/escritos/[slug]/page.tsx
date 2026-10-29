import { notFound } from "next/navigation";
import { WritingView } from "@/components/literature/WritingView";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra } from "@/content";
import { content } from "@/lib/content";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

/** Los slugs se conocen de antemano y el 404 de los desconocidos depende de `params`, así que la ruta puede bloquear al navegar */
export const instant = false;

/** Con Cache Components la lista no puede ir vacía; sin escritos se usa un slug que nunca existe y da 404 */
export async function generateStaticParams() {
  const slugs = (await content()).getWritings().map((w) => w.id);
  return (slugs.length > 0 ? slugs : ["sin-escritos"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/libros/escritos/[slug]">) {
  const { slug } = await params;
  const work = (await content()).getWriting(slug);
  return { title: work?.title, description: work?.summary };
}

export default async function EscritoPage({ params }: PageProps<"/libros/escritos/[slug]">) {
  const { slug } = await params;
  const c = await content();
  const work = c.getWriting(slug);
  if (!work) notFound();

  // Si la era tiene un libro como núcleo, el escrito toma su estética; si no, la base radiante
  const era = getEra(work.era) ?? null;
  const book = era?.coreWorkId ? c.getWork(era.coreWorkId) : undefined;
  const view = <WritingView work={work} writing={work.writing} book={book} />;

  return book ? <EraTheme era={era}>{view}</EraTheme> : view;
}
