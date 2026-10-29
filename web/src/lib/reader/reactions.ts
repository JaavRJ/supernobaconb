/**
 * Reacciones por capítulo, compatibles con el sitio viejo:
 * - `reactions/{parte}_{capítulo}` con los contadores heart, sad, mind_blown y star.
 * - `userReactions/{userId}_{parte}_{capítulo}` con `{ reaction }`.
 *
 * El capítulo es el índice dentro de la parte, empezando en 0. El `KindleReader` viejo
 * usaba `currentChapterIndex` (posición en el arreglo de capítulos de la parte, desde 0;
 * el desplazamiento global solo servía para mostrar el número), y el lector nuevo usa
 * `chapter.index`, que sale del mismo orden. Son el mismo número para el mismo capítulo.
 *
 * Firebase se importa dinámicamente y solo en el navegador.
 */

export type ReactionType = "heart" | "sad" | "mind_blown" | "star";

export type ReactionCounts = Record<ReactionType, number>;

export const REACTION_TYPES: ReactionType[] = ["heart", "sad", "mind_blown", "star"];

export const EMPTY_COUNTS: ReactionCounts = { heart: 0, sad: 0, mind_blown: 0, star: 0 };

const USER_ID_KEY = "userId";

/** Mismo id local que el sitio viejo: quien ya reaccionó allí conserva su reacción. */
export function getReactionUserId(): string {
  try {
    let id = window.localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      window.localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch {
    // Almacenamiento bloqueado: id solo para esta visita.
    return `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

async function firestore() {
  const [fs, { getDb }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase"),
  ]);
  return { fs, db: getDb() };
}

function toCounts(data: Record<string, unknown> | undefined): ReactionCounts {
  const counts = { ...EMPTY_COUNTS };
  for (const type of REACTION_TYPES) {
    const value = data?.[type];
    if (typeof value === "number" && value > 0) counts[type] = value;
  }
  return counts;
}

/**
 * Conteos y reacción propia en vivo. Devuelve la función que cancela ambas
 * suscripciones. `onError` se llama si Firebase no responde o no hay permiso.
 */
export function subscribeToChapterReactions(
  userId: string,
  part: number,
  chapter: number,
  onData: (counts: ReactionCounts, mine: ReactionType | null) => void,
  onError: () => void,
): () => void {
  let cancelled = false;
  let stops: (() => void)[] = [];
  let counts: ReactionCounts | null = null;
  let mine: ReactionType | null | undefined;

  const emit = () => {
    if (!cancelled && counts && mine !== undefined) onData(counts, mine);
  };

  void firestore()
    .then(({ fs, db }) => {
      if (cancelled) return;
      const fail = () => {
        if (!cancelled) onError();
      };
      stops = [
        fs.onSnapshot(
          fs.doc(db, "reactions", `${part}_${chapter}`),
          (snap) => {
            counts = toCounts(snap.data());
            emit();
          },
          fail,
        ),
        fs.onSnapshot(
          fs.doc(db, "userReactions", `${userId}_${part}_${chapter}`),
          (snap) => {
            const value = snap.data()?.reaction;
            mine = REACTION_TYPES.includes(value) ? (value as ReactionType) : null;
            emit();
          },
          fail,
        ),
      ];
    })
    .catch(() => {
      if (!cancelled) onError();
    });

  return () => {
    cancelled = true;
    stops.forEach((stop) => stop());
  };
}

/**
 * Elige, cambia o quita la reacción en una sola transacción: la anterior se resta y la
 * nueva se suma (o, al tocar la misma, se resta y se borra el registro del usuario).
 */
export async function setChapterReaction(
  userId: string,
  part: number,
  chapter: number,
  reaction: ReactionType,
): Promise<void> {
  const { fs, db } = await firestore();
  const countsRef = fs.doc(db, "reactions", `${part}_${chapter}`);
  const mineRef = fs.doc(db, "userReactions", `${userId}_${part}_${chapter}`);

  await fs.runTransaction(db, async (tx) => {
    const previous = (await tx.get(mineRef)).data()?.reaction as ReactionType | undefined;
    const hadPrevious = previous !== undefined && REACTION_TYPES.includes(previous);

    // Con merge el documento de conteos se crea solo si aún no existe.
    if (hadPrevious && previous === reaction) {
      tx.set(countsRef, { [reaction]: fs.increment(-1) }, { merge: true });
      tx.delete(mineRef);
      return;
    }
    if (hadPrevious) tx.set(countsRef, { [previous]: fs.increment(-1) }, { merge: true });
    tx.set(countsRef, { [reaction]: fs.increment(1) }, { merge: true });
    tx.set(mineRef, { reaction, timestamp: new Date().toISOString() });
  });
}
