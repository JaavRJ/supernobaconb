import { getPartMeta, isPartPublished, parsePartSlug } from "@/lib/book";
import { getPartPdf } from "@/lib/book/pdf";

/**
 * Descarga de una parte en PDF, generada del mismo texto de Firestore que el lector.
 * La generación está en caché dentro de `getPartPdf`; las cabeceras dejan que el CDN la reutilice
 * una hora sin que el navegador se quede con una copia vieja.
 */
export async function GET(_request: Request, ctx: RouteContext<"/libros/bduem/leer/[parte]/pdf">) {
  const { parte } = await ctx.params;
  const n = parsePartSlug(parte);
  const meta = n === null ? undefined : getPartMeta(n);
  if (n === null || !meta || !isPartPublished(meta, new Date())) {
    return new Response("Esta parte no existe o aún no se publica.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const bytes = await getPartPdf(n);
  if (!bytes) {
    return new Response("No pudimos preparar el PDF ahora. Intenta de nuevo en unos minutos.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" },
    });
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="BDUEM-Parte-${n}.pdf"`,
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
