"use server";

import { updateTag } from "next/cache";
import { verifyAdminToken } from "./verify";

export type RefreshResult = { ok: true } | { ok: false; error: string };

const TAG_PATTERN = /^[\w:.-]{1,64}$/;

/**
 * Expira el caché del contenido para que el sitio muestre lo recién guardado.
 * Solo la puede usar un admin: se verifica el token en el servidor.
 */
export async function refreshContent(idToken: string, tags: string[] = ["content"]): Promise<RefreshResult> {
  const check = await verifyAdminToken(idToken);
  if (!check.ok) return { ok: false, error: check.error };

  const list = Array.isArray(tags) ? tags.filter((t) => typeof t === "string" && TAG_PATTERN.test(t)) : [];
  const unique = [...new Set(list.length > 0 ? list : ["content"])].slice(0, 10);
  for (const tag of unique) updateTag(tag);
  return { ok: true };
}
