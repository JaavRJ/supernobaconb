import type { Photo } from "@/types/content";

const CLOUD = "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto";

/** Foto del libro en Cloudinary, en blanco y negro; `part` solo para su texto alternativo */
function libro(path: string, width: number, height: number, part: number): Photo {
  return {
    id: path.split("/").pop()!.replace(".png", ""),
    src: `${CLOUD}/${path}`,
    width,
    height,
    alt: `Fotografía en blanco y negro de la Parte ${part}`,
    source: "libro",
  };
}

/** Galería: el retrato primero y después las demás en un orden fijo */
export const photos: Photo[] = [
  {
    id: "retrato",
    src: "/fotos/retrato.webp",
    width: 1076,
    height: 1434,
    alt: "Retrato de Javier, Supernoba, en blanco y negro, con una estrella dibujada en la mejilla",
    source: "kit",
  },
  libro("v1763189290/supernoba/IMG_20251113_152021_xzy1ze.png", 1184, 864, 1),
  libro("v1763505974/supernoba/IMG_20251118_112016_ains9u.png", 864, 1184, 2),
  libro("v1765063322/supernoba/IMG_20251206_171941_gtcubw.png", 1344, 768, 3),
  {
    id: "farol",
    src: "/fotos/farol.webp",
    width: 519,
    height: 711,
    alt: "Un farol encendido sobre un muro, de noche",
    source: "kit",
  },
  libro("v1766454582/supernoba/IMG_20251222_194149_vmyp2z.png", 1200, 896, 4),
  libro("v1763189290/supernoba/IMG_20251113_154559_ky1mqh.png", 1184, 864, 1),
  libro("v1763505973/supernoba/IMG_20251118_111521_fqg05n.png", 1184, 864, 2),
  libro("v1765063322/supernoba/IMG_20251206_172014_jql8bx.png", 768, 1344, 3),
  {
    id: "arbol",
    src: "/fotos/arbol.webp",
    width: 592,
    height: 432,
    alt: "Un ave entre ramas sin hojas",
    source: "kit",
  },
  libro("v1766454582/supernoba/IMG_20251222_194226_ycmstx.png", 1200, 896, 4),
  libro("v1763189290/supernoba/IMG_20251113_154613_ef2yoz.png", 1184, 864, 1),
  libro("v1765063762/supernoba/IMG_20251206_172038_mp4oq8.png", 1200, 896, 2),
  libro("v1765760145/supernoba/IMG_20251214_185038_cvsjga.png", 1200, 896, 3),
  {
    id: "estatua",
    src: "/fotos/estatua.webp",
    width: 519,
    height: 711,
    alt: "Una estatua clásica en blanco y negro con grano",
    source: "kit",
  },
  libro("v1766454788/supernoba/IMG_20251222_195015_doigdz.png", 1200, 896, 4),
  libro("v1763189290/supernoba/IMG_20251113_154901_unwyfp.png", 1184, 864, 1),
  libro("v1765063762/supernoba/IMG_20251206_172106_kqtg6h.png", 1200, 896, 2),
  libro("v1765760153/supernoba/IMG_20251214_185136_rforir.png", 868, 1199, 3),
  libro("v1763505974/supernoba/IMG_20251118_111352_m7qf2r.png", 1184, 864, 2),
  libro("v1763189290/supernoba/IMG_20251113_154642_nudkkb.png", 864, 1184, 1),
];
