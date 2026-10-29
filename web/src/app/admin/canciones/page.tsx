import type { Metadata } from "next";
import { CancionesAdmin } from "@/components/admin/canciones/CancionesAdmin";

export const metadata: Metadata = { title: "Canciones · Admin" };

export default function AdminCancionesPage() {
  return <CancionesAdmin />;
}
