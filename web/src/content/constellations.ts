import type { Constellation } from "@/types/content";

export const constellations: Constellation[] = [
  {
    id: "jabi",
    name: "Jabi",
    facet: "el que piensa",
    description: "Proyectos de software, herramientas, experimentos, puzzles y secretos.",
    color: "#e6f2f7",
    skyRegion: { x: 0.2, y: 0.35 },
  },
  {
    id: "noba",
    name: "noba",
    facet: "el que escribe",
    description: "Los libros y textos: Brillo de una Estrella Muerta y los que vienen.",
    color: "#ffffff",
    skyRegion: { x: 0.5, y: 0.6 },
  },
  {
    id: "supernoba",
    name: "Supernoba",
    facet: "el que canta",
    description: "Sencillos, EPs, discos y videos.",
    color: "#eceefa",
    skyRegion: { x: 0.8, y: 0.35 },
  },
];
