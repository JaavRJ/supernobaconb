import type { Metadata } from "next";
import { PruebaClient } from "./PruebaClient";

export const metadata: Metadata = {
  title: "Prueba del reproductor",
  robots: { index: false },
};

export default function ReproductorPruebaPage() {
  return <PruebaClient />;
}
