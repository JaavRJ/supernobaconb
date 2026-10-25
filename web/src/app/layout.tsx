import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Supernoba",
  description: "Sitio oficial de Supernoba: música, libros y proyectos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
