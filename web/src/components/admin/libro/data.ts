"use client";

import { withoutUndefined } from "@/lib/admin/clean";

/** Lecturas y escrituras del libro en Firestore (SDK del cliente); las mismas rutas que el sitio viejo. */

async function firestore() {
  const [fs, { getDb }] = await Promise.all([import("firebase/firestore"), import("@/lib/firebase")]);
  return { fs, db: getDb() };
}

export interface BookPartMeta {
  number: number;
  title: string;
  subtitle?: string;
  releaseDate: string;
}

/** `parts` de la obra `bduem`; `null` si el documento aún no existe */
export async function readWorkParts(): Promise<BookPartMeta[] | null> {
  const { fs, db } = await firestore();
  const snap = await fs.getDoc(fs.doc(db, "works", "bduem"));
  if (!snap.exists()) return null;
  const parts = snap.data().parts;
  return Array.isArray(parts) ? (parts as BookPartMeta[]) : [];
}

export async function writeWorkParts(parts: BookPartMeta[]): Promise<void> {
  const { fs, db } = await firestore();
  await fs.updateDoc(fs.doc(db, "works", "bduem"), { parts: withoutUndefined(parts) });
}

export interface PartChapterDocs {
  /** Ids de los documentos de `parts/{n}/chapters`, en el orden en que el sitio los une */
  ids: string[];
  /** Contenido unido igual que lo lee el sitio (`fetchPartHtml`) */
  html: string;
}

export async function readPartText(partNumber: number): Promise<PartChapterDocs> {
  const { fs, db } = await firestore();
  const snap = await fs.getDocs(fs.collection(db, "parts", String(partNumber), "chapters"));
  const docs = snap.docs.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {
    ids: docs.map((d) => d.id),
    html: docs.map((d) => String(d.data().content ?? "")).join("\n"),
  };
}

/**
 * Guarda el texto completo de la parte en `parts/{n}/chapters/{docId}` (por defecto `0`) sin tocar los demás campos del documento
 * (`number`, `title`); si no existía, lo crea con el título de la parte.
 */
export async function writePartText(
  partNumber: number,
  partTitle: string,
  html: string,
  docId = "0",
): Promise<void> {
  const { fs, db } = await firestore();
  const ref = fs.doc(db, "parts", String(partNumber), "chapters", docId);
  const existing = await fs.getDoc(ref);
  const base = existing.exists() ? {} : { number: "1", title: partTitle };
  await fs.setDoc(ref, { ...base, content: html, updatedAt: fs.serverTimestamp() }, { merge: true });
}

export interface AuthorNoteDoc {
  id: string;
  partNumber: number;
  chapterIndex: number;
  triggerText: string;
  noteTitle: string;
  noteContent: string;
  type: "tooltip" | "modal";
}

export async function writeAuthorNote(note: AuthorNoteDoc): Promise<void> {
  const { fs, db } = await firestore();
  await fs.setDoc(fs.doc(db, "authorNotes", note.id), withoutUndefined({ ...note, createdAt: fs.serverTimestamp() }), {
    merge: true,
  });
}

/** Primer id numérico libre a partir de `candidate` (comprueba Firestore, no solo la lista en pantalla) */
export async function freeNoteId(candidate: number): Promise<string> {
  const { fs, db } = await firestore();
  let n = candidate;
  while ((await fs.getDoc(fs.doc(db, "authorNotes", String(n)))).exists()) n += 1;
  return String(n);
}

export async function deleteAuthorNote(id: string): Promise<void> {
  const { fs, db } = await firestore();
  await fs.deleteDoc(fs.doc(db, "authorNotes", id));
}
