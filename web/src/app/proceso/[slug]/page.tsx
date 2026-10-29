import { notFound } from "next/navigation";
import { DiaryEntryView } from "@/components/diary/DiaryEntryView";
import { ProjectView } from "@/components/projects/ProjectView";
import { content, type Content } from "@/lib/content";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

/** Los slugs se conocen de antemano y el 404 de los desconocidos depende de `params`, así que la ruta puede bloquear al navegar */
export const instant = false;

export async function generateStaticParams() {
  const c = await content();
  const projects = c.getWorksByConstellation("jabi").filter((w) => w.type === "proyecto");
  return [...c.getDiary(), ...projects].map((item) => ({ slug: item.id }));
}

function findProject(c: Content, slug: string) {
  const work = c.getWork(slug);
  if (!work || work.constellation !== "jabi" || work.type !== "proyecto" || work.hidden) {
    return undefined;
  }
  const detail = c.getProjectDetail(work.id);
  return detail ? { work, detail } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/proceso/[slug]">) {
  const { slug } = await params;
  const c = await content();
  const entry = c.getDiaryEntry(slug);
  if (entry) return { title: entry.title, description: entry.paragraphs[0] };
  const project = findProject(c, slug);
  return project ? { title: project.work.title, description: project.work.summary } : {};
}

export default async function ProcesoSlugPage({ params }: PageProps<"/proceso/[slug]">) {
  const { slug } = await params;
  const c = await content();

  const entry = c.getDiaryEntry(slug);
  if (entry) return <DiaryEntryView entry={entry} />;

  const project = findProject(c, slug);
  if (!project) notFound();

  return <ProjectView work={project.work} detail={project.detail} />;
}
