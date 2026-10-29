import { partSlug } from "@/lib/book/publication";
import type { Content } from "@/lib/content";
import type { Work } from "@/types/content";

export interface Connection {
  id: string;
  text: string;
  href: string;
}

/** Hilos que tocan la obra o alguna de sus canciones, con su frase y enlace */
export function getConnections(c: Content, work: Work): Connection[] {
  const ids = new Set([work.id, ...(work.trackIds ?? [])]);
  const result: Connection[] = [];
  const seen = new Set<string>();
  for (const t of c.threads) {
    const incoming = ids.has(t.to);
    if (!incoming && !ids.has(t.from)) continue;
    const other = c.getWork(incoming ? t.from : t.to);
    if (!other || other.hidden) continue;
    const isBook = other.type === "libro";
    const part = other.parts?.find((p) => p.number === t.fromPart);
    let text: string;
    let href = other.href;
    if (t.kind === "inspira" && incoming && part) {
      text = `inspirada en la Parte ${part.number}: ${part.title}`;
      href = `${other.href}/leer/${partSlug(part.number)}`;
    } else if (t.kind === "inspira" && incoming) {
      text = `inspirada en ${other.title}`;
    } else if (t.kind === "guino") {
      text = isBook ? `guiño al libro ${other.title}` : `guiño a ${other.title}`;
    } else if (t.kind === "inspira") {
      text = `inspiración de ${other.title}`;
    } else if (t.kind === "continua") {
      text = `continúa ${other.title}`;
    } else if (t.kind === "comparte-universo") {
      text = `comparte universo con ${other.title}`;
    } else if (t.kind === "construye") {
      if (!incoming) {
        text = isBook ? `construido para el libro ${other.title}` : `construido para ${other.title}`;
      } else {
        text =
          other.type === "proyecto"
            ? `su sitio y su lector: ${other.title}`
            : `construido por ${other.title}`;
      }
    } else {
      continue;
    }
    const key = `${other.id}|${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ id: t.id, text, href });
  }
  return result;
}
