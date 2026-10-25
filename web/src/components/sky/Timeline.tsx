"use client";

import type { CSSProperties } from "react";
import type { SkyEraInfo, SkyTimelineLabels } from "./meta";
import styles from "./Sky.module.css";
import type { TimelineData } from "./eraTimeline";

interface TimelineProps {
  data: TimelineData;
  eras: SkyEraInfo[];
  labels: Record<string, SkyTimelineLabels>;
  selectedEra: string | null;
  onSelect: (eraId: string) => void;
}

/** Eras como franjas horizontales sobre un eje de tiempo común; pueden encimarse */
export function Timeline({ data, eras, labels, selectedEra, onSelect }: TimelineProps) {
  const labelOf = new Map(eras.map((e) => [e.id, e.label]));

  return (
    <div className={styles.timeline}>
      <h3 className={styles.timelineTitle}>Línea de tiempo</h3>
      <ul className={styles.timelineRows}>
        {data.rows.map((row) => (
          <li key={row.eraId}>
            <button
              type="button"
              className={styles.timelineRow}
              style={{ "--accent": row.accent } as CSSProperties}
              aria-pressed={selectedEra === row.eraId}
              aria-label={labels[row.eraId]?.ariaLabel}
              onClick={() => onSelect(row.eraId)}
            >
              <span className={styles.timelineName}>{labelOf.get(row.eraId)}</span>
              <span className={styles.timelineTrack} aria-hidden="true">
                {row.segments.map((seg) => (
                  <span
                    key={seg.phase}
                    className={styles.segment}
                    data-phase={seg.phase}
                    data-fuzzy={seg.fuzzy ? "" : undefined}
                    style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
                  />
                ))}
                {row.markers.map((m) => (
                  <span key={m.workId} className={styles.marker} style={{ left: `${m.left}%` }} />
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.timelineAxis} aria-hidden="true">
        <span className={styles.timelineName} />
        <span className={styles.axisTrack}>
          {data.ticks.map((t) => (
            <span key={t.year} className={styles.tick} style={{ left: `${t.left}%` }}>
              {t.year}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
