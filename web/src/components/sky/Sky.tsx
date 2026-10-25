import { constellations, eras, threads, works } from "@/content";
import { layoutSky, type SkyLayout } from "./layout";
import { TYPE_LABELS, type SkyStarInfo } from "./meta";
import { SkyInteractive } from "./SkyInteractive";

interface SkyProps {
  /** Layout ya calculado; por defecto se calcula con los datos de `@/content` */
  layout?: SkyLayout;
}

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function defaultLayout(): SkyLayout {
  return layoutSky({ constellations, works: works.filter((w) => !w.hidden), threads });
}

function buildStarInfo(layout: SkyLayout): SkyStarInfo[] {
  const byId = new Map(works.map((w) => [w.id, w]));
  const constellationNames = new Map(constellations.map((c) => [c.id, c.name]));
  const eraNames = new Map(eras.map((e) => [e.id, e.name]));

  return layout.stars.flatMap((s) => {
    const w = byId.get(s.workId);
    if (!w) return [];
    const dateLabel = w.releaseDate
      ? dateFormat.format(new Date(`${w.releaseDate}T00:00:00Z`))
      : "por publicar";
    const constellationName = constellationNames.get(w.constellation) ?? w.constellation;
    const typeLabel = TYPE_LABELS[w.type];
    return [
      {
        workId: w.id,
        href: w.href,
        title: w.title,
        typeLabel,
        dateLabel,
        dateIso: w.releaseDate,
        eraName: eraNames.get(w.era) ?? null,
        constellationName,
        coverUrl: w.coverUrl,
        ariaLabel: `${w.title} — ${constellationName}, ${typeLabel.toLowerCase()}, ${dateLabel}`,
      },
    ];
  });
}

export function Sky({ layout = defaultLayout() }: SkyProps) {
  return (
    <SkyInteractive
      layout={layout}
      starInfo={buildStarInfo(layout)}
      constellationColors={Object.fromEntries(constellations.map((c) => [c.id, c.color]))}
    />
  );
}
