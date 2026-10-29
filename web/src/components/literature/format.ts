import type { WritingKind } from "@/types/content";

export const KIND_LABEL: Record<WritingKind, string> = {
  letra: "LETRA",
  poema: "POEMA",
  texto: "TEXTO",
};

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-03-13" -> "13 de marzo de 2026" */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}
