import type { Video } from "@/types/content";
import { tracks } from "./tracks";

/** URL de YouTube de una canción, tomada de sus links para no duplicarla */
function youtubeUrl(trackId: string): string {
  const url = tracks.find((t) => t.id === trackId)?.links.find((l) => l.platform === "youtube")?.url;
  if (!url) throw new Error(`videos: la canción "${trackId}" no tiene video de YouTube`);
  return url;
}

/** Videoclips, el más nuevo primero */
export const videos: Video[] = [
  {
    id: "part3",
    title: "part3",
    url: youtubeUrl("part3"),
    workId: "nohablobien-part3",
    trackId: "part3",
    date: "2026-06-04",
  },
  {
    id: "nohablobien",
    title: "nohablobien",
    url: youtubeUrl("nohablobien"),
    workId: "nohablobien-part3",
    trackId: "nohablobien",
    date: "2026-06-04",
  },
  {
    id: "rulos",
    title: "Rulos",
    url: youtubeUrl("rulos"),
    workId: "rulos",
    trackId: "rulos",
    date: "2026-03-13",
  },
];
