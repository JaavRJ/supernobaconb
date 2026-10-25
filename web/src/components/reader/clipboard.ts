/** Copia texto al portapapeles; devuelve si se logró (en contextos sin la API se usa un campo temporal) */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(field);
    field.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    field.remove();
    return ok;
  }
}

/** Cita lista para compartir o copiar con su procedencia */
export function quoteWithSource(text: string, partNumber: number): string {
  return `“${text}”\n— Supernoba, BDUEM, Parte ${partNumber}`;
}
