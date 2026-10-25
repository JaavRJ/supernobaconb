import type {
  ItemKind,
  ItemTypes,
  ReaderPreferences,
  ReadingProgress,
} from "./types";

/** Mismas claves de localStorage que el sitio viejo. */
const PREFERENCES_KEY = "userPreferences";
const progressKey = (part: number) => `reading-progress-part-${part}`;
export const PART_NUMBERS = [1, 2, 3, 4] as const;

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Almacenamiento lleno o bloqueado: el dato solo vive en memoria.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Sin acceso al almacenamiento: no hay nada que borrar.
  }
}

export function localList<K extends ItemKind>(kind: K): ItemTypes[K][] {
  const data = read<ItemTypes[K][]>(kind);
  return Array.isArray(data) ? data : [];
}

export function localSave<K extends ItemKind>(kind: K, item: ItemTypes[K]): void {
  const items = localList(kind);
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) items[index] = item;
  else items.push(item);
  write(kind, items);
}

export function localDelete(kind: ItemKind, id: string): void {
  write(
    kind,
    localList(kind).filter((i) => i.id !== id),
  );
}

export function localClear(kind: ItemKind): void {
  remove(kind);
}

export function localGetProgress(part: number): ReadingProgress | null {
  return read<ReadingProgress>(progressKey(part));
}

export function localSetProgress(progress: ReadingProgress): void {
  write(progressKey(progress.partNumber), progress);
}

export function localClearProgress(part: number): void {
  remove(progressKey(part));
}

export function localGetPreferences(): ReaderPreferences | null {
  return read<ReaderPreferences>(PREFERENCES_KEY);
}

export function localSetPreferences(preferences: ReaderPreferences): void {
  write(PREFERENCES_KEY, preferences);
}
