import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/placeholder/ComingSoon";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra, getWork, getWorksByConstellation } from "@/content";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getWorksByConstellation("jabi")
    .filter((w) => w.type === "proyecto")
    .map((w) => ({ slug: w.id }));
}

function findProject(slug: string) {
  const work = getWork(slug);
  return work && work.constellation === "jabi" && work.type === "proyecto" && !work.hidden
    ? work
    : undefined;
}

export async function generateMetadata({ params }: PageProps<"/proyectos/[slug]">) {
  const { slug } = await params;
  return { title: findProject(slug)?.title };
}

export default async function ProyectoPage({ params }: PageProps<"/proyectos/[slug]">) {
  const { slug } = await params;
  const work = findProject(slug);
  if (!work) notFound();

  return (
    <EraTheme era={getEra(work.era) ?? null}>
      <ComingSoon title={work.title} eyebrow="Jabi · proyecto" />
    </EraTheme>
  );
}
