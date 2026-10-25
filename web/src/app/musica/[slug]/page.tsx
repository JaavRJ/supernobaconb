import { notFound } from "next/navigation";
import { ReleaseView } from "@/components/music/ReleaseView";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra, getTracksForWork, getWork, getWorksByConstellation } from "@/content";

/** La primera visita a un slug no listado espera la página completa (y su 404) */
export const ensureStatic = "navigation";

/** Los slugs se conocen de antemano y el 404 de los desconocidos depende de `params`, así que la ruta puede bloquear al navegar */
export const instant = false;

export function generateStaticParams() {
  return getWorksByConstellation("supernoba").map((w) => ({ slug: w.id }));
}

function findSong(slug: string) {
  const work = getWork(slug);
  return work && work.constellation === "supernoba" && !work.hidden ? work : undefined;
}

export async function generateMetadata({ params }: PageProps<"/musica/[slug]">) {
  const { slug } = await params;
  const work = findSong(slug);
  return { title: work?.title, description: work?.summary };
}

export default async function MusicaWorkPage({ params }: PageProps<"/musica/[slug]">) {
  const { slug } = await params;
  const work = findSong(slug);
  if (!work) notFound();

  const era = getEra(work.era) ?? null;

  return (
    <EraTheme era={era}>
      <ReleaseView work={work} era={era} tracks={getTracksForWork(work.id)} />
    </EraTheme>
  );
}
