/** Copia profunda sin campos `undefined` (Firestore los rechaza). */
export function withoutUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.filter((v) => v !== undefined).map((v) => withoutUndefined(v)) as T;
  }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) out[k] = withoutUndefined(v);
    }
    return out as T;
  }
  return value;
}
