import { createHash } from "node:crypto";
import { verifyAdminToken } from "@/lib/admin/verify";

const ROOT_FOLDER = "supernoba";

/** Carpeta siempre bajo `supernoba/`; cada tramo solo con letras minúsculas, números, guion y guion bajo. */
function safeFolder(raw: unknown): string {
  const text = typeof raw === "string" ? raw : "";
  const parts = text
    .split("/")
    .map((p) => p.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
    .filter(Boolean)
    .slice(0, 4);
  if (parts[0] === ROOT_FOLDER) parts.shift();
  return [ROOT_FOLDER, ...parts].join("/");
}

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Firma una subida directa a Cloudinary. Solo para admins (token de Firebase verificado
 * en el servidor). Parámetros firmados: folder y timestamp, ordenados alfabéticamente
 * y unidos con `&`, más el secreto, con SHA-1.
 */
export async function POST(request: Request) {
  let body: { idToken?: unknown; folder?: unknown; resourceType?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }

  const check = await verifyAdminToken(body.idToken);
  if (!check.ok) return json({ error: check.error }, check.status);

  if (body.resourceType !== "image" && body.resourceType !== "video") {
    return json({ error: "Tipo de archivo no válido." }, 400);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return json(
      { error: "Cloudinary no está configurado: faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env.local." },
      503,
    );
  }

  const folder = safeFolder(body.folder);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return json({ signature, timestamp, apiKey, cloudName, folder }, 200);
}
