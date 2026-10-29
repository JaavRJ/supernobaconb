import type { Metadata } from "next";
import { Importar } from "@/components/admin/importar/Importar";

export const metadata: Metadata = { title: "Importar · Admin" };

export default function AdminImportarPage() {
  return <Importar />;
}
