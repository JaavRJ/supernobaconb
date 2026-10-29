import type { Metadata } from "next";
import { Newsletter } from "@/components/admin/newsletter/Newsletter";

export const metadata: Metadata = { title: "Newsletter · Admin" };

export default function AdminNewsletterPage() {
  return <Newsletter />;
}
