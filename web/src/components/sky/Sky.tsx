import type { CSSProperties } from "react";
import { constellations, works } from "@/content";
import { layoutSky, SKY_HEIGHT, SKY_WIDTH, type SkyLayout } from "./layout";
import styles from "./Sky.module.css";

interface SkyProps {
  /** Layout ya calculado; por defecto se calcula con los datos de `@/content` */
  layout?: SkyLayout;
}

function defaultLayout(): SkyLayout {
  return layoutSky({ constellations, works: works.filter((w) => !w.hidden) });
}

export function Sky({ layout = defaultLayout() }: SkyProps) {
  const titles = new Map(works.map((w) => [w.id, w.title]));
  const colors = new Map(constellations.map((c) => [c.id, c.color]));

  return (
    <svg
      className={styles.sky}
      viewBox={`0 0 ${SKY_WIDTH} ${SKY_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby="sky-title sky-desc"
    >
      <title id="sky-title">Mapa del cielo de Supernoba</title>
      <desc id="sky-desc">
        Tres constelaciones, una por faceta del artista. Cada estrella es una obra; las más
        recientes brillan más.
      </desc>

      <defs>
        {constellations.map((c) => (
          <radialGradient key={c.id} id={`sky-halo-${c.id}`}>
            <stop offset="0%" stopColor={c.color} stopOpacity="0.9" />
            <stop offset="35%" stopColor={c.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={c.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      <g className={styles.lines}>
        {layout.lines.map((l) => (
          <line
            key={`${l.from}-${l.to}`}
            data-constellation={l.constellation}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={colors.get(l.constellation)}
          />
        ))}
      </g>

      <g className={styles.stars}>
        {layout.stars.map((s, i) => {
          const twinkle = {
            "--twinkle-delay": `${((i * 0.9) % 4).toFixed(1)}s`,
            "--twinkle-duration": `${(3.2 + (i % 3) * 0.8).toFixed(1)}s`,
          } as CSSProperties;
          return (
            <g
              key={s.workId}
              className={s.unreleased ? styles.unreleased : styles.star}
              data-work-id={s.workId}
              data-constellation={s.constellation}
              style={twinkle}
            >
              <title>{titles.get(s.workId) ?? s.workId}</title>
              {s.unreleased ? (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r + 2}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  opacity={0.55}
                />
              ) : (
                <>
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={s.r * (3 + 4 * s.brightness)}
                    fill={`url(#sky-halo-${s.constellation})`}
                    opacity={s.brightness}
                  />
                  <g className={styles.core}>
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={s.r * (0.6 + 0.4 * s.brightness)}
                      fill={s.color}
                      opacity={0.55 + 0.45 * s.brightness}
                    />
                  </g>
                </>
              )}
            </g>
          );
        })}
      </g>

      <g className={styles.labels}>
        {layout.labels.map((l) => (
          <text key={l.constellation} x={l.x} y={l.y} textAnchor="middle">
            <tspan className={styles.name}>{l.name}</tspan>
            <tspan className={styles.facet} x={l.x} dy={22}>
              {l.facet}
            </tspan>
          </text>
        ))}
      </g>
    </svg>
  );
}
