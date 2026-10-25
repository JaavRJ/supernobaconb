import { notFound } from "next/navigation";
import { BduemEra, getEraBook } from "@/components/era/BduemEra";
import { ComingSoon } from "@/components/placeholder/ComingSoon";
import { EraTheme } from "@/components/theme/EraTheme";
import { eras, getEra } from "@/content";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

/** Los slugs se conocen de antemano y el 404 de los desconocidos depende de `params`, así que la ruta puede bloquear al navegar */
export const instant = false;

export function generateStaticParams() {
  return eras.map((e) => ({ slug: e.id }));
}

/** Una nebulosa no revela su nombre: el título público es siempre "Nebulosa" */
export async function generateMetadata({ params }: PageProps<"/eras/[slug]">) {
  const { slug } = await params;
  const era = getEra(slug);
  if (!era) return {};
  return { title: era.phase === "nebulosa" ? "Nebulosa" : (era.name ?? "Nebulosa") };
}

export default async function EraPage({ params }: PageProps<"/eras/[slug]">) {
  const { slug } = await params;
  const era = getEra(slug);
  if (!era) notFound();

  if (era.phase === "nebulosa") {
    return (
      <EraTheme era={era}>
        <ComingSoon title="Nebulosa" hideSoon>
          <p>Algo se está formando.</p>
        </ComingSoon>
      </EraTheme>
    );
  }

  if (!getEraBook(era)) {
    return (
      <EraTheme era={era}>
        <ComingSoon title={era.name ?? "Nebulosa"} eyebrow="Era" />
      </EraTheme>
    );
  }

  return (
    <EraTheme era={era}>
      <BduemEra era={era} />
    </EraTheme>
  );
}
