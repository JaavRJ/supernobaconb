import type { Era } from "@/types/content";

export const eras: Era[] = [
  {
    id: "bduem",
    name: "Brillo de una Estrella Muerta",
    coreWorkId: "bduem",
    phase: "orbita",
    phaseDates: { encendida: "2025-12-01", orbita: "2026-03-13" },
    description:
      "La primera era: un libro en cuatro partes y las canciones, videos y proyectos que nacieron de él.",
    theme: {
      bg: "#120d07",
      bgElevated: "#1d150c",
      fg: "#f6ecd8",
      fgMuted: "#b9a888",
      accent: "#e7c27a",
      accentContrast: "#120d07",
      line: "rgba(246,236,216,0.16)",
      glow: "rgba(231,194,122,0.4)",
      fontDisplay: "var(--font-cinzel, 'Cinzel Decorative', serif)",
      fontBody: "var(--font-crimson, 'Crimson Pro', Georgia, serif)",
      backdrop: "stars",
    },
  },
  {
    id: "era-2",
    name: null,
    coreWorkId: null,
    phase: "nebulosa",
    phaseDates: { nebulosa: "2026-09-01" },
    description: "Una nube tenue. Todavía no se deja ver.",
    theme: {
      bg: "#0e0a12",
      bgElevated: "#18111e",
      fg: "#ece6f0",
      fgMuted: "#9d90a8",
      accent: "#c27ba0",
      accentContrast: "#0e0a12",
      line: "rgba(236,230,240,0.14)",
      glow: "rgba(194,123,160,0.32)",
      fontDisplay: "var(--font-inter, system-ui, sans-serif)",
      fontBody: "var(--font-inter, system-ui, sans-serif)",
      backdrop: "grain",
    },
  },
];
