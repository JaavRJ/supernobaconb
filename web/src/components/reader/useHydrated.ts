import { useSyncExternalStore } from "react";

const noop = () => () => undefined;

/** false al renderizar en el servidor y durante la hidratación; true después. Evita desajustes con datos del navegador */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
