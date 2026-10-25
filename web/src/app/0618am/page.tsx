import { ClientOnly } from "@/components/puzzles/ClientOnly";
import { CuadraticoPuzzle } from "@/components/puzzles/CuadraticoPuzzle";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra } from "@/content";

export const metadata = {
  title: "supernoba.org",
  robots: { index: false, follow: false },
};

export default function CuadraticoPage() {
  const era = getEra("bduem");
  if (!era) throw new Error("Falta la era bduem en @/content");
  return (
    <EraTheme era={era}>
      <main>
        <ClientOnly>
          <CuadraticoPuzzle />
        </ClientOnly>
      </main>
    </EraTheme>
  );
}
