import type { Metadata } from "next";
import { Cinzel_Decorative, Crimson_Pro, Inter } from "next/font/google";
import { PlayerSlot } from "@/components/layout/PlayerSlot";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-cinzel",
});
const crimson = Crimson_Pro({ subsets: ["latin"], display: "swap", variable: "--font-crimson" });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${cinzel.variable} ${crimson.variable}`}>
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
        <PlayerSlot />
      </body>
    </html>
  );
}
