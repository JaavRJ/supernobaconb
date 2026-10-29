import { content } from "@/lib/content";
import { PhotoGallery } from "@/components/videos/PhotoGallery";
import { VideoList } from "@/components/videos/VideoList";
import styles from "./page.module.css";

export const metadata = {
  title: "Videos",
  description:
    "Los videoclips de Supernoba y fotos del universo de Brillo de una Estrella Muerta.",
};

export default async function VideosPage() {
  const c = await content();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Videos</h1>
        <p className={styles.tagline}>videoclips y fotos</p>
      </header>

      <section className={styles.section} aria-labelledby="videoclips">
        <h2 id="videoclips" className={styles.heading}>
          Videoclips
        </h2>
        <VideoList videos={c.videos} />
      </section>

      <section className={styles.section} aria-labelledby="fotos">
        <h2 id="fotos" className={styles.heading}>
          Fotos
        </h2>
        <PhotoGallery photos={c.photos} />
      </section>
    </div>
  );
}
