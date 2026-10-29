"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/admin/Button";
import { constellations } from "@/content";
import { layoutSky, SKY_HEIGHT, SKY_MARGIN, SKY_WIDTH } from "@/components/sky/layout";
import type { Work } from "@/types/content";
import styles from "./SkyMap.module.css";

interface SkyMapProps {
  /** La obra que se edita, con su posición actual (o sin ella si es automática) */
  work: Work;
  /** Las demás obras del cielo */
  others: Work[];
  onChange: (position: { x: number; y: number } | undefined) => void;
}

const MIN_X = SKY_MARGIN / SKY_WIDTH;
const MAX_X = 1 - MIN_X;
const MIN_Y = SKY_MARGIN / SKY_HEIGHT;
const MAX_Y = 1 - MIN_Y;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function norm(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.round(clamp(x, MIN_X, MAX_X) * 1000) / 1000,
    y: Math.round(clamp(y, MIN_Y, MAX_Y) * 1000) / 1000,
  };
}

/** Mapa del cielo con la estrella de la obra arrastrable (puntero o flechas) para fijar su `skyPosition`. */
export function SkyMap({ work, others, onChange }: SkyMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const layout = useMemo(
    () =>
      layoutSky({
        constellations,
        works: [...others.filter((w) => !w.hidden && w.id !== work.id), work],
      }),
    [others, work],
  );

  const mine = layout.stars.find((s) => s.workId === work.id);
  const sameConstellation = layout.stars.filter((s) => s.constellation === work.constellation && s.workId !== work.id);
  const otherStars = layout.stars.filter((s) => s.constellation !== work.constellation);
  const lines = layout.lines.filter((l) => l.constellation === work.constellation);
  const color = constellations.find((c) => c.id === work.constellation)?.color ?? "#ffffff";
  const manual = Boolean(work.skyPosition);

  if (!mine) return null;

  const fromPointer = (e: PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    onChange(norm((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.05 : 0.01;
    const dx = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
    const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    onChange(norm(mine.x / SKY_WIDTH + dx, mine.y / SKY_HEIGHT + dy));
  };

  return (
    <div className={styles.root}>
      <svg
        ref={svgRef}
        className={styles.map}
        viewBox={`0 0 ${SKY_WIDTH} ${SKY_HEIGHT}`}
        role="group"
        aria-label="Mapa del cielo"
        onPointerMove={(e) => {
          if (dragging) fromPointer(e);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <rect
          x={SKY_MARGIN}
          y={SKY_MARGIN}
          width={SKY_WIDTH - 2 * SKY_MARGIN}
          height={SKY_HEIGHT - 2 * SKY_MARGIN}
          className={styles.area}
        />
        {layout.labels.map((l) => (
          <text key={l.constellation} x={l.x} y={l.y} className={styles.label} textAnchor="middle">
            {l.name}
          </text>
        ))}
        {lines.map((l) => (
          <line key={`${l.from}-${l.to}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} className={styles.line} />
        ))}
        {otherStars.map((s) => (
          <circle key={s.workId} cx={s.x} cy={s.y} r={s.r + 3} fill={s.color} className={styles.far} />
        ))}
        {sameConstellation.map((s) => (
          <circle key={s.workId} cx={s.x} cy={s.y} r={s.r + 6} fill={color} className={styles.near}>
            <title>{others.find((w) => w.id === s.workId)?.title ?? s.workId}</title>
          </circle>
        ))}
        <g
          className={`${styles.mine} ${dragging ? styles.mineDragging : ""}`}
          tabIndex={0}
          role="slider"
          aria-label={`Posición de ${work.title || "la obra"} en el cielo`}
          aria-valuetext={`x ${Math.round((mine.x / SKY_WIDTH) * 100)} %, y ${Math.round((mine.y / SKY_HEIGHT) * 100)} %${manual ? "" : ", automática"}`}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            svgRef.current?.setPointerCapture(e.pointerId);
            setDragging(true);
            fromPointer(e);
          }}
        >
          <circle cx={mine.x} cy={mine.y} r={34} fill="transparent" />
          <circle cx={mine.x} cy={mine.y} r={mine.r + 12} fill={color} className={styles.halo} />
          <circle cx={mine.x} cy={mine.y} r={mine.r + 5} fill="#ffffff" stroke={color} strokeWidth={3} />
        </g>
      </svg>
      <p className={styles.status}>
        {manual
          ? `Posición manual: x ${Math.round((work.skyPosition?.x ?? 0) * 100)} %, y ${Math.round((work.skyPosition?.y ?? 0) * 100)} %.`
          : "Posición automática: el sitio la calcula solo."}
      </p>
      <p className={styles.help}>
        Arrastra la estrella brillante, o enfócala y usa las flechas (con Mayús, pasos grandes). Las otras de su
        constelación se ven más tenues; las de las demás, apenas.
      </p>
      <div>
        <Button variant="quiet" small disabled={!manual} onClick={() => onChange(undefined)}>
          Volver a automática
        </Button>
      </div>
    </div>
  );
}
