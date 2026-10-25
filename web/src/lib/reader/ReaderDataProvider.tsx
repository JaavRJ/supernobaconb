"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createProgressWriter,
  defaultPreferences,
  deleteItem,
  getPreferences,
  initializeProfile,
  listItems,
  listProgress,
  migrateLocalToAccount,
  saveItem,
  savePreferences,
} from "./service";
import type {
  Bookmark,
  Highlight,
  ItemKind,
  ItemTypes,
  Quote,
  ReaderPreferences,
  ReaderUser,
  ReadingProgress,
} from "./types";

/**
 * Un solo proveedor para toda la zona de lectura: sesión + datos en memoria.
 * Carga todo (cantidades pequeñas) cuando se resuelve la sesión y cada hook
 * filtra por parte. Las escrituras actualizan la pantalla al instante y luego
 * persisten (Firestore con sesión, localStorage sin ella).
 */

interface AuthValue {
  user: ReaderUser | null;
  /** true mientras Firebase decide si hay sesión. */
  loading: boolean;
  /** Falso si faltan las variables NEXT_PUBLIC_FIREBASE_*. */
  configured: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface DataState {
  highlights: Highlight[];
  quotes: Quote[];
  bookmarks: Bookmark[];
  progress: Record<number, ReadingProgress>;
  preferences: ReaderPreferences;
  /** true cuando los datos ya se cargaron para la sesión actual. */
  ready: boolean;
  /** Mensaje si no se pudieron leer los datos de la cuenta. */
  error: string | null;
}

interface ReaderContextValue {
  auth: AuthValue;
  data: DataState;
  uid: string | null;
  upsert: <K extends ItemKind>(kind: K, item: ItemTypes[K]) => Promise<void>;
  remove: (kind: ItemKind, id: string) => Promise<void>;
  setProgress: (progress: ReadingProgress) => void;
  updatePreferences: (patch: Partial<ReaderPreferences>) => Promise<void>;
}

/**
 * Misma comprobación que `hasFirebaseConfig()` de `@/lib/firebase`, repetida
 * aquí para no cargar el SDK de Firebase en el render inicial. Next solo
 * incrusta las variables referenciadas de forma literal.
 */
function hasFirebaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

const emptyData = (): DataState => ({
  highlights: [],
  quotes: [],
  bookmarks: [],
  progress: {},
  preferences: defaultPreferences(),
  ready: false,
  error: null,
});

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((i) => i.id === item.id);
  if (index < 0) return [...items, item];
  const next = [...items];
  next[index] = item;
  return next;
}

export function ReaderDataProvider({ children }: { children: ReactNode }) {
  const configured = hasFirebaseConfig();
  const [user, setUser] = useState<ReaderUser | null>(null);
  const [authLoading, setAuthLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataState>(emptyData);
  const uid = user?.uid ?? null;

  const uidRef = useRef<string | null>(null);
  const prefsRef = useRef<ReaderPreferences>(data.preferences);
  useEffect(() => {
    uidRef.current = uid;
    prefsRef.current = data.preferences;
  }, [uid, data.preferences]);
  const writer = useRef<ReturnType<typeof createProgressWriter> | null>(null);

  // Sesión: Firebase Auth se importa solo en el navegador.
  useEffect(() => {
    if (!configured) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      try {
        const [{ onAuthStateChanged }, { getFirebaseAuth }] = await Promise.all([
          import("firebase/auth"),
          import("@/lib/firebase"),
        ]);
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
          setUser(
            u
              ? {
                  uid: u.uid,
                  displayName: u.displayName,
                  email: u.email,
                  photoURL: u.photoURL,
                }
              : null,
          );
          setAuthLoading(false);
        });
      } catch {
        setAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [configured]);

  // Datos: al resolverse la sesión (o cambiar de cuenta) se migra y se carga.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    void (async () => {
      try {
        if (user) {
          await initializeProfile(user);
          await migrateLocalToAccount(user.uid, () => cancelled);
        }
        if (cancelled) return;
        const [highlights, quotes, bookmarks, progressList, preferences] =
          await Promise.all([
            listItems("highlights", uid),
            listItems("quotes", uid),
            listItems("bookmarks", uid),
            listProgress(uid),
            getPreferences(uid),
          ]);
        if (cancelled) return;
        setData({
          highlights,
          quotes,
          bookmarks,
          progress: Object.fromEntries(progressList.map((p) => [p.partNumber, p])),
          preferences,
          ready: true,
          error: null,
        });
      } catch {
        if (cancelled) return;
        setData({
          ...emptyData(),
          ready: true,
          error: "No se pudieron cargar tus datos de lectura. Revisa tu conexión e inténtalo de nuevo.",
        });
      }
    })();
    return () => {
      cancelled = true;
      // Nada del usuario anterior se muestra ni se escribe con la cuenta nueva.
      setData(emptyData());
    };
    // `user` y `uid` cambian juntos; basta con reaccionar al uid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, uid]);

  // Progreso: se escribe lo pendiente al ocultar la pestaña y al desmontar.
  useEffect(() => {
    const w = createProgressWriter();
    writer.current = w;
    const onHide = () => {
      if (document.visibilityState === "hidden") w.flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", w.flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", w.flush);
      w.flush();
      writer.current = null;
    };
  }, []);

  // Al cambiar de cuenta se escribe lo pendiente a nombre de la cuenta anterior.
  useEffect(() => () => writer.current?.flush(), [uid]);

  const signIn = useCallback(async () => {
    setError(null);
    if (!configured) {
      setError("El inicio de sesión no está disponible por ahora.");
      return;
    }
    try {
      const [{ signInWithPopup }, { getFirebaseAuth, getGoogleProvider }] =
        await Promise.all([import("firebase/auth"), import("@/lib/firebase")]);
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      setError(
        code === "auth/popup-blocked"
          ? "El navegador bloqueó la ventana. Permite las ventanas emergentes e inténtalo de nuevo."
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    }
  }, [configured]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      writer.current?.flush();
      const [{ signOut: fbSignOut }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase"),
      ]);
      await fbSignOut(getFirebaseAuth());
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }, []);

  const upsert = useCallback(
    async <K extends ItemKind>(kind: K, item: ItemTypes[K]) => {
      const owner = uidRef.current;
      const saved = await saveItem(kind, owner, item);
      if (uidRef.current !== owner) return;
      setData((d) => ({ ...d, [kind]: upsertById(d[kind] as { id: string }[], saved) }));
    },
    [],
  );

  const remove = useCallback(async (kind: ItemKind, id: string) => {
    const owner = uidRef.current;
    await deleteItem(kind, owner, id);
    if (uidRef.current !== owner) return;
    setData((d) => ({ ...d, [kind]: d[kind].filter((i) => i.id !== id) }));
  }, []);

  const setProgress = useCallback((progress: ReadingProgress) => {
    setData((d) => ({
      ...d,
      progress: { ...d.progress, [progress.partNumber]: progress },
    }));
    writer.current?.schedule(uidRef.current, progress);
  }, []);

  const updatePreferences = useCallback(async (patch: Partial<ReaderPreferences>) => {
    const merged = { ...prefsRef.current, ...patch, hasConfigured: true };
    prefsRef.current = merged;
    setData((d) => ({ ...d, preferences: merged }));
    await savePreferences(uidRef.current, merged);
  }, []);

  const auth = useMemo<AuthValue>(
    () => ({ user, loading: authLoading, configured, error, signIn, signOut }),
    [user, authLoading, configured, error, signIn, signOut],
  );

  const value = useMemo<ReaderContextValue>(
    () => ({ auth, data, uid, upsert, remove, setProgress, updatePreferences }),
    [auth, data, uid, upsert, remove, setProgress, updatePreferences],
  );

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>;
}

function useReaderContext(): ReaderContextValue {
  const ctx = useContext(ReaderContext);
  if (!ctx) {
    throw new Error("Falta <ReaderDataProvider> arriba de este componente.");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Hooks públicos
// ---------------------------------------------------------------------------

/** Sesión actual y acciones. Sin Firebase configurado: sin sesión y `signIn` da error manejado. */
export function useAuth(): AuthValue {
  return useReaderContext().auth;
}

/** Hora ISO y un id únicos para crear elementos nuevos. */
function newItemId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useHighlights(part?: number) {
  const { data, upsert, remove } = useReaderContext();
  const items = useMemo(
    () => (part === undefined ? data.highlights : data.highlights.filter((h) => h.partNumber === part)),
    [data.highlights, part],
  );
  const save = useCallback(
    (h: Omit<Highlight, "id" | "createdAt"> & Partial<Pick<Highlight, "id" | "createdAt">>) =>
      upsert("highlights", { ...h, id: h.id ?? newItemId(), createdAt: h.createdAt ?? new Date().toISOString() }),
    [upsert],
  );
  const del = useCallback((id: string) => remove("highlights", id), [remove]);
  return { highlights: items, ready: data.ready, error: data.error, save, remove: del };
}

export function useQuotes(part?: number) {
  const { data, upsert, remove } = useReaderContext();
  const items = useMemo(
    () => (part === undefined ? data.quotes : data.quotes.filter((q) => q.partNumber === part)),
    [data.quotes, part],
  );
  const save = useCallback(
    (q: Omit<Quote, "id" | "createdAt"> & Partial<Pick<Quote, "id" | "createdAt">>) =>
      upsert("quotes", { ...q, id: q.id ?? newItemId(), createdAt: q.createdAt ?? new Date().toISOString() }),
    [upsert],
  );
  const del = useCallback((id: string) => remove("quotes", id), [remove]);
  return { quotes: items, ready: data.ready, error: data.error, save, remove: del };
}

export function useBookmarks(part?: number) {
  const { data, upsert, remove } = useReaderContext();
  const items = useMemo(
    () => (part === undefined ? data.bookmarks : data.bookmarks.filter((b) => b.partNumber === part)),
    [data.bookmarks, part],
  );
  const save = useCallback(
    (b: Omit<Bookmark, "id" | "createdAt"> & Partial<Pick<Bookmark, "id" | "createdAt">>) =>
      upsert("bookmarks", { ...b, id: b.id ?? newItemId(), createdAt: b.createdAt ?? new Date().toISOString() }),
    [upsert],
  );
  const del = useCallback((id: string) => remove("bookmarks", id), [remove]);
  return { bookmarks: items, ready: data.ready, error: data.error, save, remove: del };
}

/** Progreso de una parte; `update` escribe con espera (2 s), no en cada scroll. */
export function useReadingProgress(part: number) {
  const { data, setProgress } = useReaderContext();
  const progress = data.progress[part] ?? null;
  const update = useCallback(
    (position: { chapterIndex: number; progress: number; completed?: boolean }) =>
      setProgress({
        partNumber: part,
        scrollPosition: 0,
        lastRead: new Date().toISOString(),
        completed: position.completed ?? false,
        chapterIndex: position.chapterIndex,
        progress: Math.min(1, Math.max(0, position.progress)),
      }),
    [part, setProgress],
  );
  return { progress, ready: data.ready, update };
}

export function usePreferences() {
  const { data, updatePreferences } = useReaderContext();
  return { preferences: data.preferences, ready: data.ready, update: updatePreferences };
}
