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
      bg: "#05060a",
      bgElevated: "#0e1017",
      fg: "#f4f1ea",
      fgMuted: "#9a978f",
      accent: "#e8d9b0",
      accentContrast: "#05060a",
      line: "rgba(244,241,234,0.16)",
      glow: "rgba(232,217,176,0.35)",
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
      bg: "#07060a",
      bgElevated: "#111016",
      fg: "#efecf0",
      fgMuted: "#8f8b95",
      accent: "#b8708f",
      accentContrast: "#07060a",
      line: "rgba(239,236,240,0.14)",
      glow: "rgba(184,112,143,0.3)",
      fontDisplay: "var(--font-inter, system-ui, sans-serif)",
      fontBody: "var(--font-inter, system-ui, sans-serif)",
      backdrop: "grain",
    },
  },
];
