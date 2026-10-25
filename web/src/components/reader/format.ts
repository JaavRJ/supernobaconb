const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-12-22" -> "22 de diciembre de 2026" */
export function formatReleaseDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

/** Una parte se publica al comenzar su día en México (UTC-6 todo el año) */
export function releaseInstant(date: string): number {
  return Date.parse(`${date}T00:00:00-06:00`);
}
