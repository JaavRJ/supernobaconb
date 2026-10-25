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
      bg: "#000000",
      bgElevated: "#0b0b0b",
      fg: "#e0e0e0",
      fgMuted: "#9a9a9a",
      accent: "#ffffff",
      accentContrast: "#000000",
      line: "rgba(255,255,255,0.12)",
      glow: "rgba(255,255,255,0.3)",
      fontDisplay: "var(--font-uncial, 'Uncial Antiqua', serif)",
      fontBody: "var(--font-cormorant, 'Cormorant Garamond', 'Times New Roman', serif)",
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
