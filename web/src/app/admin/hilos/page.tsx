import type { Metadata } from "next";
import { HilosAdmin } from "@/components/admin/hilos/HilosAdmin";

export const metadata: Metadata = { title: "Hilos y nebulosa · Admin" };

export default function AdminHilosPage() {
  return <HilosAdmin />;
}
