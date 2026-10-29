/**
 * Lista de avisos (newsletter), compatible con el sitio viejo: `subscribers/{uid}`
 * con `userId`, `email`, `displayName`, `subscribedAt`, `calendarAdded` y `notifyFor`.
 * El sitio nuevo agrega `interests`. Las reglas solo dejan leer y escribir el propio documento.
 *
 * Firebase se importa dinámicamente y solo en el navegador.
 */

export interface Subscription {
  userId: string;
  email: string;
  displayName: string;
  /** ISO */
  subscribedAt: string;
  calendarAdded: boolean;
  /** Avisos pedidos: "parte3" en el sitio viejo, "novedades" en el nuevo */
  notifyFor: string[];
  interests: string[];
}

export interface Subscriber {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const NOTIFY_ALL = "novedades";
const INTEREST_BOOK = "libro";

async function firestore() {
  const [fs, { getDb }] = await Promise.all([import("firebase/firestore"), import("@/lib/firebase")]);
  return { fs, db: getDb() };
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

function toSubscription(uid: string, data: Record<string, unknown>): Subscription {
  return {
    userId: typeof data.userId === "string" ? data.userId : uid,
    email: typeof data.email === "string" ? data.email : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    subscribedAt: typeof data.subscribedAt === "string" ? data.subscribedAt : "",
    calendarAdded: data.calendarAdded === true,
    notifyFor: strings(data.notifyFor),
    interests: strings(data.interests),
  };
}

/** Suscripción de la persona, o `null` si no tiene documento */
export async function getSubscription(uid: string): Promise<Subscription | null> {
  const { fs, db } = await firestore();
  const snap = await fs.getDoc(fs.doc(db, "subscribers", uid));
  return snap.exists() ? toSubscription(uid, snap.data()) : null;
}

/** Quien ya pidió avisos (en cualquiera de los dos sitios) cuenta como suscrito */
export function isSubscribed(subscription: Subscription | null): boolean {
  return Boolean(subscription && (subscription.notifyFor.length > 0 || subscription.interests.length > 0));
}

/** Crea o completa la suscripción sin borrar lo que ya hubiera en el documento */
export async function subscribe(user: Subscriber): Promise<Subscription> {
  const { fs, db } = await firestore();
  const ref = fs.doc(db, "subscribers", user.uid);
  const snap = await fs.getDoc(ref);
  const current = snap.exists() ? toSubscription(user.uid, snap.data()) : null;

  const next: Subscription = {
    userId: user.uid,
    email: user.email ?? current?.email ?? "",
    displayName: user.displayName ?? current?.displayName ?? "",
    subscribedAt: current?.subscribedAt || new Date().toISOString(),
    calendarAdded: current?.calendarAdded ?? false,
    notifyFor: [...new Set([...(current?.notifyFor ?? []), NOTIFY_ALL])],
    interests: [...new Set([...(current?.interests ?? []), INTEREST_BOOK])],
  };
  await fs.setDoc(ref, next, { merge: true });
  return next;
}
