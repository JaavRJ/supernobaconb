import type { Writing } from "@/types/content";

/**
 * Escritos sueltos (letras, poemas, textos). Cada uno lleva dos piezas:
 *  1. Una obra en `works.ts` de la constelación `noba`, con `type: "escrito"`, `href: "/libros/escritos/<id>"`,
 *     `releaseDate` y la `era` del libro del que nace (o la más reciente encendida si no nace de ninguno).
 *  2. Su contenido aquí, unido por `workId`: `body` son estrofas (arreglos de versos) o, en un texto, un párrafo por elemento.
 * Hoy no hay escritos; llegarán con el admin de la Fase 5.
 */
export const writings: Writing[] = [];
