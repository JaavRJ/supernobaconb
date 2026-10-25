import { constellations, eras, getActiveSignal, getNebulas, threads, works } from "@/content";
import type { ConstellationId } from "@/types/content";
import { layoutNebulas, layoutSky, type SkyLayout, type SkyNebula, type SkyOrientation } from "./layout";
import { TYPE_LABELS, type SkySignal, type SkyStarInfo } from "./meta";
import { SkyInteractive } from "./SkyInteractive";

interface SkyProps {
  /** Cielo apaisado ya calculado; por defecto se calcula con los datos de `@/content` */
  layout?: SkyLayout;
  /** Muestra solo esta constelación, sin nebulosas ni leyenda */
  only?: ConstellationId;
}

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function defaultLayout(orientation: SkyOrientation): SkyLayout {
  return layoutSky({ constellations, works: works.filter((w) => !w.hidden), threads, orientation });
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

/** Una sola constelación, centrada y con posiciones automáticas (las manuales eran para el cielo completo) */
function soloInput(id: ConstellationId) {
  return {
    constellations: constellations
      .filter((c) => c.id === id)
      .map((c) => ({ ...c, skyRegion: { x: 0.5, y: 0.45 } })),
    works: works
      .filter((w) => !w.hidden && w.constellation === id)
      .map((w) => ({ ...w, skyPosition: undefined })),
  };
}

export function Sky({ layout, only }: SkyProps) {
  if (only) return <SoloSky id={only} />;
  return <FullSky layout={layout ?? defaultLayout("landscape")} />;
}

/** Cielo de una sola constelación: sin nebulosas ni leyenda */
function SoloSky({ id }: { id: ConstellationId }) {
  const input = soloInput(id);
  const landscape = layoutSky({ ...input, threads, orientation: "landscape" });
  const portrait = layoutSky({ ...input, threads, orientation: "portrait" });

  return (
    <SkyInteractive
      compact
      variants={{
        landscape: { layout: landscape, nebulas: [] },
        portrait: { layout: portrait, nebulas: [] },
      }}
      starInfo={buildStarInfo(landscape)}
      constellationColors={Object.fromEntries(constellations.map((c) => [c.id, c.color]))}
    />
  );
}

function FullSky({ layout }: { layout: SkyLayout }) {
  // Cada nebulosa viaja al navegador con un nombre neutro: ni el id de su era ni el de su señal
  const alias = new Map(getNebulas().map((era, i) => [era.id, `nebulosa-${i + 1}`]));
  const neutral = (nebulas: SkyNebula[]) =>
    nebulas.flatMap((n) => {
      const id = alias.get(n.eraId);
      return id ? [{ ...n, eraId: id }] : [];
    });

  // La señal se elige en el servidor; solo viaja la de la nebulosa, sin nombre ni obras
  const signals: Record<string, SkySignal | null> = {};
  for (const era of getNebulas()) {
    const id = alias.get(era.id)!;
    const signal = getActiveSignal(era.id);
    signals[id] = signal
      ? {
          id: `${id}-senal`,
          kind: signal.kind,
          content: signal.content,
          ...(signal.alt !== undefined ? { alt: signal.alt } : {}),
        }
      : null;
  }

  return (
    <SkyInteractive
      variants={{
        landscape: { layout, nebulas: neutral(layoutNebulas(eras, "landscape")) },
        portrait: { layout: defaultLayout("portrait"), nebulas: neutral(layoutNebulas(eras, "portrait")) },
      }}
      starInfo={buildStarInfo(layout)}
      signals={signals}
      constellationColors={Object.fromEntries(constellations.map((c) => [c.id, c.color]))}
    />
  );
}
