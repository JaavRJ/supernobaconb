/**
 * Tema visual de una era. Cada campo se expone como variable CSS
 * (ver ERA_THEME_VARS) y el sitio entero se pinta con ellas.
 */
export interface EraThemeTokens {
  /** Fondo de la página */
  bg: string;
  /** Fondo de tarjetas, menús y reproductor */
  bgElevated: string;
  /** Texto principal */
  fg: string;
  /** Texto secundario */
  fgMuted: string;
  /** Color de acento: links, botones, estrella activa */
  accent: string;
  /** Texto sobre el color de acento */
  accentContrast: string;
  /** Bordes, líneas de constelación, separadores */
  line: string;
  /** Resplandor de estrellas y elementos activos */
  glow: string;
  /** Familia tipográfica de títulos */
  fontDisplay: string;
  /** Familia tipográfica de texto */
  fontBody: string;
  /** Fondo decorativo de la era */
  backdrop: "stars" | "grain" | "none";
}

export const ERA_THEME_VARS: Record<Exclude<keyof EraThemeTokens, "backdrop">, string> = {
  bg: "--era-bg",
  bgElevated: "--era-bg-elevated",
  fg: "--era-fg",
  fgMuted: "--era-fg-muted",
  accent: "--era-accent",
  accentContrast: "--era-accent-contrast",
  line: "--era-line",
  glow: "--era-glow",
  fontDisplay: "--era-font-display",
  fontBody: "--era-font-body",
};
