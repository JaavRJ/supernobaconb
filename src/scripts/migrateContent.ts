/**
 * Script de migración de datos hardcodeados a Firebase
 * 
 * Este script migra:
 * - Partes y capítulos de sampleChapters.ts
 * - Notas del autor de authorNotes.ts
 * - PDFs de pdfLinks.ts
 * 
 * IMPORTANTE: Ejecutar solo una vez y con precaución
 */

import { ALL_PARTS } from '../data/sampleChapters';
import { PART_1_NOTES, PART_2_NOTES } from '../data/authorNotes';
import { PDF_LINKS } from '../data/pdfLinks';
import { savePart, saveChapter, saveAuthorNote, savePDFInfo } from '../services/contentService';

export const migrateAllData = async () => {
    try {
        // Migrar partes y capítulos
        await migrateParts();

        // Migrar notas del autor
        await migrateAuthorNotes();

        // Migrar información de PDFs
        await migratePDFs();

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
};

/**
 * Migra partes y capítulos
 */
const migrateParts = async () => {
    for (const part of ALL_PARTS) {

        // Guardar metadata de la parte
        await savePart({
            partNumber: part.partNumber,
            partTitle: part.partTitle,
            description: `Parte ${part.partNumber} del libro Supernoba`
        });

        // Guardar cada capítulo
        for (let i = 0; i < part.chapters.length; i++) {
            const chapter = part.chapters[i];

            await saveChapter(part.partNumber, i, {
                number: chapter.number,
                title: chapter.title,
                content: chapter.content
            });
        }
    }
};

/**
 * Migra notas del autor
 */
const migrateAuthorNotes = async () => {
    const allNotes = [...PART_1_NOTES, ...PART_2_NOTES];

    for (const note of allNotes) {
        await saveAuthorNote({
            id: note.id,
            partNumber: note.partNumber,
            chapterIndex: note.chapterIndex,
            triggerText: note.triggerText,
            noteTitle: note.noteTitle,
            noteContent: note.noteContent,
            type: note.type
        });
    }
};

/**
 * Migra información de PDFs
 */
const migratePDFs = async () => {
    for (const pdf of PDF_LINKS) {
        await savePDFInfo({
            partNumber: pdf.partNumber,
            pdfUrl: pdf.pdfUrl,
            filename: pdf.filename
        });
    }
};

/**
 * Función helper para ejecutar la migración desde la consola del navegador
 */
export const runMigration = async () => {
    if (!window.confirm(
        '⚠️ ADVERTENCIA ⚠️\n\n' +
        'Esto migrará todos los datos hardcodeados a Firebase.\n' +
        'Esta acción puede sobrescribir datos existentes.\n\n' +
        '¿Estás seguro de continuar?'
    )) {
        return;
    }

    try {
        await migrateAllData();
    } catch (error) {
        console.error('Error en la migración:', error);
    }
};

// Exportar para uso en consola
if (typeof window !== 'undefined') {
    (window as any).runMigration = runMigration;
}
