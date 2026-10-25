import { BduemEra } from "@/components/era/BduemEra";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra, getWork } from "@/content";

const work = getWork("bduem");

export const metadata = { title: work?.title };

export default function BduemPage() {
  const era = work ? getEra(work.era) : undefined;
  if (!work || !era) throw new Error("Falta la obra bduem o su era en @/content");
  return (
    <EraTheme era={era}>
      <BduemEra era={era} />
    </EraTheme>
  );
}
