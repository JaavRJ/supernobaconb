import { constellations, eras, getActiveSignal, getNebulas, threads, works } from "@/content";
import type { EraPhase } from "@/types/content";
import { layoutNebulas, layoutSky, type SkyLayout } from "./layout";
import { TYPE_LABELS, type SkyEraInfo, type SkySignal, type SkyStarInfo } from "./meta";
import { buildTimeline } from "./eraTimeline";
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

const monthFormat = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const PHASE_LABELS: Record<EraPhase, string> = {
  nebulosa: "en nebulosa",
  encendida: "encendida",
  orbita: "en órbita",
  cerrada: "cerrada",
};

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
        eraId: w.era,
        constellationName,
        coverUrl: w.coverUrl,
        ariaLabel: `${w.title} — ${constellationName}, ${typeLabel.toLowerCase()}, ${dateLabel}`,
      },
    ];
  });
}

export function Sky({ layout = defaultLayout() }: SkyProps) {
  const eraInfo: SkyEraInfo[] = eras.map((e) => ({
    id: e.id,
    label: e.phase === "nebulosa" || !e.name ? "Nebulosa" : e.name,
    phase: e.phase,
    theme: e.theme,
  }));
  const labelOf = new Map(eraInfo.map((e) => [e.id, e.label]));

  const timeline = buildTimeline(eras, works);
  const timelineLabels = Object.fromEntries(
    timeline.rows.map((row) => {
      const since = row.since ? monthFormat.format(new Date(`${row.since}T00:00:00Z`)) : null;
      const label = labelOf.get(row.eraId) ?? "Nebulosa";
      // Una nebulosa no revela fechas
      const text =
        row.phase === "nebulosa"
          ? "Nebulosa"
          : `Era ${label}: ${PHASE_LABELS[row.phase]}${since ? ` desde ${since}` : ""}`;
      return [row.eraId, { ariaLabel: text }];
    }),
  );

  // La señal se elige en el servidor; solo viaja la de la nebulosa, sin nombre ni obras
  const signals: Record<string, SkySignal | null> = {};
  for (const era of getNebulas()) {
    const signal = getActiveSignal(era.id);
    signals[era.id] = signal
      ? {
          id: signal.id,
          kind: signal.kind,
          content: signal.content,
          ...(signal.alt !== undefined ? { alt: signal.alt } : {}),
        }
      : null;
  }

  return (
    <SkyInteractive
      layout={layout}
      starInfo={buildStarInfo(layout)}
      eras={eraInfo}
      nebulas={layoutNebulas(eras)}
      signals={signals}
      timeline={timeline}
      timelineLabels={timelineLabels}
      constellationColors={Object.fromEntries(constellations.map((c) => [c.id, c.color]))}
    />
  );
}
