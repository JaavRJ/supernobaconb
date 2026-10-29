// Solo servidor: lee Firestore por REST dentro de funciones cacheadas. No lo importes desde componentes de cliente.

/** Valor tipado de la API REST de Firestore */
type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
};
type FsDocument = { name: string; fields?: Record<string, FsValue> };
type FsList = { documents?: FsDocument[]; nextPageToken?: string };

/** Documento ya convertido a objeto JS; `id` es el último tramo de su ruta */
export interface RawDoc {
  id: string;
  data: Record<string, unknown>;
}

export interface CollectionResult {
  docs: RawDoc[];
  /** Falló la red o el servidor (reintentar pronto); falta configuración o permisos no cuentan */
  transient: boolean;
}

const TIMEOUT_MS = 8000;

function baseUrl(): string | null {
  const id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return id ? `https://firestore.googleapis.com/v1/projects/${id}/databases/(default)/documents` : null;
}

/** Convierte un valor tipado de Firestore a JS: los `null` dentro de un mapa se descartan al convertir el mapa */
export function decodeValue(value: FsValue | undefined): unknown {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(decodeValue);
  if (value.mapValue) return decodeFields(value.mapValue.fields);
  return null;
}

function decodeFields(fields: Record<string, FsValue> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    const decoded = decodeValue(value);
    if (decoded !== null) out[key] = decoded;
  }
  return out;
}

/** Documentos de una colección, sin sesión (las reglas dejan leer el contenido público) */
export async function listCollection(name: string): Promise<CollectionResult> {
  const base = baseUrl();
  if (!base) return { docs: [], transient: false };
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const key = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
  const docs: RawDoc[] = [];
  let pageToken = "";
  try {
    do {
      const res = await fetch(`${base}/${name}?pageSize=100${key}${pageToken}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      // 4xx: sin permiso o sin colección, no se arregla reintentando; 5xx sí puede ser pasajero
      if (!res.ok) return { docs: [], transient: res.status >= 500 || res.status === 429 };
      const body = (await res.json()) as FsList;
      for (const d of body.documents ?? []) {
        docs.push({ id: d.name.split("/").pop() ?? "", data: decodeFields(d.fields) });
      }
      pageToken = body.nextPageToken ? `&pageToken=${encodeURIComponent(body.nextPageToken)}` : "";
    } while (pageToken);
    return { docs, transient: false };
  } catch {
    return { docs: [], transient: true };
  }
}
