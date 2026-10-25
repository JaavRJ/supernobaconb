import { ComingSoon } from "@/components/placeholder/ComingSoon";
import { EraTheme } from "@/components/theme/EraTheme";
import { getEra, getWork } from "@/content";

const work = getWork("bduem");

export const metadata = { title: work?.title };

export default function BduemPage() {
  if (!work) throw new Error("Falta la obra bduem en @/content");
  return (
    <EraTheme era={getEra(work.era) ?? null}>
      <ComingSoon title={work.title} eyebrow="noba · libro" />
    </EraTheme>
  );
}
