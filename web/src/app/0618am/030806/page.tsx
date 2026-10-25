import { ConstellationPuzzle } from "@/components/puzzles/ConstellationPuzzle";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra } from "@/content";

export const metadata = {
  title: "Arma la constelación",
  robots: { index: false, follow: false },
};

export default function ConstelacionPage() {
  const era = getEra("bduem");
  if (!era) throw new Error("Falta la era bduem en @/content");
  return (
    <EraTheme era={era}>
      <main>
        <ConstellationPuzzle />
      </main>
    </EraTheme>
  );
}
