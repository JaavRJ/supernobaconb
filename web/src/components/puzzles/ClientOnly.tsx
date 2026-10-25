"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};

/** Renderiza a los hijos solo en el navegador (el puzzle usa azar al montarse) */
export function ClientOnly({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  return mounted ? children : null;
}
