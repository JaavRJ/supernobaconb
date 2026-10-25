import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PartFallback, PartView } from "@/components/reader/PartView";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra, getWork } from "@/content";
import { getBookParts, getPartMeta, parsePartSlug, partSlug } from "@/lib/book";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

/** Los slugs se conocen de antemano y el 404 de los desconocidos depende de `params`, así que la ruta puede bloquear al navegar */
export const instant = false;

export function generateStaticParams() {
  return getBookParts().map((p) => ({ parte: partSlug(p.number) }));
}

export async function generateMetadata({ params }: PageProps<"/libros/bduem/leer/[parte]">) {
  const { parte } = await params;
  const n = parsePartSlug(parte);
  const meta = n === null ? undefined : getPartMeta(n);
  if (!meta) return {};
  const book = getWork("bduem")?.title ?? "Brillo de una Estrella Muerta";
  return {
    title: { absolute: `Parte ${meta.number}: ${meta.title} — ${book}` },
    description: meta.subtitle ? `${book}. ${meta.subtitle}.` : book,
  };
}

export default async function ReadPartPage({ params }: PageProps<"/libros/bduem/leer/[parte]">) {
  const { parte } = await params;
  const n = parsePartSlug(parte);
  if (n === null) notFound();

  const work = getWork("bduem");
  const era = work ? getEra(work.era) : undefined;
  if (!era) throw new Error("Falta la obra bduem o su era en @/content");

  return (
    <EraTheme era={era}>
      <Suspense fallback={<PartFallback partNumber={n} />}>
        <PartView partNumber={n} />
      </Suspense>
    </EraTheme>
  );
}
