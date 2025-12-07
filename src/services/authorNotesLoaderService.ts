/**
 * Service para cargar notas del autor
 * Lee de Firebase primero, usa datos locales como fallback
 */

import { getAllAuthorNotes } from '../services/contentService';
import { PART_1_NOTES, PART_2_NOTES, type AuthorNote } from '../data/authorNotes';

// Re-export AuthorNote type
export type { AuthorNote };

/**
 * Obtiene todas las notas del autor para una parte y capítulo específicos
 * Intenta leer de Firebase primero, si falla usa datos locales
 */
export async function getAuthorNotesForChapter(
    partNumber: number,
    chapterIndex: number
): Promise<AuthorNote[]> {
    try {
        // Intentar cargar de Firebase
        const allNotes = await getAllAuthorNotes();
        const filteredNotes = allNotes.filter(
            note => note.partNumber === partNumber && note.chapterIndex === chapterIndex
        );

        if (filteredNotes.length > 0) {
            console.log(`✅ Notas cargadas desde Firebase para Parte ${partNumber}, Capítulo ${chapterIndex}`);
            return filteredNotes;
        }

        // Si no hay datos en Firebase, usar datos locales
        console.log(`⚠️ No hay notas en Firebase, usando datos locales para Parte ${partNumber}, Capítulo ${chapterIndex}`);
        return getLocalNotes(partNumber, chapterIndex);
    } catch (error) {
        console.error(`❌ Error cargando notas de Firebase, usando datos locales:`, error);
        return getLocalNotes(partNumber, chapterIndex);
    }
}

/**
 * Obtiene todas las notas del autor (todas las partes)
 */
export async function getAllNotes(): Promise<AuthorNote[]> {
    try {
        // Intentar cargar de Firebase
        const notes = await getAllAuthorNotes();

        if (notes.length > 0) {
            console.log(`✅ Todas las notas cargadas desde Firebase (${notes.length} notas)`);
            return notes;
        }

        // Si no hay datos en Firebase, usar datos locales
        console.log(`⚠️ No hay notas en Firebase, usando datos locales`);
        return getAllLocalNotes();
    } catch (error) {
        console.error(`❌ Error cargando notas de Firebase, usando datos locales:`, error);
        return getAllLocalNotes();
    }
}

/**
 * Obtiene notas de los datos locales (fallback)
 */
function getLocalNotes(partNumber: number, chapterIndex: number): AuthorNote[] {
    const allLocalNotes = getAllLocalNotes();
    return allLocalNotes.filter(
        note => note.partNumber === partNumber && note.chapterIndex === chapterIndex
    );
}

/**
 * Obtiene todas las notas locales
 */
function getAllLocalNotes(): AuthorNote[] {
    return [...PART_1_NOTES, ...PART_2_NOTES];
}

/**
 * Aplica las notas del autor al HTML del capítulo
 * Convierte el texto trigger en elementos clickeables
 */
export function applyAuthorNotesToHTML(
    html: string,
    notes: AuthorNote[]
): string {
    let processedHTML = html;

    notes.forEach((note) => {
        // Escapar el texto para regex
        const escapedText = escapeRegExp(note.triggerText);

        // Crear regex que ignore tags HTML entre palabras
        // Esto permite encontrar texto que esté fragmentado en diferentes tags
        const flexiblePattern = escapedText
            .split(/\s+/)
            .map(word => escapeRegExp(word))
            .join('\\s*(?:<[^>]+>)?\\s*');

        const regex = new RegExp(`(${flexiblePattern})`, 'gi');

        const replacement = `<span class="author-note-trigger" data-note-id="${note.id}" data-note-type="${note.type}">$1</span>`;

        processedHTML = processedHTML.replace(regex, replacement);
    });

    return processedHTML;
}

/**
 * Escapa caracteres especiales de regex
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Verifica si hay notas en Firebase
 */
export async function hasFirebaseNotes(): Promise<boolean> {
    try {
        const notes = await getAllAuthorNotes();
        return notes.length > 0;
    } catch (error) {
        return false;
    }
}
