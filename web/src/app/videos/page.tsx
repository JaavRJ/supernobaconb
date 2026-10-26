import { getPhotos, getVideos } from "@/content";
import { PhotoGallery } from "@/components/videos/PhotoGallery";
import { VideoList } from "@/components/videos/VideoList";
import styles from "./page.module.css";

export const metadata = {
  title: "Videos",
  description:
    "Los videoclips de Supernoba y fotos del universo de Brillo de una Estrella Muerta.",
};

export default function VideosPage() {
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
        <VideoList videos={getVideos()} />
      </section>

      <section className={styles.section} aria-labelledby="fotos">
        <h2 id="fotos" className={styles.heading}>
          Fotos
        </h2>
        <PhotoGallery photos={getPhotos()} />
      </section>
    </div>
  );
}
