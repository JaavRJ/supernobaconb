import {
  localClear,
  localClearProgress,
  localDelete,
  localGetPreferences,
  localGetProgress,
  localList,
  localSave,
  localSetPreferences,
  localSetProgress,
  PART_NUMBERS,
} from "./local";
import { MAX_NOTE_LENGTH, sanitizeText } from "./sanitize";
import type {
  Bookmark,
  Highlight,
  ItemKind,
  ItemTypes,
  Quote,
  ReaderPreferences,
  ReaderUser,
  ReadingProgress,
  UserProfile,
} from "./types";

/**
 * Servicio de datos del lector. Cada función recibe el `uid` (o null sin sesión):
 * con sesión lee y escribe `users/{uid}/...` en Firestore; sin sesión usa
 * localStorage. Firebase se importa dinámicamente, solo cuando hay sesión.
 */

async function firestore() {
  const [fs, { getDb }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase"),
  ]);
  return { fs, db: getDb() };
}

/** Firestore rechaza `undefined`: lo quitamos antes de escribir. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ---------------------------------------------------------------------------
// Elementos con id: resaltados, citas y marcadores
// ---------------------------------------------------------------------------

function normalize<K extends ItemKind>(kind: K, item: ItemTypes[K]): ItemTypes[K] {
  if (kind === "bookmarks") {
    const b = item as Bookmark;
    return {
      ...b,
      note: b.note ? sanitizeText(b.note, MAX_NOTE_LENGTH) : undefined,
    } as ItemTypes[K];
  }
  const t = item as Highlight | Quote;
  return { ...t, text: sanitizeText(t.text) } as ItemTypes[K];
}

export async function listItems<K extends ItemKind>(
  kind: K,
  uid: string | null,
): Promise<ItemTypes[K][]> {
  if (!uid) return localList(kind);
  const { fs, db } = await firestore();
  const snap = await fs.getDocs(fs.collection(db, "users", uid, kind));
  return snap.docs.map((d) => d.data() as ItemTypes[K]);
}

export async function saveItem<K extends ItemKind>(
  kind: K,
  uid: string | null,
  item: ItemTypes[K],
): Promise<ItemTypes[K]> {
  const safe = clean(normalize(kind, item));
  if (!uid) {
    localSave(kind, safe);
    return safe;
  }
  const { fs, db } = await firestore();
  await fs.setDoc(fs.doc(db, "users", uid, kind, safe.id), safe);
  return safe;
}

export async function deleteItem(
  kind: ItemKind,
  uid: string | null,
  id: string,
): Promise<void> {
  if (!uid) {
    localDelete(kind, id);
    return;
  }
  const { fs, db } = await firestore();
  await fs.deleteDoc(fs.doc(db, "users", uid, kind, id));
}

export const listHighlights = (uid: string | null) => listItems("highlights", uid);
export const saveHighlight = (uid: string | null, h: Highlight) =>
  saveItem("highlights", uid, h);
export const deleteHighlight = (uid: string | null, id: string) =>
  deleteItem("highlights", uid, id);

export const listQuotes = (uid: string | null) => listItems("quotes", uid);
export const saveQuote = (uid: string | null, q: Quote) => saveItem("quotes", uid, q);
export const deleteQuote = (uid: string | null, id: string) =>
  deleteItem("quotes", uid, id);

export const listBookmarks = (uid: string | null) => listItems("bookmarks", uid);
export const saveBookmark = (uid: string | null, b: Bookmark) =>
  saveItem("bookmarks", uid, b);
export const deleteBookmark = (uid: string | null, id: string) =>
  deleteItem("bookmarks", uid, id);

// ---------------------------------------------------------------------------
// Progreso de lectura: readingProgress/part-{n}
// ---------------------------------------------------------------------------

export async function listProgress(uid: string | null): Promise<ReadingProgress[]> {
  if (!uid) {
    return PART_NUMBERS.map(localGetProgress).filter(
      (p): p is ReadingProgress => p !== null,
    );
  }
  const { fs, db } = await firestore();
  const snap = await fs.getDocs(fs.collection(db, "users", uid, "readingProgress"));
  return snap.docs.map((d) => d.data() as ReadingProgress);
}

export async function saveProgress(
  uid: string | null,
  progress: ReadingProgress,
): Promise<void> {
  if (!uid) {
    localSetProgress(progress);
    return;
  }
  const { fs, db } = await firestore();
  await fs.setDoc(
    fs.doc(db, "users", uid, "readingProgress", `part-${progress.partNumber}`),
    clean(progress),
  );
}

export async function clearProgress(uid: string | null, part: number): Promise<void> {
  if (!uid) {
    localClearProgress(part);
    return;
  }
  const { fs, db } = await firestore();
  await fs.deleteDoc(fs.doc(db, "users", uid, "readingProgress", `part-${part}`));
}

/** Escritor con espera: junta muchos cambios de scroll en una sola escritura. */
export function createProgressWriter(delayMs = 2000) {
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  const pending = new Map<number, { uid: string | null; progress: ReadingProgress }>();

  const run = (part: number) => {
    const entry = pending.get(part);
    pending.delete(part);
    timers.delete(part);
    if (entry) void saveProgress(entry.uid, entry.progress).catch(() => undefined);
  };

  return {
    schedule(uid: string | null, progress: ReadingProgress) {
      const part = progress.partNumber;
      pending.set(part, { uid, progress });
      const previous = timers.get(part);
      if (previous) clearTimeout(previous);
      timers.set(part, setTimeout(() => run(part), delayMs));
    },
    /** Escribe ya lo pendiente (al ocultar la pestaña o desmontar). */
    flush() {
      for (const [part, timer] of [...timers]) {
        clearTimeout(timer);
        run(part);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Preferencias: preferences/settings
// ---------------------------------------------------------------------------

export function defaultPreferences(): ReaderPreferences {
  const now = new Date().toISOString();
  return {
    readingMode: "vertical",
    fontSize: 20,
    hasSeenTutorial: false,
    hasConfigured: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getPreferences(uid: string | null): Promise<ReaderPreferences> {
  if (uid) {
    try {
      const { fs, db } = await firestore();
      const snap = await fs.getDoc(fs.doc(db, "users", uid, "preferences", "settings"));
      if (snap.exists()) {
        const prefs = { ...defaultPreferences(), ...(snap.data() as ReaderPreferences) };
        localSetPreferences(prefs);
        return prefs;
      }
    } catch {
      // Sin red o sin permiso: se usa lo guardado en este navegador.
    }
  }
  return { ...defaultPreferences(), ...(localGetPreferences() ?? {}) };
}

export async function savePreferences(
  uid: string | null,
  preferences: ReaderPreferences,
): Promise<ReaderPreferences> {
  const next = clean({ ...preferences, updatedAt: new Date().toISOString() });
  // Las preferencias son del dispositivo: siempre se guardan también aquí.
  localSetPreferences(next);
  if (uid) {
    const { fs, db } = await firestore();
    await fs.setDoc(fs.doc(db, "users", uid, "preferences", "settings"), next);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Perfil y migración al iniciar sesión
// ---------------------------------------------------------------------------

export async function initializeProfile(user: ReaderUser): Promise<void> {
  try {
    const { fs, db } = await firestore();
    const ref = fs.doc(db, "users", user.uid, "profile", "info");
    const snap = await fs.getDoc(ref);
    const now = new Date().toISOString();
    const profile: UserProfile = {
      userId: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      lastLogin: now,
      createdAt: snap.exists() ? ((snap.data() as UserProfile).createdAt ?? now) : now,
    };
    await fs.setDoc(ref, profile);
  } catch {
    // El perfil no es necesario para leer; se reintenta en el próximo inicio.
  }
}

/**
 * Sube a la cuenta lo guardado sin sesión. Los elementos se comparan por `id`
 * (no se duplican ni pisan los de la cuenta); el progreso gana el más reciente;
 * las preferencias locales solo se suben si la cuenta no tiene. Lo subido se
 * borra del navegador. Si algo falla, lo local se conserva para otro intento.
 */
export function migrateLocalToAccount(
  uid: string,
  isStale: () => boolean = () => false,
): Promise<void> {
  // Una migración a la vez: evita que dos corran sobre los mismos datos locales.
  const run = migrationQueue.then(() => migrate(uid, isStale));
  migrationQueue = run.catch(() => undefined);
  return run;
}

let migrationQueue: Promise<void> = Promise.resolve();

/** Solo borra lo local si la sesión sigue siendo la misma que subió los datos. */
async function migrate(uid: string, isStale: () => boolean): Promise<void> {
  try {
    const { fs, db } = await firestore();

    for (const kind of ["highlights", "quotes", "bookmarks"] as const) {
      const local = localList(kind);
      if (local.length === 0) continue;
      const snap = await fs.getDocs(fs.collection(db, "users", uid, kind));
      const remoteIds = new Set(snap.docs.map((d) => d.id));
      const missing = local.filter((item) => item.id && !remoteIds.has(item.id));
      for (let i = 0; i < missing.length; i += 400) {
        const batch = fs.writeBatch(db);
        for (const item of missing.slice(i, i + 400)) {
          batch.set(fs.doc(db, "users", uid, kind, item.id), clean(normalize(kind, item)));
        }
        await batch.commit();
      }
      if (isStale()) return;
      localClear(kind);
    }

    for (const part of PART_NUMBERS) {
      const local = localGetProgress(part);
      if (!local) continue;
      const ref = fs.doc(db, "users", uid, "readingProgress", `part-${part}`);
      const snap = await fs.getDoc(ref);
      const remote = snap.exists() ? (snap.data() as ReadingProgress) : null;
      if (!remote || new Date(local.lastRead) > new Date(remote.lastRead)) {
        await fs.setDoc(ref, clean(local));
      }
      if (isStale()) return;
      localClearProgress(part);
    }

    const localPrefs = localGetPreferences();
    if (localPrefs) {
      const ref = fs.doc(db, "users", uid, "preferences", "settings");
      const snap = await fs.getDoc(ref);
      if (!snap.exists()) await fs.setDoc(ref, clean(localPrefs));
    }
  } catch {
    // Se conserva lo local y se reintenta en el próximo inicio de sesión.
  }
}
