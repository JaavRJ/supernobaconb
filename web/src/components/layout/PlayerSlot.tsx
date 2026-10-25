import { MiniPlayer } from "@/components/player/MiniPlayer";
import styles from "./PlayerSlot.module.css";

/** Contenedor fijo del reproductor persistente; el mini reproductor solo aparece si hay cola */
export function PlayerSlot() {
  return (
    <div id="reproductor" role="region" className={styles.slot} aria-label="Reproductor">
      <MiniPlayer />
    </div>
  );
}
