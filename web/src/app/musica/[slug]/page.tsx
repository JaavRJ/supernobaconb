import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/placeholder/ComingSoon";
import { EraTheme } from "@/components/theme/EraTheme";
import type { WorkType } from "@/types/content";
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
  return { title: findSong(slug)?.title };
}

const TYPE_LABELS: Partial<Record<WorkType, string>> = {
  sencillo: "sencillo",
  ep: "EP",
  album: "álbum",
};

function formatDuration(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default async function MusicaWorkPage({ params }: PageProps<"/musica/[slug]">) {
  const { slug } = await params;
  const work = findSong(slug);
  if (!work) notFound();

  const tracks = getTracksForWork(work.id);

  return (
    <EraTheme era={getEra(work.era) ?? null}>
      <ComingSoon title={work.title} eyebrow={`Supernoba · ${TYPE_LABELS[work.type] ?? work.type}`}>
        {tracks.length > 0 && (
          <ol>
            {tracks.map((t) => (
              <li key={t.id}>
                {t.title} ({formatDuration(t.durationSec)})
              </li>
            ))}
          </ol>
        )}
      </ComingSoon>
    </EraTheme>
  );
}
