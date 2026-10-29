import { BduemEra } from "@/components/era/BduemEra";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra } from "@/content";
import { content } from "@/lib/content";

export async function generateMetadata() {
  const work = (await content()).getWork("bduem");
  return { title: work?.title };
}

export default async function BduemPage() {
  const work = (await content()).getWork("bduem");
  const era = work ? getEra(work.era) : undefined;
  if (!work || !era) throw new Error("Falta la obra bduem o su era en el contenido");
  return (
    <EraTheme era={era}>
      <BduemEra era={era} />
    </EraTheme>
  );
}
