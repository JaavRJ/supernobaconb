/**
 * Verificación de admin en el servidor (la usan la Server Action y las rutas de /api/admin).
 * 1) Identity Toolkit comprueba el token y da el uid. 2) Con ese mismo token se lee
 * `adminUsers/{uid}` por la API REST de Firestore: las reglas solo dejan leerlo a su dueño.
 */
export type AdminCheck =
  | { ok: true; uid: string }
  | { ok: false; status: 401 | 403 | 503; error: string };

export async function verifyAdminToken(idToken: unknown): Promise<AdminCheck> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    return { ok: false, status: 503, error: "Firebase no está configurado en el servidor." };
  }
  if (typeof idToken !== "string" || idToken.length < 20 || idToken.length > 4096) {
    return { ok: false, status: 401, error: "Falta iniciar sesión." };
  }

  try {
    const lookup = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!lookup.ok) return { ok: false, status: 401, error: "La sesión no es válida. Vuelve a iniciar sesión." };
    const found = (await lookup.json()) as { users?: { localId?: string }[] };
    const uid = found.users?.[0]?.localId;
    if (!uid) return { ok: false, status: 401, error: "La sesión no es válida. Vuelve a iniciar sesión." };

    const doc = await fetch(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/adminUsers/${encodeURIComponent(uid)}`,
      { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    if (!doc.ok) return { ok: false, status: 403, error: "Esta cuenta no tiene acceso." };
    const data = (await doc.json()) as { fields?: { role?: { stringValue?: string } } };
    if (data.fields?.role?.stringValue !== "admin") {
      return { ok: false, status: 403, error: "Esta cuenta no tiene acceso." };
    }
    return { ok: true, uid };
  } catch {
    return { ok: false, status: 503, error: "No se pudo verificar la cuenta. Inténtalo de nuevo." };
  }
}
