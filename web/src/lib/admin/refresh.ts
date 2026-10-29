import { refreshContent, type RefreshResult } from "./actions";
import { getAdminIdToken } from "./token";

/** Pide al servidor que el sitio se actualice (por defecto la etiqueta `content`). Nunca lanza. */
export async function refreshSite(tags?: string[]): Promise<RefreshResult> {
  try {
    const token = await getAdminIdToken();
    return await refreshContent(token, tags);
  } catch {
    return { ok: false, error: "No se pudo actualizar el sitio." };
  }
}
