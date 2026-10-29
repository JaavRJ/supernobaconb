import type { Thread } from "@/types/content";

export const threads: Thread[] = [
  {
    id: "bduem-inspira-part3",
    from: "bduem",
    to: "nohablobien-part3",
    kind: "inspira",
    fromPart: 3,
    note: "La letra de part3 está inspirada en la Parte 3: Supernoba",
  },
  {
    id: "bduem-guino-rulos",
    from: "bduem",
    to: "rulos",
    kind: "guino",
  },
  {
    id: "bduem-guino-nohablobien",
    from: "bduem",
    to: "nohablobien-part3",
    kind: "guino",
    note: "nohablobien guarda pequeñas referencias al libro",
  },
  {
    id: "web-construye-bduem",
    from: "supernobaconb-web",
    to: "bduem",
    kind: "construye",
  },
];
