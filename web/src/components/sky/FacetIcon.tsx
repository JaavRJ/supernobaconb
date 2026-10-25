import type { ReactNode } from "react";

/** Ícono de trazo fino de cada faceta, dentro de un círculo; decorativo, va dentro de un <svg> */
interface FacetIconProps {
  constellation: string;
  x: number;
  y: number;
  /** Radio del círculo en unidades del viewBox */
  radius: number;
  dim?: boolean;
}

const GLYPHS: Record<string, ReactNode> = {
  // noba: libro abierto
  noba: <path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0zM12 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0z" />,
  // Supernoba: nota musical
  supernoba: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="16" r="2" />
    </>
  ),
  // Jabi: </>
  jabi: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />,
};

export function FacetIcon({ constellation, x, y, radius, dim }: FacetIconProps) {
  const glyph = GLYPHS[constellation];
  if (!glyph) return null;
  const scale = (radius * 0.95) / 24;
  return (
    <g
      aria-hidden="true"
      style={{ transition: "opacity 0.25s ease", opacity: dim ? 0.18 : 1, pointerEvents: "none" }}
    >
      <circle cx={x} cy={y} r={radius} fill="rgba(8, 12, 26, 0.6)" stroke="rgba(238, 240, 246, 0.35)" strokeWidth={1} />
      <g
        transform={`translate(${x - 12 * scale} ${y - 12 * scale}) scale(${scale})`}
        fill="none"
        stroke="#eef0f6"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyph}
      </g>
    </g>
  );
}
