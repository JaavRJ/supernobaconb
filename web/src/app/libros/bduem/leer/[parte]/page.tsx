import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PartFallback, PartView } from "@/components/reader/PartView";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra } from "@/content";
import { content } from "@/lib/content";
import { ReaderDataProvider } from "@/lib/reader";
import { getBookParts, getPartMeta, parsePartSlug, partSlug } from "@/lib/book";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

/** Los slugs se conocen de antemano y el 404 de los desconocidos depende de `params`, así que la ruta puede bloquear al navegar */
export const instant = false;

export async function generateStaticParams() {
  return (await getBookParts()).map((p) => ({ parte: partSlug(p.number) }));
}

export async function generateMetadata({ params }: PageProps<"/libros/bduem/leer/[parte]">) {
  const { parte } = await params;
  const n = await parsePartSlug(parte);
  const meta = n === null ? undefined : await getPartMeta(n);
  if (!meta) return {};
  const book = (await content()).getWork("bduem")?.title ?? "Brillo de una Estrella Muerta";
  return {
    title: { absolute: `Parte ${meta.number}: ${meta.title} — ${book}` },
    description: meta.subtitle ? `${book}. ${meta.subtitle}.` : book,
  };
}

export default async function ReadPartPage({ params }: PageProps<"/libros/bduem/leer/[parte]">) {
  const { parte } = await params;
  const n = await parsePartSlug(parte);
  const meta = n === null ? undefined : await getPartMeta(n);
  if (n === null || !meta) notFound();

  const work = (await content()).getWork("bduem");
  const era = work ? getEra(work.era) : undefined;
  if (!era) throw new Error("Falta la obra bduem o su era en el contenido");

  return (
    <EraTheme era={era}>
      <ReaderDataProvider>
        <Suspense fallback={<PartFallback meta={meta} />}>
          <PartView partNumber={n} />
        </Suspense>
      </ReaderDataProvider>
    </EraTheme>
  );
}
