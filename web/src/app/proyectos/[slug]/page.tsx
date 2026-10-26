import { notFound } from "next/navigation";
import { ProjectView } from "@/components/projects/ProjectView";
import { getProjectDetail, getWork, getWorksByConstellation } from "@/content";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

/** Los slugs se conocen de antemano y el 404 de los desconocidos depende de `params`, así que la ruta puede bloquear al navegar */
export const instant = false;

export function generateStaticParams() {
  return getWorksByConstellation("jabi")
    .filter((w) => w.type === "proyecto")
    .map((w) => ({ slug: w.id }));
}

function findProject(slug: string) {
  const work = getWork(slug);
  if (!work || work.constellation !== "jabi" || work.type !== "proyecto" || work.hidden) {
    return undefined;
  }
  const detail = getProjectDetail(work.id);
  return detail ? { work, detail } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/proyectos/[slug]">) {
  const { slug } = await params;
  const project = findProject(slug);
  return project ? { title: project.work.title, description: project.work.summary } : {};
}

export default async function ProyectoPage({ params }: PageProps<"/proyectos/[slug]">) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  return <ProjectView work={project.work} detail={project.detail} />;
}
