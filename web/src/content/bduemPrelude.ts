/** Antesala de cada parte de BDUEM: fragmentos poéticos y fotos, en el orden del sitio original */

export type PreludePiece =
  | { kind: "text"; text: string }
  | { kind: "photo"; src: string; alt: string; rotate: number };

export interface PartPreludeData {
  /** Primera línea del título (ej. "PARTE 1:") */
  label: string;
  /** Nombre de la parte, en la segunda línea */
  name: string;
  pieces: PreludePiece[];
}

const CLOUD = "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto";

/** Giros fijos, repetidos en ciclo: servidor y cliente siempre ven la misma inclinación */
const TILTS = [-4, 3, -2, 5, -3];

/** Intercala fragmentos y fotos (texto, foto, texto, foto…) con el giro fijo de cada foto */
function interleave(part: number, texts: string[], photos: string[]): PreludePiece[] {
  const pieces: PreludePiece[] = [];
  const count = Math.max(texts.length, photos.length);
  for (let i = 0; i < count; i++) {
    if (texts[i]) pieces.push({ kind: "text", text: texts[i] });
    if (photos[i]) {
      pieces.push({
        kind: "photo",
        src: `${CLOUD}/${photos[i]}`,
        alt: `Fotografía en blanco y negro de la Parte ${part}`,
        rotate: TILTS[(part + i) % TILTS.length],
      });
    }
  }
  return pieces;
}

const PRELUDES: Record<number, PartPreludeData> = {
  1: {
    label: "PARTE 1:",
    name: "NEBULOSA",
    pieces: interleave(
      1,
      [
        `(i. cielo estrellado)
pero ser parte de las brillantes
significaba aceptar todo de ellas.
Soledad, lejanía y calor.`,
        `(ii. amaneció más temprano)
y aunque me moleste, el sol y yo somos lo mismo.
Ambos estamos tan cerca de todos en comparación
con la inmensidad del universo, pero a la vez tan
lejos para que alguien nos alcance.`,
        `(iii. canto de aves)
todo sigue, incluso él sentado allí, incluso
el intentando encontrar sentido a la espera.`,
        `(iv. enséñame a cantar)
son tantas cosas que siento que la
escritura no alcanza para contenerlas.`,
        `(v. jamás escuchare un siempre)
se dio cuenta de que el verdadero infierno
no era un lugar de llamas ni de condenas,
sino de eternidad`,
      ],
      [
        "v1763189290/supernoba/IMG_20251113_152021_xzy1ze.png",
        "v1763189290/supernoba/IMG_20251113_154559_ky1mqh.png",
        "v1763189290/supernoba/IMG_20251113_154613_ef2yoz.png",
        "v1763189290/supernoba/IMG_20251113_154901_unwyfp.png",
        "v1763189290/supernoba/IMG_20251113_154642_nudkkb.png",
      ],
    ),
  },
  2: {
    label: "PARTE 2:",
    name: "GIGANTE ROJA",
    pieces: interleave(
      2,
      [
        `(vi. mr. motivación & mrs. creatividad)
porque la motivación sin creatividad es una carrera
sin paisaje, y la creatividad sin motivación
es un paisaje sin pasos.`,
        `(vii. tren de carbón)
no te extraño, extraño que la estación
no fuera inhóspita, sentirme seguro y conocer
hacia donde me llevaban las puertas`,
        `(viii. los televisores adorno)
las palabras existen para expresar todo,
para darle forma al caos.`,
        `(ix. noba con b)
todo lo que lo ha formado se desvanecerá.`,
      ],
      [
        "v1763505974/supernoba/IMG_20251118_112016_ains9u.png",
        "v1763505973/supernoba/IMG_20251118_111521_fqg05n.png",
        "v1765063762/supernoba/IMG_20251206_172038_mp4oq8.png",
        "v1765063762/supernoba/IMG_20251206_172106_kqtg6h.png",
      ],
    ),
  },
  3: {
    label: "PARTE 3:",
    name: "SUPERNOBA",
    pieces: interleave(
      3,
      [
        `(x. merezco despertar)
todo lo que habitó en su mente y que,
poco a poco, terminó perdiéndose
en el silencio.`,
        `(xi. color degradado)
muy grandes para una sola persona,
pero muy insignificantes para el tiempo`,
        `(xii. nido de arañas)
el silencio hace que te escuches a ti mismo`,
        `(xiii. marca de arrastre)
sonido de claveles.
resplandor de raíces.
perfume de sol.`,
      ],
      [
        "v1765063322/supernoba/IMG_20251206_171941_gtcubw.png",
        "v1765063322/supernoba/IMG_20251206_172014_jql8bx.png",
        "v1765760145/supernoba/IMG_20251214_185038_cvsjga.png",
        "v1765760153/supernoba/IMG_20251214_185136_rforir.png",
      ],
    ),
  },
  4: {
    label: "PARTE 4:",
    name: "ENANA BLANCA",
    pieces: interleave(
      4,
      [
        `(xiv. lethephobia)
nadie ve todo. ni siquiera
los que amamos más.`,
        `(xv. el pulsar)
siempre fui fan de las explosiones.
y al final, tuve que convertirme en
una para entenderlo`,
        `(xvi. repintando las constelaciones)
la luz de una estrella muerta
sigue iluminando.`,
      ],
      [
        "v1766454582/supernoba/IMG_20251222_194149_vmyp2z.png",
        "v1766454582/supernoba/IMG_20251222_194226_ycmstx.png",
        "v1766454788/supernoba/IMG_20251222_195015_doigdz.png",
      ],
    ),
  },
};

/** Antesala de una parte, o undefined si no tiene piezas (ej. número fuera de 1 a 4) */
export function getPartPrelude(partNumber: number): PartPreludeData | undefined {
  const prelude = PRELUDES[partNumber];
  return prelude && prelude.pieces.length > 0 ? prelude : undefined;
}
