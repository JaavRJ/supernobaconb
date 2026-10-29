/** Utilidades puras de la lista de suscriptores: normalización de intereses y CSV. */

export type InterestFilter = "todos" | "libro" | "musica" | "novedades";

export interface SubscriberRow {
  id: string;
  email: string;
  name: string;
  /** ISO o vacío */
  subscribedAt: string;
  /** Intereses ya normalizados: libro, musica, novedades (u otros tal cual) */
  interests: string[];
  /** Venía del sitio viejo (sin `interests`) */
  legacy: boolean;
}

export const INTEREST_LABELS: Record<string, string> = {
  libro: "Libro",
  musica: "Música",
  novedades: "Novedades",
};

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/** Minúsculas y sin acentos, para comparar y buscar */
const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Convierte un documento de `subscribers` en una fila; acepta el esquema del sitio viejo y el nuevo. */
export function toRow(id: string, data: Record<string, unknown>): SubscriberRow {
  const interests = strings(data.interests).map(normalize).filter(Boolean);
  const notifyFor = strings(data.notifyFor).map(normalize);
  const legacy = interests.length === 0;
  const merged = new Set(interests);
  if (notifyFor.some((n) => /^parte\d+$/.test(n))) merged.add("libro");
  if (notifyFor.includes("novedades")) merged.add("novedades");
  return {
    id,
    email: typeof data.email === "string" ? data.email : "",
    name: typeof data.displayName === "string" ? data.displayName : "",
    subscribedAt: typeof data.subscribedAt === "string" ? data.subscribedAt : "",
    interests: [...merged],
    legacy,
  };
}

export const interestLabel = (interest: string) => INTEREST_LABELS[interest] ?? interest;

/** Fecha local legible en español, o guion si falta o no es válida */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/** AAAA-MM-DD en hora local */
export function isoDay(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** Escapa un valor CSV (RFC 4180): comillas dobles si trae coma, comilla o salto de línea */
export function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** CSV completo (con BOM para que Excel respete los acentos) de las filas dadas */
export function buildCsv(rows: SubscriberRow[]): string {
  const header = ["correo", "nombre", "fecha", "intereses", "origen"];
  const lines = rows.map((r) => {
    const when = new Date(r.subscribedAt);
    const date = r.subscribedAt && !Number.isNaN(when.getTime()) ? isoDay(when) : "";
    return [r.email, r.name, date, r.interests.join(";"), r.legacy ? "sitio viejo" : "sitio nuevo"]
      .map(csvCell)
      .join(",");
  });
  return "﻿" + [header.join(","), ...lines].join("\r\n") + "\r\n";
}

export function matches(row: SubscriberRow, filter: InterestFilter, query: string): boolean {
  if (filter !== "todos" && !row.interests.includes(filter)) return false;
  const q = normalize(query);
  if (!q) return true;
  return normalize(row.email).includes(q) || normalize(row.name).includes(q);
}
