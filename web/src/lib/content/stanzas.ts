/**
 * Firestore no admite arreglos dentro de arreglos, así que las letras (`Track.lyrics`) y los escritos
 * (`Writing.body`) se guardan como texto: una línea por verso (o párrafo) y una línea en blanco entre estrofas.
 * Puro y sin dependencias de servidor, para que lo use también el admin.
 */

export function stanzasToText(stanzas: readonly (readonly string[])[]): string {
  return stanzas.map((s) => s.join("\n")).join("\n\n");
}

export function textToStanzas(text: string): string[][] {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.trim() !== ""),
    )
    .filter((stanza) => stanza.length > 0);
}
