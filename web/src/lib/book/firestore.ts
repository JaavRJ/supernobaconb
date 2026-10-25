import type { AuthorNote } from "@/types/book";

// Valores de Firestore REST: { stringValue } / { integerValue } ...
type FsValue = { stringValue?: string; integerValue?: string };
type FsDocument = { name: string; fields?: Record<string, FsValue> };
type FsList = { documents?: FsDocument[]; nextPageToken?: string };

function baseUrl(): string | null {
  const id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return id ? `https://firestore.googleapis.com/v1/projects/${id}/databases/(default)/documents` : null;
}

/** Lista documentos sin sesión; `null` si falta la configuración o falla la red */
async function listDocuments(path: string): Promise<FsDocument[] | null> {
  const base = baseUrl();
  if (!base) return null;
  const docs: FsDocument[] = [];
  let pageToken = "";
  try {
    do {
      const res = await fetch(`${base}/${path}?pageSize=100${pageToken}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const body = (await res.json()) as FsList;
      docs.push(...(body.documents ?? []));
      pageToken = body.nextPageToken ? `&pageToken=${encodeURIComponent(body.nextPageToken)}` : "";
    } while (pageToken);
    return docs;
  } catch {
    return null;
  }
}

const str = (v?: FsValue) => v?.stringValue ?? "";
const int = (v?: FsValue) => Number(v?.integerValue ?? v?.stringValue ?? NaN);

/** HTML crudo de la parte (`parts/{n}/chapters`, un doc por parte); `null` si no se pudo leer */
export async function fetchPartHtml(partNumber: number): Promise<string | null> {
  const docs = await listDocuments(`parts/${partNumber}/chapters`);
  if (!docs) return null;
  const html = docs.map((d) => str(d.fields?.content)).join("\n");
  return html.trim() ? html : null;
}

/** Todas las notas del autor; `null` si no se pudo leer */
export async function fetchAuthorNotes(): Promise<AuthorNote[] | null> {
  const docs = await listDocuments("authorNotes");
  if (!docs) return null;
  const notes: AuthorNote[] = [];
  for (const d of docs) {
    const f = d.fields ?? {};
    const partNumber = int(f.partNumber);
    const triggerText = str(f.triggerText);
    if (!Number.isInteger(partNumber) || !triggerText.trim()) continue;
    notes.push({
      id: str(f.id) || d.name.split("/").pop() || "",
      partNumber,
      triggerText,
      title: str(f.noteTitle),
      content: str(f.noteContent),
      type: str(f.type) === "modal" ? "modal" : "tooltip",
    });
  }
  return notes.sort((a, b) => a.partNumber - b.partNumber || Number(a.id) - Number(b.id));
}
