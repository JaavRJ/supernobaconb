import { constellations, eras, getNebulas } from "@/content";
import { content, type Content } from "@/lib/content";
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

function defaultLayout(c: Content, orientation: SkyOrientation): SkyLayout {
  return layoutSky({
    constellations,
    works: c.works.filter((w) => !w.hidden),
    threads: c.threads,
    orientation,
  });
}

function buildStarInfo(c: Content, layout: SkyLayout): SkyStarInfo[] {
  const byId = new Map(c.works.map((w) => [w.id, w]));
  const constellationNames = new Map(constellations.map((k) => [k.id, k.name]));
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
function soloInput(c: Content, id: ConstellationId) {
  return {
    constellations: constellations
      .filter((k) => k.id === id)
      .map((k) => ({ ...k, skyRegion: { x: 0.5, y: 0.45 } })),
    works: c.works
      .filter((w) => !w.hidden && w.constellation === id)
      .map((w) => ({ ...w, skyPosition: undefined })),
  };
}

export async function Sky({ layout, only }: SkyProps) {
  const c = await content();
  if (only) return <SoloSky c={c} id={only} />;
  return <FullSky c={c} layout={layout ?? defaultLayout(c, "landscape")} />;
}

/** Cielo de una sola constelación: sin nebulosas ni leyenda */
function SoloSky({ c, id }: { c: Content; id: ConstellationId }) {
  const input = soloInput(c, id);
  const landscape = layoutSky({ ...input, threads: c.threads, orientation: "landscape" });
  const portrait = layoutSky({ ...input, threads: c.threads, orientation: "portrait" });

  return (
    <SkyInteractive
      compact
      variants={{
        landscape: { layout: landscape, nebulas: [] },
        portrait: { layout: portrait, nebulas: [] },
      }}
      starInfo={buildStarInfo(c, landscape)}
      constellationColors={Object.fromEntries(constellations.map((k) => [k.id, k.color]))}
    />
  );
}

function FullSky({ c, layout }: { c: Content; layout: SkyLayout }) {
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
    const signal = c.getActiveSignal(era.id);
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
        portrait: { layout: defaultLayout(c, "portrait"), nebulas: neutral(layoutNebulas(eras, "portrait")) },
      }}
      starInfo={buildStarInfo(c, layout)}
      signals={signals}
      constellationColors={Object.fromEntries(constellations.map((k) => [k.id, k.color]))}
    />
  );
}
