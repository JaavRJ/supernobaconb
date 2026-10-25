import type { Metadata } from "next";
import {
  Cinzel,
  Cinzel_Decorative,
  Cormorant_Garamond,
  Inter,
  Uncial_Antiqua,
} from "next/font/google";
import { Backdrop } from "@/components/theme/Backdrop";
import { PlayerProvider } from "@/components/player/PlayerProvider";
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
const cinzelText = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-cinzel-text",
});
const uncial = Uncial_Antiqua({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-uncial",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={[
        inter.variable,
        cinzel.variable,
        cinzelText.variable,
        uncial.variable,
        cormorant.variable,
      ].join(" ")}
    >
      <body>
        <Backdrop variant="cosmos" />
        <PlayerProvider>
          <SkipLink />
          <SiteHeader />
          <main id="contenido">{children}</main>
          <SiteFooter />
          <PlayerSlot />
        </PlayerProvider>
      </body>
    </html>
  );
}
